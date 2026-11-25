const BASE = process.env.BASE_URL || 'http://localhost:3000';
let fallos = 0;

async function paso(nombre, fn) {
  try {
    await fn();
    console.log(`✔ ${nombre}`);
  } catch (e) {
    fallos++;
    console.log(`✘ ${nombre} -> ${e.message}`);
  }
}
function esperar(cond, msg) { if (!cond) throw new Error(msg); }

const json = (body) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
let cookie = '';
let cookieCoord = '';

await paso('GET /api/health responde up', async () => {
  const r = await fetch(`${BASE}/api/health`);
  esperar(r.status === 200 && (await r.json()).status === 'up', 'health no está up');
});
await paso('GET /api/tipos (público) devuelve el catálogo', async () => {
  const d = await (await fetch(`${BASE}/api/tipos`)).json();
  esperar(Array.isArray(d.tipos) && d.tipos.length >= 5, 'catálogo incompleto');
});
await paso('GET /api/solicitudes sin sesión -> 401', async () => {
  esperar((await fetch(`${BASE}/api/solicitudes`)).status === 401, 'debía ser 401');
});
await paso('POST /api/auth/login con datos inválidos -> 400', async () => {
  esperar((await fetch(`${BASE}/api/auth/login`, json({ email: 'x', password: '1' }))).status === 400, 'debía ser 400');
});
await paso('POST /api/auth/login con clave incorrecta -> 401', async () => {
  esperar((await fetch(`${BASE}/api/auth/login`, json({ email: 'lucia@isil.pe', password: 'incorrecta1' }))).status === 401, 'debía ser 401');
});
await paso('POST /api/auth/login correcto entrega cookie httpOnly con JWT', async () => {
  const r = await fetch(`${BASE}/api/auth/login`, json({ email: 'lucia@isil.pe', password: 'Isil2026!' }));
  esperar(r.status === 200, `status ${r.status}`);
  const sc = r.headers.get('set-cookie') || '';
  esperar(/sa_token=eyJ/.test(sc), 'no llegó el JWT en la cookie');
  esperar(/HttpOnly/i.test(sc), 'la cookie no es HttpOnly');
  cookie = sc.split(';')[0];
});
await paso('GET /api/auth/me con cookie devuelve el usuario', async () => {
  const d = await (await fetch(`${BASE}/api/auth/me`, { headers: { cookie } })).json();
  esperar(d.user?.email === 'lucia@isil.pe', 'usuario incorrecto');
});
await paso('JWT manipulado es rechazado -> 401', async () => {
  const falso = cookie.slice(0, -3) + 'abc';
  esperar((await fetch(`${BASE}/api/auth/me`, { headers: { cookie: falso } })).status === 401, 'debía ser 401');
});
await paso('Estudiante solo ve sus solicitudes', async () => {
  const d = await (await fetch(`${BASE}/api/solicitudes`, { headers: { cookie } })).json();
  esperar(d.solicitudes.every((s) => s.usuarioId === 1), 'se filtraron solicitudes de otro usuario');
});
await paso('Crear solicitud inválida -> 400 con detalles', async () => {
  const r = await fetch(`${BASE}/api/solicitudes`, { ...json({ tipoSlug: 'x', asunto: 'a', detalle: 'b' }), headers: { 'Content-Type': 'application/json', cookie } });
  const d = await r.json();
  esperar(r.status === 400 && d.details?.asunto, 'debía rechazar con detalles');
});
let nuevoId;
await paso('Crear solicitud válida -> 201', async () => {
  const r = await fetch(`${BASE}/api/solicitudes`, {
    ...json({ tipoSlug: 'constancia-de-estudios', asunto: 'Constancia para beca', detalle: 'Necesito la constancia para presentarla en la convocatoria de becas.' }),
    headers: { 'Content-Type': 'application/json', cookie },
  });
  const d = await r.json();
  esperar(r.status === 201 && d.solicitud.estado === 'pendiente', 'no se creó');
  nuevoId = d.solicitud.id;
});
await paso('Estudiante NO puede ver solicitud ajena (id 3) -> 403', async () => {
  esperar((await fetch(`${BASE}/api/solicitudes/3`, { headers: { cookie } })).status === 403, 'debía ser 403');
});
await paso('Estudiante NO puede cambiar estados -> 403', async () => {
  const r = await fetch(`${BASE}/api/solicitudes/${nuevoId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ estado: 'aprobada' }) });
  esperar(r.status === 403, `status ${r.status}`);
});
await paso('Coordinación puede cambiar el estado', async () => {
  const l = await fetch(`${BASE}/api/auth/login`, json({ email: 'coordinacion@isil.pe', password: 'Isil2026!' }));
  cookieCoord = (l.headers.get('set-cookie') || '').split(';')[0];
  const r = await fetch(`${BASE}/api/solicitudes/${nuevoId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', cookie: cookieCoord }, body: JSON.stringify({ estado: 'aprobada' }) });
  esperar(r.status === 200 && (await r.json()).solicitud.estado === 'aprobada', 'no cambió el estado');
});
await paso('SSR: /solicitudes sin sesión redirige a /login', async () => {
  const r = await fetch(`${BASE}/solicitudes`, { redirect: 'manual' });
  esperar([302, 307].includes(r.status) && r.headers.get('location')?.startsWith('/login'), `status ${r.status}`);
});
await paso('SSR: /solicitudes con sesión devuelve HTML con datos', async () => {
  const html = await (await fetch(`${BASE}/solicitudes`, { headers: { cookie } })).text();
  esperar(html.includes('Mis solicitudes') && html.includes('Constancia para beca'), 'HTML sin datos del usuario');
});
await paso('SSR: /solicitudes/3 de otro usuario -> 404', async () => {
  esperar((await fetch(`${BASE}/solicitudes/3`, { headers: { cookie } })).status === 404, 'debía ser 404');
});
await paso('SSG: /tipos/revision-de-nota existe y /tipos/inventado -> 404', async () => {
  const ok = await fetch(`${BASE}/tipos/revision-de-nota`);
  esperar(ok.status === 200 && (await ok.text()).includes('Revisión de nota'), 'ruta dinámica SSG falló');
  esperar((await fetch(`${BASE}/tipos/inventado`)).status === 404, 'debía ser 404');
});
await paso('POST /api/auth/logout limpia la cookie', async () => {
  const r = await fetch(`${BASE}/api/auth/logout`, { method: 'POST', headers: { cookie } });
  esperar(/Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(r.headers.get('set-cookie') || ''), 'cookie no expirada');
});

console.log(fallos ? `\n${fallos} prueba(s) fallaron` : '\nTodas las pruebas pasaron');
process.exit(fallos ? 1 : 0);
