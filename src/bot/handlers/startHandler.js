const { conversationService } = require('../../services');
const { renderQuestion } = require('./questionRenderer');
const logger = require('../../utils/logger');

const WELCOME_MESSAGE = 'Bienvenido.\n\nPor favor respondé las siguientes preguntas.';

/**
 * Handler del comando /start.
 * Reinicia (o inicia por primera vez) el flujo conversacional del usuario.
 * @param {import('telegraf').Context} ctx
 */
async function startHandler(ctx) {
  const userId = ctx.from.id;
  logger.info('Usuario inició el flujo', { userId });

  await ctx.reply(WELCOME_MESSAGE);

  const firstQuestion = await conversationService.start(userId);
  await renderQuestion(ctx, firstQuestion);
}

module.exports = { startHandler, WELCOME_MESSAGE };
