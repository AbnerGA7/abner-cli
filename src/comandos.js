import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { p, pc, seguro, fallar, etiquetaArchivo, pedirMensaje } from './ui.js';
import {
  git, sh, existe, esRepo, ramaActual, remoto, tieneCommits, cambios, pendientesDeSubir,
} from './git.js';

const IGNORAR = ['node_modules/', '.env', '.env.*', '!.env.example', 'dist/', 'build/', '.DS_Store', 'Thumbs.db', '*.log'];
const SENSIBLES = /(^|\/)(\.env(\..*)?|.*\.pem|.*\.key|id_rsa.*|credentials.*\.json)$/i;

function exigirGit() {
  if (!existe('git')) fallar('Git no está instalado.', 'Descárgalo en https://git-scm.com y vuelve a intentarlo.');
}

function exigirRepo() {
  exigirGit();
  if (!esRepo()) fallar('Esta carpeta todavía no es un proyecto Git.', 'Ejecuta  abner nuevo  primero.');
}

async function revisarIdentidad() {
  if (git('config', 'user.name').out) return;
  p.log.warn('Git aún no sabe quién eres. Solo se pregunta una vez.');
  const n = seguro(await p.text({ message: 'Tu nombre', validate: (v) => (v.trim() ? undefined : 'Requerido') }));
  const e = seguro(await p.text({ message: 'Tu email (el de GitHub)', validate: (v) => (v.includes('@') ? undefined : 'Email no válido') }));
  git('config', '--global', 'user.name', n.trim());
  git('config', '--global', 'user.email', e.trim());
  p.log.success(`Listo, ${n.trim()}.`);
}

function asegurarGitignore() {
  const ruta = '.gitignore';
  const actual = existsSync(ruta) ? readFileSync(ruta, 'utf8') : '';
  const faltan = IGNORAR.filter((l) => !actual.split(/\r?\n/).includes(l));
  if (!faltan.length) return;
  if (actual) appendFileSync(ruta, `${actual.endsWith('\n') ? '' : '\n'}${faltan.join('\n')}\n`);
  else writeFileSync(ruta, `${faltan.join('\n')}\n`);
  p.log.info(`.gitignore ${actual ? 'actualizado' : 'creado'}: no se subirán node_modules ni archivos .env`);
}

async function avisarSensibles(archivos) {
  const peligrosos = archivos.filter((a) => SENSIBLES.test(a.archivo));
  if (!peligrosos.length) return archivos;
  p.log.warn(pc.yellow('Estos archivos parecen tener contraseñas o claves:\n') + peligrosos.map((a) => `  ${a.archivo}`).join('\n'));
  const incluir = seguro(await p.confirm({ message: '¿Seguro que quieres subirlos?', initialValue: false }));
  return incluir ? archivos : archivos.filter((a) => !peligrosos.includes(a));
}

function commitear(mensaje, archivos) {
  const add = git('add', '-A', '--', ...archivos);
  if (!add.ok) fallar('No se pudieron preparar los archivos.', add.err);
  const c = git('commit', '-m', mensaje);
  if (!c.ok) fallar('El commit falló.', c.err || c.out);
}

function subir() {
  const rama = ramaActual();
  const s = p.spinner();
  if (git('ls-remote', '--exit-code', '--heads', 'origin', rama).ok) {
    s.start('Trayendo cambios de GitHub primero');
    let pull = git('pull', '--rebase', '--autostash', 'origin', rama);
    if (!pull.ok) {
      // el rebase falla con historiales que ya tienen merges: probamos un merge normal
      git('rebase', '--abort');
      pull = git('pull', '--no-rebase', '--no-edit', 'origin', rama);
    }
    if (!pull.ok) {
      s.stop(pc.red('Hay conflictos con lo que está en GitHub'));
      git('merge', '--abort');
      fallar('Tus commits están a salvo en tu computadora.', 'Alguien cambió los mismos archivos. Resuelve con  git pull  y vuelve a ejecutar abner.');
    }
    s.stop('Al día con GitHub');
  }
  s.start(`Subiendo a ${pc.cyan(rama)}`);
  const push = git('push', '-u', 'origin', rama);
  if (!push.ok) {
    s.stop(pc.red('No se pudo subir'));
    fallar('GitHub rechazó el envío.', push.err);
  }
  s.stop(pc.green(`Subido a GitHub (${rama})`));
}

