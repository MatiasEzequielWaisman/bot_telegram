const { Markup } = require('telegraf');
const { conversationService } = require('../../services');
const { renderQuestion } = require('./questionRenderer');
const { sendSummary } = require('./summary');
const logger = require('../../utils/logger');

const BACK_TO_MENU_KEYBOARD = Markup.inlineKeyboard([
  Markup.button.callback('⬅️ Volver al menú', 'menu:back'),
]);

/**
 * Handler de callbacks de botones inline (respuestas de tipo "buttons").
 * El `callback_data` tiene el formato "answer:<field>:<value>" para respuestas
 * normales, o "menu:back" para volver al menú principal.
 *
 * @param {import('telegraf').Context} ctx
 */
async function callbackHandler(ctx) {
  const userId = ctx.from.id;
  const data = ctx.callbackQuery.data || '';
  const [prefix, , value] = data.split(':');

  if (prefix === 'menu') {
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup(undefined).catch(() => {});
    const firstQuestion = await conversationService.start(userId);
    await renderQuestion(ctx, firstQuestion);
    return;
  }

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

  const selectedOption = (question.options || []).find((option) => option.value === value);

  if (result.isCompleted) {
    await sendSummary(ctx, result.answers);
    return;
  }

  if (selectedOption && selectedOption.responseText) {
    // Es una respuesta final (hoja): muestra el contenido y ofrece volver al menú,
    // sin re-renderizar el submenú actual.
    await ctx.reply(selectedOption.responseText, BACK_TO_MENU_KEYBOARD);
    return;
  }

  await renderQuestion(ctx, result.nextQuestion);
}

module.exports = { callbackHandler };
