import { apiClient, fetchJson } from './http';
import { assertUser, assertSolicitud, assertTipo, assertArray } from './validators';

export async function login(email, password) {
  const { data } = await apiClient.post('/api/auth/login', { email, password });
  return assertUser(data.user);
}

export async function logout() {
  await apiClient.post('/api/auth/logout');
}

export async function fetchMe() {
  const { data } = await apiClient.get('/api/auth/me');
  return assertUser(data.user);
}

export async function fetchTipos() {
  const data = await fetchJson('/api/tipos');
  return assertArray(data.tipos, assertTipo);
}

export async function fetchSolicitudes() {
  const { data } = await apiClient.get('/api/solicitudes');
  return assertArray(data.solicitudes, assertSolicitud);
}

export async function crearSolicitud(payload) {
  const { data } = await apiClient.post('/api/solicitudes', payload);
  return assertSolicitud(data.solicitud);
}

export async function actualizarEstado(id, estado) {
  const { data } = await apiClient.patch(`/api/solicitudes/${id}`, { estado });
  return assertSolicitud(data.solicitud);
}
