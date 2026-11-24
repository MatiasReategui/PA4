import Head from 'next/head';
import Link from 'next/link';
import { getUserFromCookieHeader } from '@/lib/auth';
import db from '@/lib/db';
import SolicitudRow from '@/components/SolicitudRow';

// SSR: la lista depende de QUIÉN pregunta (JWT en la cookie) y de datos que cambian a cada rato.
// No se puede generar en el build; se arma en el servidor en cada petición.
export async function getServerSideProps({ req, resolvedUrl }) {
  const user = getUserFromCookieHeader(req.headers.cookie);
  if (!user) {
    return { redirect: { destination: `/login?next=${encodeURIComponent(resolvedUrl)}`, permanent: false } };
  }

  const solicitudes = db.listSolicitudes(user);
  const tipos = Object.fromEntries(db.getTipos().map((t) => [t.slug, t.nombre]));
  const solicitantes =
    user.rol === 'coordinador'
      ? Object.fromEntries(solicitudes.map((s) => [s.id, db.findUserById(s.usuarioId)?.nombre]))
      : {};

  return {
    props: { user, solicitudes, tipos, solicitantes, generadoEn: new Date().toISOString() },
  };
}

export default function MisSolicitudes({ user, solicitudes, tipos, solicitantes, generadoEn }) {
  const esCoord = user.rol === 'coordinador';
  return (
    <>
      <Head><title>{esCoord ? 'Bandeja de solicitudes' : 'Mis solicitudes'} · Solicitudes Académicas</title></Head>
      <div className="title-row">
        <h1>{esCoord ? 'Bandeja de solicitudes' : 'Mis solicitudes'}</h1>
        {!esCoord && <Link href="/solicitudes/nueva" className="btn btn-primary">Nueva solicitud</Link>}
      </div>

      {solicitudes.length === 0 ? (
        <div className="empty">
          <p>Todavía no has presentado ninguna solicitud.</p>
          <Link href="/solicitudes/nueva" className="btn btn-primary">Presentar la primera</Link>
        </div>
      ) : (
        <ul className="rows">
          {solicitudes.map((s) => (
            <SolicitudRow key={s.id} solicitud={s} tipoNombre={tipos[s.tipoSlug]} solicitante={solicitantes[s.id]} />
          ))}
        </ul>
      )}
      <p className="muted small build-info">Renderizado en el servidor el {new Date(generadoEn).toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })}</p>
    </>
  );
}
