import { apiHandler } from '@/lib/apiHandler';

export default apiHandler(
  {
    GET: (req, res) => res.status(200).json({ ok: true, user: req.user }),
  },
  { auth: true }
);
