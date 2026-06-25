const { conversationService } = require('../../services');
const logger = require('../../utils/logger');

/**
 * Handler del comando /cancel.
 * Permite al usuario abandonar la conversación en curso en cualquier momento.
 * @param {import('telegraf').Context} ctx
 */
async function cancelHandler(ctx) {
  const userId = ctx.from.id;
  logger.info('Usuario canceló el flujo', { userId });

  await conversationService.reset(userId);
  await ctx.reply('Tu solicitud fue cancelada. Si querés empezar de nuevo, escribí /start.');
}

module.exports = { cancelHandler };
