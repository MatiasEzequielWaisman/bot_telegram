const { Telegraf } = require('telegraf');
const { env } = require('../config/env');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');
const { startHandler } = require('./handlers/startHandler');
const { cancelHandler } = require('./handlers/cancelHandler');
const { textHandler } = require('./handlers/textHandler');
const { callbackHandler } = require('./handlers/callbackHandler');

/**
 * Crea y configura la instancia del bot de Telegram, registrando
 * middlewares, comandos y handlers de mensajes.
 *
 * @returns {Telegraf}
 */
function createBot() {
  const bot = new Telegraf(env.BOT_TOKEN);

  bot.use(errorHandler);
  bot.use(requestLogger);

  bot.command('start', startHandler);
  bot.command('cancel', cancelHandler);

  bot.on('callback_query', callbackHandler);
  bot.on('text', textHandler);

  return bot;
}

module.exports = { createBot };
