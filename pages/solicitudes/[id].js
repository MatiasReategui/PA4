import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getUserFromCookieHeader } from '@/lib/auth';
import db from '@/lib/db';
import { actualizarEstado } from '@/lib/api';
import EstadoBadge, { ETIQUETAS } from '@/components/EstadoBadge';
import Alert from '@/components/Alert';
import { formatFecha } from '@/components/SolicitudRow';

// Ruta dinámica + SSR: cada solicitud se resuelve en el servidor y se comprueba el permiso con el JWT.
export async function getServerSideProps({ req, params, resolvedUrl }) {
  const user = getUserFromCookieHeader(req.headers.cookie);
  if (!user) {
    return { redirect: { destination: `/login?next=${encodeURIComponent(resolvedUrl)}`, permanent: false } };
  }

  const solicitud = db.getSolicitud(params.id);
  const puedeVer = solicitud && (user.rol === 'coordinador' || solicitud.usuarioId === user.id);
  // Si no es suya respondemos 404 (y no 403) para no revelar que ese id existe.
  if (!puedeVer) return { notFound: true };

  return {
    props: {
      user,
      solicitud,
      tipo: db.getTipo(solicitud.tipoSlug) ?? null,
      solicitante: db.findUserById(solicitud.usuarioId)?.nombre ?? null,
      estados: db.ESTADOS,
    },
  };
}

export default function SolicitudDetalle({ user, solicitud: inicial, tipo, solicitante, estados }) {
  const [solicitud, setSolicitud] = useState(inicial);
  const [estado, setEstado] = useState(inicial.estado);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  async function guardar(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const actualizada = await actualizarEstado(solicitud.id, estado);
      setSolicitud(actualizada);
      setMsg({ type: 'success', text: `Estado actualizado a “${ETIQUETAS[actualizada.estado]}”.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head><title>{solicitud.asunto} · Solicitudes Académicas</title></Head>
      <p className="muted small"><Link href="/solicitudes">← Volver a solicitudes</Link></p>
      <div className="title-row">
        <h1>{solicitud.asunto}</h1>
        <EstadoBadge estado={solicitud.estado} />
      </div>

      <dl className="facts">
        <div><dt>Trámite</dt><dd>{tipo ? <Link href={`/tipos/${tipo.slug}`}>{tipo.nombre}</Link> : solicitud.tipoSlug}</dd></div>
        <div><dt>Presentada el</dt><dd>{formatFecha(solicitud.creadaEn)}</dd></div>
        {user.rol === 'coordinador' && <div><dt>Solicitante</dt><dd>{solicitante}</dd></div>}
      </dl>

      <h2>Detalle</h2>
      <p className="detalle">{solicitud.detalle}</p>

      {user.rol === 'coordinador' && (
        <form onSubmit={guardar} className="form inline-form">
          <h2>Resolver solicitud</h2>
          <Alert type={msg.type}>{msg.text}</Alert>
          <label>
            Estado
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              {estados.map((s) => <option key={s} value={s}>{ETIQUETAS[s]}</option>)}
            </select>
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving || estado === solicitud.estado}>
            {saving ? 'Guardando…' : 'Guardar estado'}
          </button>
        </form>
      )}
    </>
  );
}
