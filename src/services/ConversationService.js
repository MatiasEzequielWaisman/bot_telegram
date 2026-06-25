const { STATES } = require('../config/states');
const { getFirstQuestion, getQuestionByState } = require('../config/questions');
const { validate } = require('../utils/validators');

/**
 * Servicio de negocio que maneja el flujo de la conversación.
 * No conoce nada de Telegram/Telegraf: solo trabaja con `userId`, estado y
 * respuestas. Esto permite reutilizar esta misma lógica desde otro canal
 * (por ejemplo, WhatsApp Business API) en el futuro.
 *
 * @param {import('./storage/UserStateRepository')} repository
 */
class ConversationService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Inicia (o reinicia) la conversación de un usuario.
   * @param {string|number} userId
   * @returns {Promise<import('../config/questions').Question>} primera pregunta a mostrar
   */
  async start(userId) {
    const firstQuestion = getFirstQuestion();
    await this.repository.setState(userId, {
      state: firstQuestion.state,
      answers: {},
    });
    return firstQuestion;
  }

  /**
   * Obtiene el estado actual del usuario. Si no existe, devuelve `null`.
   * @param {string|number} userId
   * @returns {Promise<import('./storage/UserStateRepository').UserState|null>}
   */
  async getCurrentState(userId) {
    return this.repository.getState(userId);
  }

  /**
   * Devuelve la pregunta actual que debería responder el usuario,
   * según el estado guardado. Permite retomar la conversación donde quedó.
   * @param {string|number} userId
   * @returns {Promise<{question: import('../config/questions').Question|null, isCompleted: boolean}>}
   */
  async getCurrentQuestion(userId) {
    const userState = await this.repository.getState(userId);
    if (!userState) {
      return { question: null, isCompleted: false };
    }
    if (userState.state === STATES.COMPLETED) {
      return { question: null, isCompleted: true };
    }
    return { question: getQuestionByState(userState.state) || null, isCompleted: false };
  }

  /**
   * Procesa la respuesta del usuario a la pregunta actual: valida, guarda y avanza de estado.
   * @param {string|number} userId
   * @param {string} answer
   * @returns {Promise<{
   *   valid: boolean,
   *   errorMessage?: string,
   *   nextQuestion?: import('../config/questions').Question,
   *   isCompleted?: boolean,
   *   answers?: Object<string, string>
   * }>}
   */
  async submitAnswer(userId, answer) {
    const userState = await this.repository.getState(userId);
    if (!userState) {
      throw new Error(`No existe estado para el usuario ${userId}. Debe llamar a start() primero.`);
    }

    const currentQuestion = getQuestionByState(userState.state);
    if (!currentQuestion) {
      throw new Error(`Estado desconocido "${userState.state}" para el usuario ${userId}.`);
    }

    const validation = validate(currentQuestion.validator, answer);
    if (!validation.valid) {
      return { valid: false, errorMessage: validation.errorMessage };
    }

    const updatedAnswers = { ...userState.answers, [currentQuestion.field]: answer.trim() };
    const nextState = currentQuestion.nextState;

    await this.repository.setState(userId, {
      state: nextState,
      answers: updatedAnswers,
    });

    if (nextState === STATES.COMPLETED) {
      return { valid: true, isCompleted: true, answers: updatedAnswers };
    }

    return { valid: true, isCompleted: false, nextQuestion: getQuestionByState(nextState) };
  }

  /**
   * Reinicia completamente la conversación de un usuario, borrando sus respuestas.
   * @param {string|number} userId
   * @returns {Promise<void>}
   */
  async reset(userId) {
    await this.repository.clearState(userId);
  }
}

module.exports = ConversationService;
