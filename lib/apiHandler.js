const { getUserFromCookieHeader } = require('./auth');
const logger = require('./logger');

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function apiHandler(handlers, { auth = false, roles } = {}) {
  return async function handler(req, res) {
    const inicio = Date.now();
    const requestId = Math.random().toString(36).slice(2, 10);
    res.setHeader('X-Request-Id', requestId);

    try {
      const fn = handlers[req.method];
      if (!fn) {
        res.setHeader('Allow', Object.keys(handlers));
        throw new HttpError(405, `Método ${req.method} no permitido`);
      }

      if (auth) {
        const user = getUserFromCookieHeader(req.headers.cookie);
        if (!user) throw new HttpError(401, 'Sesión no válida o expirada');
        if (roles && !roles.includes(user.rol)) throw new HttpError(403, 'No tienes permiso para esta acción');
        req.user = user;
      }

      await fn(req, res);
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      if (status >= 500) {
        logger.error('Error no controlado en API', { requestId, url: req.url, error: err.message });
      }
      if (!res.writableEnded) {
        res.status(status).json({
          ok: false,
          error: status >= 500 ? 'Error interno del servidor' : err.message,
          ...(err.details ? { details: err.details } : {}),
        });
      }
    } finally {
      logger.info('api', {
        requestId,
        method: req.method,
        url: req.url,
        status: res.statusCode,
        ms: Date.now() - inicio,
        user: req.user?.id ?? null,
      });
    }
  };
}

module.exports = { apiHandler, HttpError };
