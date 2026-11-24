const ETIQUETAS = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

export default function EstadoBadge({ estado }) {
  return <span className={`badge badge-${estado}`}>{ETIQUETAS[estado] || estado}</span>;
}
export { ETIQUETAS };