// ───────────────────────── comandos ─────────────────────────

export async function nuevo() {
  console.clear();
  p.intro(pc.bgMagenta(pc.black(' abner nuevo ')));
  exigirGit();
  await revisarIdentidad();

  if (!esRepo()) {
    git('init', '-b', 'main');
    p.log.success('Proyecto Git creado (rama main)');
  }
  asegurarGitignore();

  const archivos = await avisarSensibles(cambios());
  if (archivos.length) {
    const mensaje = await pedirMensaje(tieneCommits() ? '' : 'primer commit');
    commitear(mensaje, archivos.map((a) => a.archivo));
    p.log.success(`Commit creado: ${pc.dim(mensaje)}`);
  }

  const actual = remoto();
  if (actual) {
    const cambiar = seguro(await p.confirm({ message: `Ya está enlazado a ${pc.cyan(actual)}. ¿Enlazar a otro?`, initialValue: false }));
    if (!cambiar) {
      if (tieneCommits()) subir();
      return p.outro(pc.green('¡Todo arriba! 🚀'));
    }
    git('remote', 'remove', 'origin');
  }

  if (!tieneCommits()) return p.outro('Proyecto creado. Agrega archivos y ejecuta  abner nuevo  otra vez para subirlo.');

  const donde = seguro(await p.select({
    message: '¿Dónde lo subimos?',
    options: [
      { value: 'crear', label: 'Crear un repo nuevo en GitHub', hint: 'usa GitHub CLI' },
      { value: 'enlazar', label: 'Enlazar a un repo que ya existe', hint: 'pegas el link' },
      { value: 'nada', label: 'Por ahora solo en mi computadora' },
    ],
  }));

  if (donde === 'crear') await crearEnGitHub();
  if (donde === 'enlazar') {
    const url = seguro(await p.text({
      message: 'Link del repo',
      placeholder: 'https://github.com/usuario/proyecto.git',
      validate: (v) => (/^(https:\/\/|git@)/.test(v.trim()) ? undefined : 'Debe empezar con https:// o git@'),
    }));
    git('remote', 'add', 'origin', url.trim());
    subir();
  }
  p.outro(pc.green('¡Proyecto listo! 🚀'));
}

// Instaladores de GitHub CLI por sistema: [programa, argumentos]
const INSTALAR_GH = {
  win32: ['winget', ['install', '--id', 'GitHub.cli', '-e', '--accept-source-agreements', '--accept-package-agreements']],
  darwin: ['brew', ['install', 'gh']],
  linux: ['sudo', ['apt', 'install', '-y', 'gh']],
};

function rutaGhWindows() {
  // winget no actualiza el PATH de esta terminal: buscamos gh donde se instala
  const base = process.env.ProgramFiles || 'C:\\Program Files';
  const ruta = `${base}\\GitHub CLI`;
  if (existsSync(`${ruta}\\gh.exe`)) process.env.PATH = `${ruta};${process.env.PATH}`;
}

