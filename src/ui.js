import * as p from '@clack/prompts';
import pc from 'picocolors';

export { p, pc };

export function banner() {
  const letras = [
    '   █████  ██████  ███    ██ ███████ ██████  ',
    '  ██   ██ ██   ██ ████   ██ ██      ██   ██ ',
    '  ███████ ██████  ██ ██  ██ █████   ██████  ',
    '  ██   ██ ██   ██ ██  ██ ██ ██      ██   ██ ',
    '  ██   ██ ██████  ██   ████ ███████ ██   ██ ',
  ];
  const tonos = [pc.magenta, pc.magenta, pc.cyan, pc.cyan, pc.blue];
  console.log();
  letras.forEach((l, i) => console.log(pc.bold(tonos[i](l))));
  console.log(pc.dim('        tu asistente de Git y GitHub\n'));
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
