const InMemoryUserStateRepository = require('./storage/InMemoryUserStateRepository');
const ConversationService = require('./ConversationService');

/**
 * Punto único de composición de dependencias (poor man's DI container).
 *
 * Para migrar a PostgreSQL en el futuro, alcanza con reemplazar
 * `InMemoryUserStateRepository` por una nueva clase (por ejemplo
 * `PostgresUserStateRepository`) que implemente el mismo contrato
 * de `UserStateRepository`, y cambiar únicamente esta línea.
 */
const userStateRepository = new InMemoryUserStateRepository();
const conversationService = new ConversationService(userStateRepository);

module.exports = { userStateRepository, conversationService };
