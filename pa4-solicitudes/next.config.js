/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // no revela que el servidor usa Next.js
  compress: true, // gzip de las respuestas
  productionBrowserSourceMaps: false, // no publicar el código fuente original

  // Cabeceras básicas de endurecimiento (el hardening completo es de la sesión 15)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Los assets con hash de Next se pueden cachear "para siempre"
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  // Personalización de Webpack (sesión 13: Webpack/Babel)
  webpack(config, { isServer, buildId }) {
    // 1) Constantes de compilación disponibles en el código (se reemplazan al empaquetar)
    config.plugins.push(
      new webpack.DefinePlugin({
        __BUILD_ID__: JSON.stringify(buildId),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
        __IS_SERVER__: JSON.stringify(isServer),
      })
    );

    // 2) Alias para imports cortos: import x from '@/lib/...'
    config.resolve.alias['@'] = __dirname;

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
