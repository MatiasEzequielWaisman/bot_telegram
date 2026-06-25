const { STATES } = require('./states');

/**
 * @typedef {Object} QuestionOption
 * @property {string} label - Texto visible del botón.
 * @property {string} value - Valor interno que se guarda como respuesta.
 * @property {string} [nextState] - Si se define, el flujo bifurca a este estado en
 *   lugar de usar el `nextState` general de la pregunta. Permite que cada botón
 *   lleve a una pregunta de seguimiento distinta.
 * @property {string} [responseText] - Si se define, este texto se envía como mensaje
 *   apenas el usuario elige esta opción (antes de continuar con la siguiente pregunta).
 *   Se usa para mostrar contenido informativo específico de esa opción.
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
    field: 'service',
    text: 'Bienvenido al Manual de Obra, ¿Que necesitas saber?',
    type: 'buttons',
    options: [
      { label: 'Gestion General', value: 'Gestion General', nextState: STATES.MENU_GESTION_GENERAL },
      { label: 'Vestidores', value: 'Vestidores', nextState: STATES.MENU_VESTIDORES },
      { label: 'Pintura', value: 'Pintura', nextState: STATES.MENU_PINTURA },
      { label: 'Estucado y microcemento', value: 'Estucado y microcemento', nextState: STATES.MENU_ESTUCADO },
      { label: 'Cocinas', value: 'Cocinas', nextState: STATES.MENU_COCINAS },
      { label: 'Electricista', value: 'Electricista', nextState: STATES.MENU_ELECTRICISTA },
      {
        label: 'Proovedores',
        value: 'Proovedores',
        responseText: '🚧 Información de Proveedores próximamente.',
        nextState: STATES.QUESTION_2,
      },
    ],
    validator: 'notEmpty',
    nextState: STATES.QUESTION_2,
  },
  {
    state: STATES.MENU_GESTION_GENERAL,
    field: 'serviceDetail',
    text: 'Sección Gestión general. Elegí qué necesitás:',
    type: 'buttons',
    options: [
      {
        label: 'ABC de obra',
        value: 'ABC de obra',
        responseText:
          '🎯 ABC de obra\n' +
          '1er acto: asegurar los proveedores.\n\n' +
          '2do acto: asegurarse que tengan los materiales.\n\n' +
          '3er acto: que esté todo en el calendario y que estén todos avisados.\n\n' +
          '4to acto: armar videos de todos los proyectos que tenemos en 3D.',
      },
      {
        label: 'Planos a obra',
        value: 'Planos a obra',
        responseText:
          '📐 Planos a obra\n' +
          '⚠️ Importante: revisar la actualización semanal y dejarlos impresos en cada ambiente.',
      },
    ],
    validator: 'notEmpty',
    nextState: STATES.QUESTION_2,
  },
  {
    state: STATES.MENU_VESTIDORES,
    field: 'serviceDetail',
    text: 'Sección Vestidores. Elegí qué necesitás:',
    type: 'buttons',
    options: [
      {
        label: 'Medidas y espacios',
        value: 'Medidas y espacios',
        responseText:
          '📐 Medidas y espacios — Vestidores\n\n' +
          'Espacio de colgado: mínimo 1,10m, lo ideal es 1,80m o más.\n' +
          'Profundidad de vestidor: mínima recomendable 55cm, óptima 60cm.\n' +
          'Altura de cajones: entre 15 y 30cm según el uso — siempre los más chicos van más arriba.\n\n' +
          '⚠️ Aclarar siempre: las medidas son finales, no contemplan el espesor de la placa.',
      },
      {
        label: 'Cajones y herrajes',
        value: 'Cajones y herrajes',
        responseText:
          '🗄️ Cajones y herrajes — Vestidores\n\n' +
          'Profundidad de cajones con corredera telescópica: 42cm, cierre suave.\n' +
          'Zócalos de vestidor: 0,7cm / 0,8cm.\n' +
          'Espacio de zapatos: extraíble.\n\n' +
          '📎 Recordá agregar el plano de referencia a la tarjeta correspondiente antes de ir a obra.',
      },
      {
        label: 'Iluminación y detalles',
        value: 'Iluminación y detalles',
        responseText:
          '💡 Iluminación y detalles — Vestidores\n\n' +
          'Tira LED: siempre con perfil más fuerte.\n' +
          'Estante superior: arriba del barral, para colgar ropa, un estante.\n\n' +
          '📷 Hay un álbum de fotos de referencia disponible (2018–2025) en la tarjeta de Trello.',
      },
    ],
    validator: 'notEmpty',
    nextState: STATES.QUESTION_2,
  },
  {
    state: STATES.MENU_PINTURA,
    field: 'serviceDetail',
    text: 'Sección Pintura. Elegí qué necesitás:',
    type: 'buttons',
    options: [
      {
        label: 'Tipos de pintura',
        value: 'Tipos de pintura',
        responseText: '🎨 Tipos de pintura\n\n' + 'Látex: para interior o exterior.\n' + 'Sintético: para puertas o ventanas.',
      },
      {
        label: 'Rendimiento',
        value: 'Rendimiento',
        responseText: '📏 Rendimiento de pintura\n\n' + '1kg de pintura cubre aproximadamente 1m².',
      },
      {
        label: 'Kit a llevar',
        value: 'Kit a llevar',
        responseText:
          '🧰 Kit a llevar — Pintura\n' +
          'Siempre llevar:\n\n' +
          'Batea\n' +
          'Pincel\n' +
          'Rodillo\n' +
          'Cinta\n' +
          'Cartón o nylon\n' +
          'Escalera\n' +
          'La pintura',
      },
    ],
    validator: 'notEmpty',
    nextState: STATES.QUESTION_2,
  },
  {
    state: STATES.MENU_ESTUCADO,
    field: 'serviceDetail',
    text: 'Sección Estucado y microcemento. Elegí qué necesitás:',
    type: 'buttons',
    options: [
      {
        label: 'Materiales',
        value: 'Materiales',
        responseText: '🧱 Materiales — Estucado y microcemento\n\n' + 'Malla\n' + 'Base\n' + 'Color\n' + 'Cera o laca',
      },
      {
        label: 'Responsables',
        value: 'Responsables',
        responseText: '👤 Responsables — Estucado y microcemento\n\n' + 'Quién lo hace: Peter o Marcos.',
      },
      {
        label: 'Aclaraciones importantes',
        value: 'Aclaraciones importantes',
        responseText:
          '⚠️ Aclaraciones importantes — Estucado y microcemento\n\n' +
          'Que vaya también abajo de la mesada, por más que vaya vanitory.',
      },
    ],
    validator: 'notEmpty',
    nextState: STATES.QUESTION_2,
  },
  {
    state: STATES.MENU_COCINAS,
    field: 'serviceDetail',
    text: 'Sección Cocinas. Elegí qué necesitás:',
    type: 'buttons',
    options: [
      {
        label: 'Piso y zócalos',
        value: 'Piso y zócalos',
        responseText: '🍳 Piso y zócalos — Cocinas\n\n' + 'Piso bajo mesada: aluminio.\n' + 'Zócalo: aluminio.',
      },
      {
        label: 'Cajones y herrajes',
        value: 'Cajones y herrajes',
        responseText:
          '🗄️ Cajones y herrajes — Cocinas\n\n' +
          'Altura de cajones: primeros de 15cm y el último de 30cm.\n' +
          'Herraje: Hafele, Eurohard o Blum, tope de gama.',
      },
      {
        label: 'Extraíbles y ajustes',
        value: 'Extraíbles y ajustes',
        responseText:
          '🔧 Extraíbles y ajustes — Cocinas\n\n' +
          'Tacho: extraíble.\n' +
          'Bandeja en bajo mesada: usar para ajustes.\n' +
          'Escobero o extraíble en altura: usar para ajustes.',
      },
    ],
    validator: 'notEmpty',
    nextState: STATES.QUESTION_2,
  },
  {
    state: STATES.MENU_ELECTRICISTA,
    field: 'serviceDetail',
    text: 'Sección Electricista. Elegí qué necesitás:',
    type: 'buttons',
    options: [
      {
        label: 'Materiales y artefactos',
        value: 'Materiales y artefactos',
        responseText:
          '💡 Materiales y artefactos — Electricista\n\n' +
          'Artefactos de iluminación\n' +
          'Lamparitas\n' +
          'Teclas\n' +
          'Tomas\n' +
          'Tapas ciegas\n' +
          'Cajas\n' +
          'Cables\n' +
          'Cinta aislante\n\n' +
          'Iluminación: tira LED siempre con perfil más fuerte.',
      },
      {
        label: 'Kit a llevar',
        value: 'Kit a llevar',
        responseText:
          '🧰 Kit a llevar — Electricista\n\n' +
          'Herramientas\n' +
          'Escalera\n' +
          'Cables\n' +
          'Cinta aislante\n' +
          'Cajas\n' +
          'Tapas ciegas',
      },
      {
        label: 'Embutidos',
        value: 'Embutidos',
        responseText:
          '🧱 Embutidos — Electricista\n\n' + 'Corrugado, si hiciera falta embutir.\n' + 'Llevar: cemento rápido, yeso.',
      },
    ],
    validator: 'notEmpty',
    nextState: STATES.QUESTION_2,
  },
  {
    state: STATES.QUESTION_2,
    field: 'name',
    text: '¿Cuál es tu nombre?',
    type: 'text',
    validator: 'notEmpty',
    nextState: STATES.QUESTION_3,
  },
  {
    state: STATES.QUESTION_3,
    field: 'phone',
    text: '¿Cuál es tu teléfono?',
    type: 'text',
    validator: 'phone',
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
