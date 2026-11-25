const bcrypt = require('bcryptjs');

const DEMO_PASSWORD = 'Isil2026!';
const hash = bcrypt.hashSync(DEMO_PASSWORD, 8);

const usuarios = [
  { id: 1, nombre: 'Lucía Ramos', email: 'lucia@isil.pe', rol: 'estudiante', passwordHash: hash },
  { id: 2, nombre: 'Mateo Quispe', email: 'mateo@isil.pe', rol: 'estudiante', passwordHash: hash },
  { id: 3, nombre: 'Coordinación Académica', email: 'coordinacion@isil.pe', rol: 'coordinador', passwordHash: hash },
];

const tipos = [
  {
    slug: 'constancia-de-estudios',
    nombre: 'Constancia de estudios',
    resumen: 'Documento que acredita que estás matriculado en el periodo vigente.',
    descripcion:
      'Sirve para trámites externos (becas, prácticas, bancos). Se emite en formato digital con firma de Secretaría Académica.',
    plazoDias: 2,
    requisitos: ['Estar matriculado en el periodo actual', 'No tener deudas pendientes con Tesorería'],
    modalidad: 'Virtual',
  },
  {
    slug: 'reserva-de-matricula',
    nombre: 'Reserva de matrícula',
    resumen: 'Pausa tu carrera por un periodo sin perder tu vacante.',
    descripcion:
      'Permite congelar la matrícula por uno o dos periodos. Debe solicitarse antes de que termine la tercera semana de clases.',
    plazoDias: 5,
    requisitos: ['Haber cursado al menos un periodo', 'Presentar el motivo de la reserva'],
    modalidad: 'Virtual',
  },
  {
    slug: 'justificacion-de-inasistencia',
    nombre: 'Justificación de inasistencia',
    resumen: 'Regulariza faltas por salud, trabajo o fuerza mayor.',
    descripcion:
      'Debe presentarse máximo 72 horas después de la falta, con el sustento correspondiente en el detalle de la solicitud.',
    plazoDias: 3,
    requisitos: ['Indicar fecha y curso de la inasistencia', 'Describir el sustento'],
    modalidad: 'Virtual',
  },
  {
    slug: 'cambio-de-seccion',
    nombre: 'Cambio de sección',
    resumen: 'Pasa a otro horario o grupo del mismo curso.',
    descripcion:
      'Sujeto a disponibilidad de vacantes. Se atiende en orden de llegada durante las dos primeras semanas del periodo.',
    plazoDias: 4,
    requisitos: ['Indicar curso y sección actual', 'Indicar la sección deseada'],
    modalidad: 'Virtual',
  },
  {
    slug: 'revision-de-nota',
    nombre: 'Revisión de nota',
    resumen: 'Pide que se revise una calificación publicada.',
    descripcion:
      'Procede dentro de los 3 días hábiles posteriores a la publicación de la nota. El docente y Coordinación emiten un informe.',
    plazoDias: 7,
    requisitos: ['Indicar curso, evaluación y nota publicada', 'Explicar el motivo de la revisión'],
    modalidad: 'Virtual',
  },
];

const ahora = Date.now();
const dia = 86400000;

const solicitudes = [
  {
    id: 1,
    usuarioId: 1,
    tipoSlug: 'constancia-de-estudios',
    asunto: 'Constancia para postular a prácticas',
    detalle: 'La necesito para presentarla en una empresa que me pide documento de matrícula vigente.',
    estado: 'aprobada',
    creadaEn: new Date(ahora - 6 * dia).toISOString(),
  },
  {
    id: 2,
    usuarioId: 1,
    tipoSlug: 'cambio-de-seccion',
    asunto: 'Cambio de sección en Programación Web II',
    detalle: 'Mi horario de trabajo cambió y me cruza con la sección actual. Solicito pasar a la sección de la noche.',
    estado: 'en_revision',
    creadaEn: new Date(ahora - 2 * dia).toISOString(),
  },
  {
    id: 3,
    usuarioId: 2,
    tipoSlug: 'revision-de-nota',
    asunto: 'Revisión de nota de PA2',
    detalle: 'Considero que la rúbrica de la actividad 3 no se aplicó correctamente. Adjunto mi sustento en el repositorio.',
    estado: 'pendiente',
    creadaEn: new Date(ahora - 1 * dia).toISOString(),
  },
];

const g = globalThis;
if (!g.__SA_STATE__) g.__SA_STATE__ = { solicitudes, nextId: solicitudes.length + 1 };
const state = g.__SA_STATE__;

module.exports = {
  DEMO_PASSWORD,
  ESTADOS: ['pendiente', 'en_revision', 'aprobada', 'rechazada'],
  findUserByEmail: (email) => usuarios.find((u) => u.email.toLowerCase() === String(email).toLowerCase()),
  findUserById: (id) => usuarios.find((u) => u.id === id),
  getTipos: () => tipos,
  getTipo: (slug) => tipos.find((t) => t.slug === slug),
  listSolicitudes: (user) =>
    state.solicitudes
      .filter((s) => user.rol === 'coordinador' || s.usuarioId === user.id)
      .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn)),
  getSolicitud: (id) => state.solicitudes.find((s) => s.id === Number(id)),
  createSolicitud: ({ usuarioId, tipoSlug, asunto, detalle }) => {
    const s = {
      id: state.nextId++,
      usuarioId,
      tipoSlug,
      asunto,
      detalle,
      estado: 'pendiente',
      creadaEn: new Date().toISOString(),
    };
    state.solicitudes.push(s);
    return s;
  },
  updateEstado: (id, estado) => {
    const s = state.solicitudes.find((x) => x.id === Number(id));
    if (s) s.estado = estado;
    return s;
  },
};
