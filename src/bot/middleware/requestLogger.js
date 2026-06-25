const logger = require('../../utils/logger');

/**
 * Middleware que registra cada update entrante (mensaje, callback, etc.)
 * con datos mínimos útiles para debugging y auditoría.
 *
 * @param {import('telegraf').Context} ctx
 * @param {Function} next
 */
async function requestLogger(ctx, next) {
  const userId = ctx.from?.id;
  const updateType = ctx.updateType;
  logger.debug('Update recibido', { userId, updateType });
  return next();
}

module.exports = { requestLogger };
