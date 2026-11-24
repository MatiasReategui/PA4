import Head from 'next/head';
import Link from 'next/link';
import db from '@/lib/db';

// SSG: el contenido de portada es igual para todos los visitantes -> se genera una sola vez en el build.
export async function getStaticProps() {
  const tipos = db.getTipos();
  const promedio = Math.round((tipos.reduce((a, t) => a + t.plazoDias, 0) / tipos.length) * 10) / 10;
  return {
    props: {
      totalTipos: tipos.length,
      plazoPromedio: promedio,
      destacados: tipos.slice(0, 3).map(({ slug, nombre, resumen, plazoDias }) => ({ slug, nombre, resumen, plazoDias })),
      generadoEn: new Date().toISOString(),
    },
    revalidate: 3600, // ISR: se regenera como máximo cada hora
  };
}

export default function Home({ totalTipos, plazoPromedio, destacados, generadoEn }) {
  return (
    <>
      <Head><title>Inicio · Solicitudes Académicas</title></Head>
      <section className="hero">
        <h1>Tus trámites académicos, sin hacer cola</h1>
        <p className="lead">
          Presenta constancias, justificaciones o cambios de sección desde un solo lugar y sigue el estado de cada
          solicitud hasta que Secretaría la resuelva.
        </p>
        <div className="actions">
          <Link href="/solicitudes" className="btn btn-primary">Ver mis solicitudes</Link>
          <Link href="/tipos" className="btn btn-ghost">Conocer los trámites</Link>
        </div>
        <p className="muted small">
          {totalTipos} trámites disponibles · atención promedio en {plazoPromedio} días hábiles
        </p>
      </section>

      <section aria-labelledby="destacados">
        <h2 id="destacados">Trámites más solicitados</h2>
        <ul className="grid">
          {destacados.map((t) => (
            <li key={t.slug} className="card">
              <h3><Link href={`/tipos/${t.slug}`}>{t.nombre}</Link></h3>
              <p>{t.resumen}</p>
              <p className="muted small">Respuesta en {t.plazoDias} días hábiles</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="muted small build-info">Página estática generada el {new Date(generadoEn).toLocaleString('es-PE', { timeZone: 'America/Lima' })}</p>
    </>
  );
}
