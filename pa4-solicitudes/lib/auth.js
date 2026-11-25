const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const env = require('./env');
const db = require('./db');

function signToken(user) {
  return jwt.sign({ sub: user.id, rol: user.rol }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: 'solicitudes-isil',
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret, { issuer: 'solicitudes-isil' });
  } catch {
    return null; 
  }
}

function toPublicUser(user) {
  return { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol };
}

function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(env.cookieName, token, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2,
    })
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(env.cookieName, '', {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  );
}

function getUserFromCookieHeader(cookieHeader) {
  const cookies = cookie.parse(cookieHeader || '');
  const token = cookies[env.cookieName];
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = db.findUserById(payload.sub);
  return user ? toPublicUser(user) : null;
}

module.exports = {
  signToken,
  verifyToken,
  toPublicUser,
  setSessionCookie,
  clearSessionCookie,
  getUserFromCookieHeader,
};
