import { apiHandler } from '@/lib/apiHandler';
import db from '@/lib/db';

export default apiHandler({
  GET: (req, res) => {
   
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ ok: true, tipos: db.getTipos() });
  },
});
