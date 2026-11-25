import bcrypt from 'bcryptjs';
import { apiHandler, HttpError } from '@/lib/apiHandler';
import { signToken, setSessionCookie, toPublicUser } from '@/lib/auth';
import { validateLogin } from '@/lib/validators';
import db from '@/lib/db';
import logger from '@/lib/logger';

export default apiHandler({
  POST: async (req, res) => {
    const errors = validateLogin(req.body);
    if (Object.keys(errors).length) throw new HttpError(400, 'Datos de acceso inválidos', errors);

    const user = db.findUserByEmail(req.body.email);
    const ok = user && (await bcrypt.compare(req.body.password, user.passwordHash));
    if (!ok) {
      logger.warn('login fallido', { email: req.body.email });
      throw new HttpError(401, 'Correo o contraseña incorrectos');
    }

    setSessionCookie(res, signToken(user));
    logger.info('login correcto', { userId: user.id });
    res.status(200).json({ ok: true, user: toPublicUser(user) });
  },
});
