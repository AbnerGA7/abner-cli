import * as p from '@clack/prompts';
import pc from 'picocolors';

export { p, pc };

const LOGO = [
  ' █████╗ ██████╗ ███╗   ██╗███████╗██████╗ ',
  '██╔══██╗██╔══██╗████╗  ██║██╔════╝██╔══██╗',
  '███████║██████╔╝██╔██╗ ██║█████╗  ██████╔╝',
  '██╔══██║██╔══██╗██║╚██╗██║██╔══╝  ██╔══██╗',
  '██║  ██║██████╔╝██║ ╚████║███████╗██║  ██║',
  '╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝',
];

// Degradado rosa → violeta → cian, columna por columna (como los logos de Claude o Gemini).
const PARADAS = [[255, 95, 162], [168, 85, 247], [56, 189, 248]];

function colorEn(t) {
  const tramo = t < 0.5 ? 0 : 1;
  const local = t < 0.5 ? t * 2 : (t - 0.5) * 2;
  const [a, b] = [PARADAS[tramo], PARADAS[tramo + 1]];
  return a.map((v, i) => Math.round(v + (b[i] - v) * local));
}

export function degradado(texto, ancho = texto.length) {
  if (!pc.isColorSupported) return texto;
  return [...texto].map((ch, i) => {
    if (ch === ' ') return ch;
    const [r, g, b] = colorEn(i / Math.max(ancho - 1, 1));
    return `\x1b[38;2;${r};${g};${b}m${ch}`;
  }).join('') + '\x1b[0m';
}

export function banner() {
  console.log();
  LOGO.forEach((l) => console.log('  ' + pc.bold(degradado(l, LOGO[0].length))));
  console.log(`\n  ${degradado('◆')} ${pc.bold('tu asistente de Git y GitHub')}  ${pc.dim('· hecho por Abner')}\n`);
}

// Pantalla de bienvenida: solo la primera vez que se ejecuta abner.
export function bienvenida(version) {
  console.clear();
  banner();
  const caja = [
    `${pc.bold('¡Bienvenido!')} ${pc.dim(`v${version}`)}`,
    '',
    `${degradado('▸')} ${pc.cyan('abner')}          abre el menú`,
    `${degradado('▸')} ${pc.cyan('abner sube')}     guarda y sube tus cambios`,
    `${degradado('▸')} ${pc.cyan('abner commits')}  separa en varios commits`,
    `${degradado('▸')} ${pc.cyan('abner --help')}   ver todo`,
  ];
  p.note(caja.join('\n'), degradado('✦ Primeros pasos'));
}

// Si el usuario pulsa Ctrl+C o Esc en cualquier pregunta, salimos con calma.
export function seguro(valor) {
  if (p.isCancel(valor)) {
    p.cancel('Cancelado. No se cambió nada más.');
    process.exit(0);
  }
  return valor;
}

export function fallar(titulo, detalle) {
  p.log.error(pc.red(titulo));
  if (detalle) p.log.message(pc.dim(detalle));
  p.outro(pc.red('Se detuvo para no romper nada.'));
  process.exit(1);
}

const color = {
  nuevo: pc.green,
  modificado: pc.yellow,
  borrado: pc.red,
  renombrado: pc.cyan,
};

export function etiquetaArchivo({ estado, archivo }) {
  return `${color[estado](estado.padEnd(10))} ${archivo}`;
}

// Tipos de commit (Conventional Commits) con nombres en español.
const TIPOS = [
  { value: 'feat', label: '✨ Nueva función', hint: 'feat' },
  { value: 'fix', label: '🐛 Arreglo de error', hint: 'fix' },
  { value: 'style', label: '🎨 Diseño / estilos', hint: 'style' },
  { value: 'refactor', label: '♻️  Reorganizar código', hint: 'refactor' },
  { value: 'docs', label: '📝 Documentación', hint: 'docs' },
  { value: 'chore', label: '🔧 Configuración / mantenimiento', hint: 'chore' },
  { value: '', label: '💬 Sin tipo, solo el mensaje' },
];

export async function pedirMensaje(sugerencia) {
  const tipo = seguro(await p.select({ message: '¿Qué tipo de cambio es?', options: TIPOS }));
  const texto = seguro(
    await p.text({
      message: 'Describe el cambio',
      placeholder: sugerencia || 'ej. agrega el formulario de contacto',
      validate: (v) => (v.trim() ? undefined : 'Escribe algo, aunque sea corto.'),
    }),
  );
  return tipo ? `${tipo}: ${texto.trim()}` : texto.trim();
}
