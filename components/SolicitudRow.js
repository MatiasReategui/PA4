import Link from 'next/link';
import EstadoBadge from './EstadoBadge';

export function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Lima' });
}

export default function SolicitudRow({ solicitud, tipoNombre, solicitante }) {
  return (
    <li className="row">
      <div className="row-main">
        <Link href={`/solicitudes/${solicitud.id}`} className="row-title">{solicitud.asunto}</Link>
        <p className="muted">
          {tipoNombre} · {formatFecha(solicitud.creadaEn)}
          {solicitante ? ` · ${solicitante}` : ''}
        </p>
      </div>
      <EstadoBadge estado={solicitud.estado} />
    </li>
  );
}
