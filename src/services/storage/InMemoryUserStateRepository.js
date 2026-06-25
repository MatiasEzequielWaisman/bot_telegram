const UserStateRepository = require('./UserStateRepository');

/**
 * Implementación en memoria del repositorio de estado de usuario.
 * Pensada exclusivamente para la V1 / desarrollo.
 *
 * IMPORTANTE: el estado se pierde si el proceso se reinicia y no es compartido
 * entre múltiples instancias del bot. Para producción a escala, reemplazar por
 * una implementación basada en PostgreSQL (o Redis) que cumpla el mismo contrato
 * de `UserStateRepository`, sin necesidad de tocar el resto de la aplicación.
 *
 * @implements {UserStateRepository}
 */
class InMemoryUserStateRepository extends UserStateRepository {
  constructor() {
    super();
    /** @type {Map<string|number, import('./UserStateRepository').UserState>} */
    this.store = new Map();
  }

  async getState(userId) {
    return this.store.get(userId) || null;
  }

  async setState(userId, state) {
    this.store.set(userId, state);
  }

  async clearState(userId) {
    this.store.delete(userId);
  }
}

module.exports = InMemoryUserStateRepository;
