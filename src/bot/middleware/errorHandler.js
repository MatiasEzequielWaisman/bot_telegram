const logger = require('../../utils/logger');

/**
 * Middleware de control de errores global para el bot.
 * Envuelve la ejecución de cada update; si algún handler lanza una excepción,
 * se registra el error y se le informa al usuario sin exponer detalles internos.
 *
 * @param {import('telegraf').Context} ctx
 * @param {Function} next
 */
async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (error) {
    logger.error('Error no controlado procesando un update', {
      userId: ctx.from?.id,
      updateType: ctx.updateType,
      message: error.message,
      stack: error.stack,
    });

    try {
      await ctx.reply('Ocurrió un error inesperado. Por favor, intentá nuevamente con /start.');
    } catch (replyError) {
      logger.error('No se pudo notificar el error al usuario', { message: replyError.message });
    }
  }
}

module.exports = { errorHandler };
