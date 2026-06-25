const { conversationService } = require('../../services');
const { renderQuestion } = require('./questionRenderer');
const { sendSummary } = require('./summary');
const logger = require('../../utils/logger');

/**
 * Handler de callbacks de botones inline (respuestas de tipo "buttons").
 * El `callback_data` tiene el formato "answer:<field>:<value>".
 *
 * @param {import('telegraf').Context} ctx
 */
async function callbackHandler(ctx) {
  const userId = ctx.from.id;
  const data = ctx.callbackQuery.data || '';
  const [prefix, , value] = data.split(':');

  if (prefix !== 'answer') {
    await ctx.answerCbQuery();
    return;
  }

  const { question, isCompleted } = await conversationService.getCurrentQuestion(userId);

  if (isCompleted) {
    await ctx.answerCbQuery('Ya completaste tu solicitud.');
    return;
  }

  if (!question || question.type !== 'buttons') {
    await ctx.answerCbQuery('Esta opción ya no es válida.');
    return;
  }

  const result = await conversationService.submitAnswer(userId, value);
  await ctx.answerCbQuery();

  if (!result.valid) {
    await ctx.reply(`⚠️ ${result.errorMessage}`);
    return;
  }

  logger.info('Respuesta registrada vía botón', { userId, field: question.field, value });

  // Quita los botones del mensaje original para evitar respuestas duplicadas.
  await ctx.editMessageReplyMarkup(undefined).catch(() => {});

  if (result.isCompleted) {
    await sendSummary(ctx, result.answers);
    return;
  }

  await renderQuestion(ctx, result.nextQuestion);
}

module.exports = { callbackHandler };