async function asegurarGh() {
  if (existe('gh')) return;
  const [programa, args] = INSTALAR_GH[process.platform] || [];
  const texto = programa ? `${programa} ${args.join(' ')}` : '';
  if (!programa || !existe(programa === 'sudo' ? 'apt' : programa)) {
    fallar('Falta GitHub CLI.', `Instálalo desde https://cli.github.com y vuelve a ejecutar  abner nuevo`);
  }
  p.log.warn('Para crear repos hace falta GitHub CLI (gh) y no lo tienes.');
  const ok = seguro(await p.confirm({ message: `¿Lo instalo ahora? ${pc.dim(`(${texto})`)}` }));
  if (!ok) fallar('Sin gh no se puede crear el repo.', `Instálalo con:  ${texto}`);
  p.log.step('Instalando GitHub CLI…');
  const r = sh(programa, args, { interactive: true });
  if (process.platform === 'win32') rutaGhWindows();
  if (!r.ok || !existe('gh')) {
    fallar('No se pudo instalar automáticamente.', `Prueba a mano:  ${texto}  y abre una terminal nueva.`);
  }
  p.log.success('GitHub CLI instalado');
}

async function crearEnGitHub() {
  await asegurarGh();
  if (!sh('gh', ['auth', 'status']).ok) {
    p.log.info('Se abrirá el navegador para conectar tu cuenta de GitHub.');
    sh('gh', ['auth', 'login', '--hostname', 'github.com', '--git-protocol', 'https', '--web'], { interactive: true });
  }
  const carpeta = process.cwd().split(/[\\/]/).pop();
  const nombre = seguro(await p.text({
    message: 'Nombre del repo',
    initialValue: carpeta.toLowerCase().replace(/[^a-z0-9._-]+/g, '-'),
    validate: (v) => (/^[\w.-]+$/.test(v) ? undefined : 'Solo letras, números, - _ y .'),
  }));
  const privado = seguro(await p.confirm({ message: '¿Privado?', initialValue: true }));
  const s = p.spinner();
  s.start('Creando repo en GitHub');
  const r = sh('gh', ['repo', 'create', nombre, privado ? '--private' : '--public', '--source=.', '--remote=origin', '--push']);
  if (!r.ok) {
    s.stop(pc.red('No se pudo crear'));
    fallar('GitHub respondió con un error.', r.err);
  }
  s.stop(pc.green(`Repo creado: ${r.out.split('\n').find((l) => l.startsWith('https')) || nombre}`));
}

// Un solo commit con todo y subir. Acepta el mensaje directo: abner sube "arreglo menú"
export async function sube(mensajeDirecto) {
  console.clear();
  p.intro(pc.bgCyan(pc.black(' abner sube ')));
  exigirRepo();
  await revisarIdentidad();

  const lista = cambios();
  if (lista.length) {
    const vista = lista.slice(0, 15).map(etiquetaArchivo).join('\n');
    const mas = lista.length > 15 ? pc.dim(`\n…y ${lista.length - 15} más`) : '';
    p.log.step(`Cambios (${lista.length}):\n${vista}${mas}`);
    const archivos = await avisarSensibles(lista);
    if (archivos.length) {
      const mensaje = mensajeDirecto || (await pedirMensaje());
      commitear(mensaje, archivos.map((a) => a.archivo));
      p.log.success(`Commit: ${pc.dim(mensaje)}`);
    }
  }

  if (!remoto()) fallar('Este proyecto no está enlazado a GitHub.', 'Ejecuta  abner nuevo  para enlazarlo.');
  const pendientes = pendientesDeSubir();
  if (!pendientes.length) return p.outro(pc.green('✅ Todo está al día, no hay nada que subir.'));
  subir();
  const s = pendientes.length > 1 ? 's' : '';
  p.outro(pc.green(`✨ ${pendientes.length} commit${s} subido${s}`));
}

