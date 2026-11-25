import Head from 'next/head';
import Link from 'next/link';
import db from '@/lib/db';

// SSG: el catálogo de trámites cambia muy poco y es público -> HTML estático, rápido y cacheable en CDN.
export async function getStaticProps() {
  return { props: { tipos: db.getTipos() }, revalidate: 3600 };
}

export default function Tipos({ tipos }) {
  return (
    <>
      <Head><title>Trámites · Solicitudes Académicas</title></Head>
      <h1>Trámites disponibles</h1>
      <p className="lead">Revisa los requisitos y plazos antes de presentar tu solicitud.</p>
      <ul className="grid">
        {tipos.map((t) => (
          <li key={t.slug} className="card">
            <h2 className="card-title"><Link href={`/tipos/${t.slug}`}>{t.nombre}</Link></h2>
            <p>{t.resumen}</p>
            <p className="muted small">Respuesta en {t.plazoDias} días hábiles · {t.modalidad}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
