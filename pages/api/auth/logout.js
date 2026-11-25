import { apiHandler } from '@/lib/apiHandler';
import { clearSessionCookie } from '@/lib/auth';

export default apiHandler({
  POST: (req, res) => {
    clearSessionCookie(res);
    res.status(200).json({ ok: true });
  },
});
