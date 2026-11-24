import { apiHandler } from '@/lib/apiHandler';
import logger from '@/lib/logger';

// Recibe las Web Vitals que mide el navegador (LCP, CLS, INP, TTFB...) y las deja en los logs.
export default apiHandler({
  POST: (req, res) => {
    const { name, value, id, label } = req.body || {};
    if (typeof name === 'string' && typeof value === 'number') {
      logger.info('web-vital', { name, value: Math.round(value * 100) / 100, id, label });
    }
    res.status(204).end();
  },
});
