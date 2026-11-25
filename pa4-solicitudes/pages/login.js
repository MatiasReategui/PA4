import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { validateLogin } from '@/lib/validators';
import Alert from '@/components/Alert';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [sending, setSending] = useState(false);

  const next = typeof router.query.next === 'string' && router.query.next.startsWith('/') ? router.query.next : '/solicitudes';

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setApiError('');
    const v = validateLogin(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setSending(true);
    try {
      await login(form.email, form.password);
      router.push(next);
    } catch (err) {
      setApiError(err.message);
      if (err.details) setErrors(err.details);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Head><title>Iniciar sesión · Solicitudes Académicas</title></Head>
      <div className="narrow">
        <h1>Iniciar sesión</h1>
        {router.query.expired && <Alert type="info">Tu sesión venció. Inicia sesión de nuevo para continuar.</Alert>}
        <Alert>{apiError}</Alert>
        <form onSubmit={onSubmit} noValidate className="form">
          <label>
            Correo institucional
            <input name="email" type="email" autoComplete="username" value={form.email} onChange={onChange} aria-invalid={!!errors.email} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>
          <label>
            Contraseña
            <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} aria-invalid={!!errors.password} />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
          <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? 'Ingresando…' : 'Ingresar'}</button>
        </form>
        <aside className="demo-box">
          <strong>Cuentas de práctica</strong>
          <p className="small">Estudiante: lucia@isil.pe · Coordinación: coordinacion@isil.pe<br />Contraseña: Isil2026!</p>
        </aside>
      </div>
    </>
  );
}
