// Lectura y validación centralizada de variables de entorno (solo servidor).
const isProd = process.env.NODE_ENV === 'production';

const DEV_FALLBACK_SECRET = 'solo-para-desarrollo-no-usar-en-produccion';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (isProd) {
      // En producción es mejor fallar que firmar tokens con un secreto conocido.
      throw new Error('Falta la variable de entorno JWT_SECRET');
    }
    return DEV_FALLBACK_SECRET;
  }
  return secret;
}

const env = {
  isProd,
  get jwtSecret() {
    return getJwtSecret();
  },
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  logLevel: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  cookieName: 'sa_token',
};

module.exports = env;
