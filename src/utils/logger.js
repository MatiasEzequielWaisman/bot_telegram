const { env } = require('../config/env');

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LEVELS[env.LOG_LEVEL] ?? LEVELS.info;

/**
 * Logger simple con niveles, pensado para ser reemplazado en el futuro
 * por una librería como winston o pino sin afectar al resto del código,
 * ya que toda la app solo conoce esta interfaz (debug/info/warn/error).
 */
function log(level, message, meta) {
  if (LEVELS[level] < currentLevel) return;

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (meta !== undefined) {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](prefix, message, meta);
  } else {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](prefix, message);
  }
}

const logger = {
  debug: (message, meta) => log('debug', message, meta),
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};

module.exports = logger;
