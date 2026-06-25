const { STATES } = require('./states');

/**
 * @typedef {Object} QuestionOption
 * @property {string} label - Texto visible del botón.
 * @property {string} value - Valor interno que se guarda como respuesta.
 */

/**
 * @typedef {Object} Question
 * @property {string} state - Estado de la conversación asociado a esta pregunta (ver states.js).
 * @property {string} field - Nombre del campo donde se guarda la respuesta en el estado del usuario.
 * @property {string} text - Texto de la pregunta que se le muestra al usuario.
 * @property {'text'|'buttons'} type - Tipo de respuesta esperada.
 * @property {QuestionOption[]} [options] - Opciones de botones (solo si type === 'buttons').
 * @property {string} [validator] - Nombre del validador a aplicar (ver utils/validators.js).
 * @property {string} [nextState] - Estado al que se avanza luego de responder esta pregunta.
 */

/**
 * Panel único de configuración del flujo conversacional.
 *
 * Para modificar el bot SIN tocar el resto del código:
 *  - Cambiar el texto: editar la propiedad `text`.
 *  - Cambiar los botones: editar el array `options`.
 *  - Agregar una pregunta nueva: agregar un objeto nuevo a este array, crear su
 *    estado correspondiente en `states.js` y enlazar `nextState` correctamente.
 *  - Eliminar una pregunta: quitar el objeto del array y ajustar el `nextState`
 *    de la pregunta anterior para que apunte al estado siguiente correcto.
 *  - Reordenar preguntas: cambiar el orden de los objetos en este array y
 *    actualizar los `nextState` para que la cadena de estados siga siendo correcta.
 *
 * El orden de evaluación del flujo es el orden de este array, pero el estado
 * real de avance siempre lo determina `nextState`.
 */
const QUESTIONS = [
  {
    state: STATES.QUESTION_1,
    field: 'name',
    text: '¿Cuál es tu nombre?',
    type: 'text',
    validator: 'notEmpty',
    nextState: STATES.QUESTION_2,
  },
  {
    state: STATES.QUESTION_2,
    field: 'phone',
    text: '¿Cuál es tu teléfono?',
    type: 'text',
    validator: 'phone',
    nextState: STATES.QUESTION_3,
  },
  {
    state: STATES.QUESTION_3,
    field: 'service',
    text: '¿Qué servicio necesitás?',
    type: 'buttons',
    options: [
      { label: 'Instalación', value: 'Instalación' },
      { label: 'Soporte', value: 'Soporte' },
      { label: 'Presupuesto', value: 'Presupuesto' },
      { label: 'Consulta General', value: 'Consulta General' },
    ],
    validator: 'notEmpty',
    nextState: STATES.QUESTION_4,
  },
  {
    state: STATES.QUESTION_4,
    field: 'description',
    text: 'Describí brevemente tu necesidad.',
    type: 'text',
    validator: 'notEmpty',
    nextState: STATES.COMPLETED,
  },
];

/**
 * Devuelve la configuración de pregunta asociada a un estado dado.
 * @param {string} state
 * @returns {Question|undefined}
 */
function getQuestionByState(state) {
  return QUESTIONS.find((question) => question.state === state);
}

/**
 * Devuelve la primera pregunta del flujo.
 * @returns {Question}
 */
function getFirstQuestion() {
  return QUESTIONS[0];
}

module.exports = { QUESTIONS, getQuestionByState, getFirstQuestion };
