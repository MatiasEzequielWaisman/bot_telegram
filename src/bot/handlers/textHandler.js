const { conversationService } = require('../../services');
const { renderQuestion } = require('./questionRenderer');
const { sendSummary } = require('./summary');
const logger = require('../../utils/logger');

/**
 * Handler de mensajes de texto libre.
 * Solo procesa la respuesta si la pregunta actual del usuario espera texto.
 * Si el usuario no tiene una conversación activa, lo invita a iniciar con /start.
 *
 * @param {import('telegraf').Context} ctx
 */
async function textHandler(ctx) {
  const userId = ctx.from.id;
  const { question, isCompleted } = await conversationService.getCurrentQuestion(userId);

  if (isCompleted) {
    await ctx.reply('Ya completaste tu solicitud. Si querés enviar una nueva, escribí /start.');
    return;
  }

  if (!question) {
    await ctx.reply('Para comenzar, escribí /start.');
    return;
  }

  if (question.type === 'buttons') {
    await ctx.reply('Por favor, elegí una opción usando los botones.');
    return;
  }

  const answer = ctx.message.text;
  const result = await conversationService.submitAnswer(userId, answer);

  if (!result.valid) {
    await ctx.reply(`⚠️ ${result.errorMessage}`);
    return;
  }

  logger.info('Respuesta registrada', { userId, field: question.field });

  if (result.isCompleted) {
    await sendSummary(ctx, result.answers);
    return;
  }

  await renderQuestion(ctx, result.nextQuestion);
}

module.exports = { textHandler };
