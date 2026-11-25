import { apiHandler, HttpError } from '@/lib/apiHandler';
import { validateNuevaSolicitud } from '@/lib/validators';
import db from '@/lib/db';

export default apiHandler(
  {
    GET: (req, res) => {
      res.status(200).json({ ok: true, solicitudes: db.listSolicitudes(req.user) });
    },
    POST: (req, res) => {
      const errors = validateNuevaSolicitud(req.body, db.getTipos().map((t) => t.slug));
      if (Object.keys(errors).length) throw new HttpError(400, 'Revisa los datos de la solicitud', errors);

      const solicitud = db.createSolicitud({
        usuarioId: req.user.id,
        tipoSlug: req.body.tipoSlug,
        asunto: req.body.asunto.trim(),
        detalle: req.body.detalle.trim(),
      });
      res.status(201).json({ ok: true, solicitud });
    },
  },
  { auth: true }
);
