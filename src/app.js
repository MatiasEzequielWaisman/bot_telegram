const { env, validateEnv } = require('./config/env');
const { createBot } = require('./bot');
const logger = require('./utils/logger');

/**
 * Punto de entrada de la aplicación.
 * Valida configuración, arranca el bot en modo long polling y configura
 * un apagado ordenado (graceful shutdown) ante señales del sistema/orquestador.
 */
async function main() {
  validateEnv();

  const bot = createBot();

  await bot.launch();
  logger.info(`Bot iniciado correctamente en modo "${env.NODE_ENV}"`);

  process.once('SIGINT', () => {
    logger.info('Señal SIGINT recibida, deteniendo el bot...');
    bot.stop('SIGINT');
  });

  process.once('SIGTERM', () => {
    logger.info('Señal SIGTERM recibida, deteniendo el bot...');
    bot.stop('SIGTERM');
  });
}

main().catch((error) => {
  logger.error('Error fatal al iniciar la aplicación', { message: error.message, stack: error.stack });
  process.exit(1);
});
