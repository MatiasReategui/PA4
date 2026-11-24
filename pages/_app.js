import Head from 'next/head';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider initialUser={pageProps.user ?? null}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Solicitudes Académicas</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      {/* Monitoreo en Vercel: se activa desde el panel (Analytics). Fuera de Vercel no hace nada. */}
      <Analytics />
    </AuthProvider>
  );
}

// Monitoreo: Next llama a esta función con cada Web Vital medida en el navegador.
// Se envía al servidor con sendBeacon (no bloquea la navegación) y queda en los logs.
export function reportWebVitals(metric) {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    label: metric.label,
  });
  const url = (process.env.NEXT_PUBLIC_API_URL || '') + '/api/vitals';
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
  } else {
    fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true });
  }
}
