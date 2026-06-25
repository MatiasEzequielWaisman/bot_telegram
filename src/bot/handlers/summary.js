/**
 * Construye el texto de resumen final con las respuestas del usuario.
 * @param {Object<string, string>} answers
 * @returns {string}
 */
function buildSummaryText(answers) {
  return (
    '📋 *Resumen de tu solicitud*\n\n' +
    `*Nombre:* ${answers.name}\n` +
    `*Teléfono:* ${answers.phone}\n` +
    `*Servicio:* ${answers.service}\n` +
    `*Descripción:* ${answers.description}`
  );
}

/**
 * Mensaje de cierre que se envía luego del resumen.
 */
const CLOSING_MESSAGE = 'Gracias. Un asesor se pondrá en contacto contigo.';

/**
 * Envía el resumen final y el mensaje de cierre al usuario.
 * @param {import('telegraf').Context} ctx
 * @param {Object<string, string>} answers
 */
async function sendSummary(ctx, answers) {
  await ctx.replyWithMarkdown(buildSummaryText(answers));
  await ctx.reply(CLOSING_MESSAGE);
}

module.exports = { buildSummaryText, sendSummary, CLOSING_MESSAGE };
