import { apiHandler } from '@/lib/apiHandler';

// Endpoint de salud: lo puede consultar un monitor externo (UptimeRobot, Better Stack, etc.)
export default apiHandler({
  GET: (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      ok: true,
      status: 'up',
      uptimeSeconds: Math.round(process.uptime()),
      node: process.version,
      env: process.env.NODE_ENV,
      buildId: typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev',
      builtAt: typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : null,
      timestamp: new Date().toISOString(),
    });
  },
});
