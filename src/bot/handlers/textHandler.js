const { conversationService } = require('../../services');
const { renderQuestion } = require('./questionRenderer');
const { sendSummary } = require('./summary');
const { startHandler } = require('./startHandler');
const logger = require('../../utils/logger');

/**
 * Handler de mensajes de texto libre.
 * Si el usuario no tiene una conversación activa (o ya la completó), cualquier
 * mensaje de texto (ej. "hola") dispara el inicio del flujo, igual que /start.
 * Si tiene una conversación activa, procesa el mensaje como respuesta a la
 * pregunta actual (si esta espera texto).
 *
 * @param {import('telegraf').Context} ctx
 */
async function textHandler(ctx) {
  const userId = ctx.from.id;
  const { question, isCompleted } = await conversationService.getCurrentQuestion(userId);

  if (isCompleted || !question) {
    await startHandler(ctx);
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
