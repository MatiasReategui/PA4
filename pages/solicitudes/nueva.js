import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { crearSolicitud, fetchTipos } from '@/lib/api';
import { validateNuevaSolicitud } from '@/lib/validators';
import Alert from '@/components/Alert';

export default function NuevaSolicitud() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tipos, setTipos] = useState([]);
  const [tiposError, setTiposError] = useState('');
  const [form, setForm] = useState({ tipoSlug: '', asunto: '', detalle: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace({ pathname: '/login', query: { next: router.asPath } });
    else if (user.rol !== 'estudiante') router.replace('/solicitudes');
  }, [loading, user, router]);

  
  function cargarTipos() {
    setTiposError('');
    fetchTipos()
      .then(setTipos)
      .catch((err) => setTiposError(err.message));
  }
  useEffect(cargarTipos, []);

  
  useEffect(() => {
    if (router.isReady && typeof router.query.tipo === 'string') {
      setForm((f) => ({ ...f, tipoSlug: router.query.tipo }));
    }
  }, [router.isReady, router.query.tipo]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setApiError('');
    const v = validateNuevaSolicitud(form, tipos.map((t) => t.slug));
    setErrors(v);
    if (Object.keys(v).length) return;

    setSending(true);
    try {
      const nueva = await crearSolicitud(form);
      router.push(`/solicitudes/${nueva.id}`);
    } catch (err) {
      setApiError(err.message);
      if (err.details) setErrors(err.details);
      setSending(false);
    }
  }

  if (loading || !user || user.rol !== 'estudiante') return <p className="muted">Cargando…</p>;

  return (
    <>
      <Head><title>Nueva solicitud · Solicitudes Académicas</title></Head>
      <div className="narrow">
        <h1>Nueva solicitud</h1>
        {tiposError && (
          <Alert>
            {tiposError}{' '}
            <button type="button" className="link-btn" onClick={cargarTipos}>Reintentar</button>
          </Alert>
        )}
        <Alert>{apiError}</Alert>
        <form onSubmit={onSubmit} noValidate className="form">
          <label>
            Tipo de trámite
            <select name="tipoSlug" value={form.tipoSlug} onChange={onChange} aria-invalid={!!errors.tipoSlug}>
              <option value="">Selecciona…</option>
              {tipos.map((t) => <option key={t.slug} value={t.slug}>{t.nombre}</option>)}
            </select>
            {errors.tipoSlug && <span className="field-error">{errors.tipoSlug}</span>}
          </label>
          <label>
            Asunto
            <input name="asunto" value={form.asunto} onChange={onChange} maxLength={80} aria-invalid={!!errors.asunto} />
            {errors.asunto && <span className="field-error">{errors.asunto}</span>}
          </label>
          <label>
            Detalle
            <textarea name="detalle" rows={6} value={form.detalle} onChange={onChange} maxLength={600} aria-invalid={!!errors.detalle} />
            <span className="muted small">{form.detalle.length}/600</span>
            {errors.detalle && <span className="field-error">{errors.detalle}</span>}
          </label>
          <button type="submit" className="btn btn-primary" disabled={sending || !!tiposError}>
            {sending ? 'Enviando…' : 'Enviar solicitud'}
          </button>
        </form>
      </div>
    </>
  );
}
