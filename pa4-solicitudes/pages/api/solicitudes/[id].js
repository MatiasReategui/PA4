import { apiHandler, HttpError } from '@/lib/apiHandler';
import db from '@/lib/db';

function cargarSolicitud(req) {
  const s = db.getSolicitud(req.query.id);
  if (!s) throw new HttpError(404, 'La solicitud no existe');

  if (req.user.rol !== 'coordinador' && s.usuarioId !== req.user.id) {
    throw new HttpError(403, 'No tienes permiso para ver esta solicitud');
  }
  return s;
}

export default apiHandler(
  {
    GET: (req, res) => res.status(200).json({ ok: true, solicitud: cargarSolicitud(req) }),
    PATCH: (req, res) => {
      if (req.user.rol !== 'coordinador') throw new HttpError(403, 'Solo Coordinación puede cambiar el estado');
      cargarSolicitud(req);
      if (!db.ESTADOS.includes(req.body?.estado)) throw new HttpError(400, 'Estado no válido');
      res.status(200).json({ ok: true, solicitud: db.updateEstado(req.query.id, req.body.estado) });
    },
  },
  { auth: true }
);
