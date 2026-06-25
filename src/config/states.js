/**
 * Estados posibles de la conversación con un usuario.
 * Se usan para saber en qué punto del flujo se encuentra cada usuario
 * y permitir que abandone y retome la conversación sin romper el estado.
 */
const STATES = Object.freeze({
  START: 'START',
  QUESTION_1: 'QUESTION_1',
  MENU_GESTION_GENERAL: 'MENU_GESTION_GENERAL',
  MENU_VESTIDORES: 'MENU_VESTIDORES',
  MENU_PINTURA: 'MENU_PINTURA',
  MENU_ESTUCADO: 'MENU_ESTUCADO',
  MENU_COCINAS: 'MENU_COCINAS',
  MENU_ELECTRICISTA: 'MENU_ELECTRICISTA',
  COMPLETED: 'COMPLETED',
});

module.exports = { STATES };
