import { spawnSync } from 'node:child_process';

// Ejecuta un comando SIN pasar por la shell: los argumentos viajan separados,
// así un mensaje con comillas, ; o & nunca se interpreta como otro comando.
export function sh(cmd, args = [], { interactive = false } = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: interactive ? 'inherit' : 'pipe',
    shell: false,
  });
  return {
    ok: r.status === 0,
    // solo trimEnd: git status usa un espacio inicial con significado (" M archivo")
    out: (r.stdout || '').trimEnd(),
    err: (r.stderr || '').trim() || (r.error ? r.error.message : ''),
  };
}

export const git = (...args) => sh('git', args);

export function existe(cmd) {
  return sh(cmd, ['--version']).ok;
}

export function esRepo() {
  return git('rev-parse', '--is-inside-work-tree').out === 'true';
}

export function ramaActual() {
  return git('branch', '--show-current').out || 'main';
}

export function remoto() {
  const r = git('remote', 'get-url', 'origin');
  return r.ok ? r.out : null;
}

export function tieneCommits() {
  return git('rev-parse', '--verify', 'HEAD').ok;
}

// Lista de archivos cambiados: [{ estado, archivo }]
export function cambios() {
  const r = git('-c', 'core.quotepath=false', 'status', '--porcelain=v1', '-uall');
  if (!r.ok || !r.out) return [];
  return r.out.split('\n').map((linea) => {
    const codigo = linea.slice(0, 2);
    let archivo = linea.slice(3);
    if (archivo.includes(' -> ')) archivo = archivo.split(' -> ')[1];
    if (archivo.startsWith('"')) archivo = JSON.parse(archivo);
    return { estado: describir(codigo), archivo };
  });
}

function describir(c) {
  if (c === '??') return 'nuevo';
  if (c.includes('D')) return 'borrado';
  if (c.includes('R')) return 'renombrado';
  if (c.includes('A')) return 'nuevo';
  return 'modificado';
}

// Commits locales que aún no están en GitHub
export function pendientesDeSubir() {
  if (!tieneCommits()) return [];
  const rama = ramaActual();
  const r = git('log', `origin/${rama}..HEAD`, '--oneline');
  if (!r.ok) {
    // la rama aún no existe en el remoto: todos sus commits están pendientes
    const todos = git('log', '--oneline');
    return todos.ok && todos.out ? todos.out.split('\n') : [];
  }
  return r.out ? r.out.split('\n') : [];
}
