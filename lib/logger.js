// Logger estructurado (JSON por línea). Vercel recoge stdout/stderr en la pestaña "Logs".
const env = require('./env');

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function write(level, message, meta = {}) {
  if (LEVELS[level] < (LEVELS[env.logLevel] ?? LEVELS.info)) return;
  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
  // Usamos stdout/stderr directamente: el plugin de Babel elimina console.log/info/debug en producción
  // y los logs del servidor deben sobrevivir al build.
  if (level === 'error' || level === 'warn') process.stderr.write(line + '\n');
  else process.stdout.write(line + '\n');
}

module.exports = {
  debug: (m, meta) => write('debug', m, meta),
  info: (m, meta) => write('info', m, meta),
  warn: (m, meta) => write('warn', m, meta),
  error: (m, meta) => write('error', m, meta),
};
