/**
 * Resultado de una validación.
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string} [errorMessage]
 */

/**
 * Valida que el texto no esté vacío ni sea solo espacios.
 * @param {string} value
 * @returns {ValidationResult}
 */
function notEmpty(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { valid: false, errorMessage: 'La respuesta no puede estar vacía. Por favor, intentá de nuevo.' };
  }
  return { valid: true };
}

/**
 * Valida un número de teléfono.
 * Acepta dígitos, espacios, guiones, paréntesis y un signo "+" opcional al inicio.
 * Requiere entre 7 y 15 dígitos numéricos (estándar E.164 flexible).
 * @param {string} value
 * @returns {ValidationResult}
 */
function phone(value) {
  const emptyCheck = notEmpty(value);
  if (!emptyCheck.valid) return emptyCheck;

  const cleaned = value.trim();
  const validFormat = /^\+?[\d\s()-]+$/.test(cleaned);
  const digitsOnly = cleaned.replace(/\D/g, '');

  if (!validFormat || digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      valid: false,
      errorMessage: 'El teléfono no es válido. Ingresá un número con entre 7 y 15 dígitos, por ejemplo: +5491122334455',
    };
  }

  return { valid: true };
}

/**
 * Registro de validadores disponibles para usar desde questions.js.
 */
const VALIDATORS = { notEmpty, phone };

/**
 * Ejecuta el validador correspondiente a un nombre dado.
 * Si no se especifica validador, la respuesta se considera válida.
 * @param {string|undefined} validatorName
 * @param {string} value
 * @returns {ValidationResult}
 */
function validate(validatorName, value) {
  if (!validatorName) return { valid: true };
  const validatorFn = VALIDATORS[validatorName];
  if (!validatorFn) return { valid: true };
  return validatorFn(value);
}

module.exports = { validate, VALIDATORS };
