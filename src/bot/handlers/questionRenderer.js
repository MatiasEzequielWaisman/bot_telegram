const { buildQuestionKeyboard } = require('../keyboards/questionKeyboard');

/**
 * Envía al usuario el mensaje correspondiente a una pregunta, usando botones
 * inline si la pregunta es de tipo "buttons" o texto plano en caso contrario.
 *
 * @param {import('telegraf').Context} ctx
 * @param {import('../../config/questions').Question} question
 */
async function renderQuestion(ctx, question) {
  if (question.type === 'buttons') {
    await ctx.reply(question.text, buildQuestionKeyboard(question));
    return;
  }
  await ctx.reply(question.text);
}

module.exports = { renderQuestion };
