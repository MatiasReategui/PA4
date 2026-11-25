function isString(v) {
  return typeof v === 'string';
}

function validateLogin(body) {
  const errors = {};
  if (!isString(body?.email) || !/^\S+@\S+\.\S+$/.test(body.email)) errors.email = 'Ingresa un correo válido';
  if (!isString(body?.password) || body.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres';
  return errors;
}

function validateNuevaSolicitud(body, tiposSlugs) {
  const errors = {};
  if (!isString(body?.tipoSlug) || !tiposSlugs.includes(body.tipoSlug)) errors.tipoSlug = 'Elige un tipo de solicitud';
  const asunto = isString(body?.asunto) ? body.asunto.trim() : '';
  if (asunto.length < 5 || asunto.length > 80) errors.asunto = 'El asunto debe tener entre 5 y 80 caracteres';
  const detalle = isString(body?.detalle) ? body.detalle.trim() : '';
  if (detalle.length < 20 || detalle.length > 600) errors.detalle = 'El detalle debe tener entre 20 y 600 caracteres';
  return errors;
}

class ApiResponseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

function assertUser(u) {
  if (!u || typeof u.id !== 'number' || !isString(u.nombre) || !isString(u.email) || !isString(u.rol)) {
    throw new ApiResponseError('La API devolvió un usuario con formato inesperado');
  }
  return u;
}

function assertSolicitud(s) {
  if (!s || typeof s.id !== 'number' || !isString(s.asunto) || !isString(s.estado) || !isString(s.tipoSlug)) {
    throw new ApiResponseError('La API devolvió una solicitud con formato inesperado');
  }
  return s;
}

function assertArray(arr, itemAssert) {
  if (!Array.isArray(arr)) throw new ApiResponseError('La API debía devolver una lista');
  return arr.map(itemAssert);
}

function assertTipo(t) {
  if (!t || !isString(t.slug) || !isString(t.nombre)) {
    throw new ApiResponseError('La API devolvió un tipo de solicitud con formato inesperado');
  }
  return t;
}

module.exports = {
  validateLogin,
  validateNuevaSolicitud,
  ApiResponseError,
  assertUser,
  assertSolicitud,
  assertTipo,
  assertArray,
};