// Varios commits separados: eliges qué archivos van en cada uno.
export async function commits() {
  console.clear();
  p.intro(pc.bgGreen(pc.black(' abner commits ')));
  exigirRepo();
  await revisarIdentidad();

  let hechos = 0;
  let restantes = await avisarSensibles(cambios());
  if (!restantes.length) p.log.info('No hay archivos cambiados.');

  while (restantes.length) {
    p.log.step(pc.bold(`Commit #${hechos + 1}`) + pc.dim(`  · quedan ${restantes.length} archivo(s)`));
    const elegidos = seguro(await p.multiselect({
      message: 'Marca los archivos de este commit (espacio = marcar, a = todos)',
      options: restantes.map((a) => ({ value: a.archivo, label: etiquetaArchivo(a) })),
      required: true,
    }));
    const mensaje = await pedirMensaje();
    commitear(mensaje, elegidos);
    hechos += 1;
    p.log.success(`Commit #${hechos}: ${pc.dim(mensaje)}`);

    restantes = restantes.filter((a) => !elegidos.includes(a.archivo));
    if (!restantes.length) break;
    const otro = seguro(await p.confirm({ message: `Quedan ${restantes.length} archivo(s). ¿Hacer otro commit?` }));
    if (!otro) break;
  }

  if (!remoto()) return p.outro('Commits guardados en tu computadora (sin GitHub enlazado).');
  const pendientes = pendientesDeSubir();
  if (!pendientes.length) return p.outro('Nada que subir.');
  p.note(pendientes.join('\n'), `${pendientes.length} commit(s) listos para subir`);
  const ok = seguro(await p.confirm({ message: '¿Subirlos todos ahora a GitHub?' }));
  if (ok) subir();
  p.outro(ok ? pc.green('✨ Todo arriba') : 'Quedan guardados; súbelos luego con  abner sube');
}

export async function estado() {
  console.clear();
  p.intro(pc.bgBlue(pc.black(' abner estado ')));
  exigirRepo();
  const lista = cambios();
  const pendientes = remoto() ? pendientesDeSubir() : [];
  p.log.info(`Rama: ${pc.cyan(ramaActual())}   GitHub: ${remoto() ? pc.cyan(remoto()) : pc.dim('sin enlazar')}`);
  p.note(lista.length ? lista.map(etiquetaArchivo).join('\n') : pc.dim('nada'), 'Archivos sin guardar');
  p.note(pendientes.length ? pendientes.join('\n') : pc.dim('nada'), 'Commits sin subir');
  p.outro(lista.length || pendientes.length ? 'Usa  abner sube  o  abner commits' : pc.green('Todo al día ✅'));
}

export async function historial() {
  console.clear();
  p.intro(pc.bgBlue(pc.black(' abner historial ')));
  exigirRepo();
  if (!tieneCommits()) return p.outro('Aún no hay commits.');
  const r = git('log', '-15', '--pretty=format:%h|%ar|%s');
  const filas = r.out.split('\n').map((l) => {
    const [h, cuando, ...msg] = l.split('|');
    return `${pc.yellow(h)} ${pc.dim(cuando.padEnd(16))} ${msg.join('|')}`;
  });
  p.note(filas.join('\n'), 'Últimos commits');
  p.outro(pc.dim(`${filas.length} mostrados`));
}

// Deshace el último commit sin perder los cambios (solo si aún no se subió).
export async function deshacer() {
  console.clear();
  p.intro(pc.bgRed(pc.black(' abner deshacer ')));
  exigirRepo();
  if (!tieneCommits()) return p.outro('No hay commits que deshacer.');
  if (remoto() && !pendientesDeSubir().length) {
    fallar('Ese commit ya está en GitHub.', 'Deshacerlo reescribiría el historial. Mejor haz un commit nuevo que lo corrija.');
  }
  if (!git('rev-parse', '--verify', 'HEAD~1').ok) fallar('Es el primer commit del proyecto, no se puede deshacer así.');
  const ultimo = git('log', '-1', '--pretty=%s').out;
  const ok = seguro(await p.confirm({ message: `¿Deshacer "${ultimo}"? Tus archivos no se pierden.`, initialValue: false }));
  if (!ok) return p.outro('Sin cambios.');
  const r = git('reset', '--soft', 'HEAD~1');
  if (!r.ok) fallar('No se pudo deshacer.', r.err);
  p.outro(pc.green('Commit deshecho. Los cambios siguen ahí para volver a guardarlos.'));
}
