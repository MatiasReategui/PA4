import Head from 'next/head';
import Link from 'next/link';
import db from '@/lib/db';
import { useAuth } from '@/context/AuthContext';

// Ruta dinámica + SSG: getStaticPaths indica QUÉ páginas generar; getStaticProps trae los datos de cada una.
export async function getStaticPaths() {
  return {
    paths: db.getTipos().map((t) => ({ params: { slug: t.slug } })),
    fallback: false, // cualquier otro slug devuelve 404
  };
}

export async function getStaticProps({ params }) {
  const tipo = db.getTipo(params.slug);
  if (!tipo) return { notFound: true };
  return { props: { tipo }, revalidate: 3600 };
}

export default function TipoDetalle({ tipo }) {
  const { user } = useAuth();
  return (
    <>
      <Head>
        <title>{tipo.nombre} · Solicitudes Académicas</title>
        <meta name="description" content={tipo.resumen} />
      </Head>
      <p className="muted small"><Link href="/tipos">← Todos los trámites</Link></p>
      <h1>{tipo.nombre}</h1>
      <p className="lead">{tipo.descripcion}</p>

      <dl className="facts">
        <div><dt>Plazo de respuesta</dt><dd>{tipo.plazoDias} días hábiles</dd></div>
        <div><dt>Modalidad</dt><dd>{tipo.modalidad}</dd></div>
      </dl>

      <h2>Requisitos</h2>
      <ul className="checklist">
        {tipo.requisitos.map((r) => <li key={r}>{r}</li>)}
      </ul>

      {(!user || user.rol === 'estudiante') && (
        <Link
          href={user ? `/solicitudes/nueva?tipo=${tipo.slug}` : `/login?next=${encodeURIComponent(`/solicitudes/nueva?tipo=${tipo.slug}`)}`}
          className="btn btn-primary"
        >
          Solicitar este trámite
        </Link>
      )}
    </>
  );
}
