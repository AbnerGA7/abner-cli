#!/usr/bin/env node
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { p, pc, banner, bienvenida, seguro } from '../src/ui.js';
import * as cmd from '../src/comandos.js';

const { version } = createRequire(import.meta.url)('../package.json');
const [orden, ...resto] = process.argv.slice(2);

const AYUDA = `
${pc.bold('Uso:')} abner ${pc.dim('[comando]')}

  ${pc.cyan('nuevo')}       Inicia el proyecto y lo sube a GitHub
  ${pc.cyan('sube')} ${pc.dim('"msg"')}  Guarda todo en un commit y lo sube
  ${pc.cyan('commits')}     Varios commits: eliges qué archivos van en cada uno
  ${pc.cyan('estado')}      Qué falta guardar y qué falta subir
  ${pc.cyan('historial')}   Últimos 15 commits
  ${pc.cyan('deshacer')}    Deshace el último commit (si no se subió)

  Sin comando abre el menú.   ${pc.dim('--help  --version')}
`;

const COMANDOS = {
  nuevo: cmd.nuevo,
  sube: () => cmd.sube(resto.join(' ').trim() || undefined),
  commits: cmd.commits,
  estado: cmd.estado,
  historial: cmd.historial,
  deshacer: cmd.deshacer,
};

// Marca en ~/.abner para mostrar la bienvenida solo la primera vez.
function primeraVez() {
  const marca = join(homedir(), '.abner', 'bienvenida');
  if (existsSync(marca)) return false;
  try {
    mkdirSync(join(homedir(), '.abner'), { recursive: true });
    writeFileSync(marca, new Date().toISOString());
  } catch { /* sin permisos: la mostramos y ya */ }
  return true;
}

async function menu() {
  if (primeraVez()) bienvenida(version);
  else {
    console.clear();
    banner();
  }
  const eleccion = seguro(await p.select({
    message: '¿Qué hacemos hoy?',
    options: [
      { value: 'sube', label: '🚀 Subir cambios', hint: 'un commit con todo' },
      { value: 'commits', label: '🧩 Varios commits', hint: 'separar por archivos' },
      { value: 'estado', label: '🔍 Ver estado' },
      { value: 'historial', label: '📜 Historial' },
      { value: 'nuevo', label: '📦 Proyecto nuevo', hint: 'init + GitHub' },
      { value: 'deshacer', label: '↩️  Deshacer último commit' },
    ],
  }));
  await COMANDOS[eleccion]();
}

if (orden === '--version' || orden === '-v') console.log(version);
else if (orden === '--help' || orden === '-h' || orden === 'ayuda') {
  banner();
  console.log(AYUDA);
}
else if (!orden) await menu();
else if (COMANDOS[orden]) await COMANDOS[orden]();
else {
  console.log(pc.red(`\n  No conozco el comando "${orden}".`));
  console.log(AYUDA);
  process.exit(1);
}
