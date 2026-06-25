const { Markup } = require('telegraf');

/**
 * Construye un teclado inline a partir de las opciones de una pregunta de tipo "buttons".
 * El `callback_data` codifica el campo y el valor para poder identificarlo en el handler
 * sin depender de texto libre (más robusto ante cambios de idioma o textos largos).
 *
 * @param {import('../../config/questions').Question} question
 * @returns {import('telegraf').Markup.Markup}
 */
function buildQuestionKeyboard(question) {
  const buttons = question.options.map((option) =>
    Markup.button.callback(option.label, `answer:${question.field}:${option.value}`)
  );
  return Markup.inlineKeyboard(buttons, { columns: 1 });
}

module.exports = { buildQuestionKeyboard };
