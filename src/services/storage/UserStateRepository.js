/**
 * @typedef {Object} UserState
 * @property {string} state - Estado actual del usuario dentro del flujo conversacional.
 * @property {Object<string, string>} answers - Respuestas acumuladas, indexadas por `field`.
 */

/**
 * Contrato (interfaz) que debe cumplir cualquier implementación de almacenamiento
 * de estado de usuario. Esto permite reemplazar la implementación en memoria por
 * una basada en PostgreSQL (o cualquier otra base) sin modificar la lógica de
 * negocio del bot, que solo conoce este contrato.
 *
 * @interface
 */
class UserStateRepository {
  /**
   * Obtiene el estado de un usuario. Si no existe, debe devolver `null`.
   * @param {string|number} userId
   * @returns {Promise<UserState|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getState(userId) {
    throw new Error('UserStateRepository.getState debe ser implementado');
  }

  /**
   * Crea o reemplaza completamente el estado de un usuario.
   * @param {string|number} userId
   * @param {UserState} state
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async setState(userId, state) {
    throw new Error('UserStateRepository.setState debe ser implementado');
  }

  /**
   * Elimina el estado de un usuario (reinicia su conversación).
   * @param {string|number} userId
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async clearState(userId) {
    throw new Error('UserStateRepository.clearState debe ser implementado');
  }
}

module.exports = UserStateRepository;
