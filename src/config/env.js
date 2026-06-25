require('dotenv').config();

/**
 * Configuración centralizada de variables de entorno.
 * Cualquier nueva variable de entorno debe agregarse acá para mantener
 * un único punto de acceso a la configuración de la app.
 */
const env = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Reservado para integraciones futuras (V2+)
  DATABASE_URL: process.env.DATABASE_URL || null,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || null,
  GOOGLE_SHEETS_CREDENTIALS_PATH: process.env.GOOGLE_SHEETS_CREDENTIALS_PATH || null,
  GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || null,
  TRELLO_API_KEY: process.env.TRELLO_API_KEY || null,
  TRELLO_API_TOKEN: process.env.TRELLO_API_TOKEN || null,
  TRELLO_BOARD_ID: process.env.TRELLO_BOARD_ID || null,
  CRM_API_URL: process.env.CRM_API_URL || null,
  CRM_API_KEY: process.env.CRM_API_KEY || null,
  WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN || null,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || null,
};

/**
 * Variables obligatorias para que la app pueda arrancar.
 * Falla rápido (fail-fast) si falta alguna, evitando errores silenciosos en producción.
 */
const REQUIRED_VARS = ['BOT_TOKEN'];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias: ${missing.join(', ')}. Revisá tu archivo .env`
    );
  }
}

module.exports = { env, validateEnv };
