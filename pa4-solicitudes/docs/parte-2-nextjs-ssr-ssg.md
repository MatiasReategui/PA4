# Parte 2 — Next.js: SSR, SSG y rutas dinámicas (Integrante 2)

**Actividad 2 · Sesión 12 · Next.js**

## Elección de renderizado por vista
| Vista | Ruta | Estrategia | Justificación |
|---|---|---|---|
| Portada | `/` | **SSG** + ISR (1 h) | Mismo contenido para todos; se genera una vez y se sirve desde CDN. |
| Catálogo de trámites | `/tipos` | **SSG** + ISR | Público y casi no cambia; mejor tiempo de carga y SEO. |
| Detalle de trámite | `/tipos/[slug]` | **SSG** dinámico (`getStaticPaths`) | Hay un número conocido de trámites; cada uno se pre-genera. |
| Mis solicitudes | `/solicitudes` | **SSR** | Depende de **quién** pide (JWT) y de datos que cambian; no se puede pre-generar. |
| Detalle de solicitud | `/solicitudes/[id]` | **SSR** dinámico | Debe verificar permisos en cada petición y mostrar el estado actual. |

**Regla usada:** si la página es igual para todos y cambia poco → SSG. Si depende del usuario o del momento → SSR.

## Rutas dinámicas
- `pages/tipos/[slug].js` usa `getStaticPaths` (`fallback: false`: un slug inexistente da 404) y `getStaticProps`.
- `pages/solicitudes/[id].js` usa `getServerSideProps` con `params.id`.
- `/solicitudes/nueva` es una ruta fija y tiene prioridad sobre `[id]`.

## SSR con seguridad
`getServerSideProps` lee la cookie, verifica el JWT y:
- sin sesión → `redirect` a `/login?next=...`
- solicitud ajena o inexistente → `notFound` (404, para no revelar que el id existe)

## Detalles que conviene saber explicar
- El código de `getStaticProps/getServerSideProps` y sus imports (`lib/db`, `jsonwebtoken`) **no viajan al navegador**: Next los elimina del bundle del cliente.
- `revalidate: 3600` es ISR: la página estática se regenera en segundo plano como máximo cada hora.
- Las páginas `/` y `/solicitudes` muestran la hora de generación para **demostrar** la diferencia: la de `/` no cambia al recargar; la de `/solicitudes` sí.

## Evidencias
- `docs/evidencias/build-produccion.txt`: tabla de rutas del build con `●` (SSG), `ƒ` (dinámico/SSR) y los 5 paths pre-generados de `/tipos/[slug]`.
- `docs/evidencias/pruebas-smoke.txt`: redirección del SSR sin sesión, HTML con datos con sesión, 404 en ruta ajena, 404 en slug inexistente.
- Captura pendiente: "Ver código fuente" de `/tipos/revision-de-nota` (HTML ya completo) frente a una SPA vacía.

## Preguntas probables
1. ¿Por qué `/solicitudes` no puede ser SSG?
2. ¿Qué hace `fallback: false` y cuándo usarías `blocking`?
3. ¿Qué diferencia hay entre SSR y renderizar en el cliente con `useEffect`?
4. ¿Qué es ISR y por qué `/` usa `revalidate`?
5. ¿Por qué se responde 404 y no 403 en una solicitud ajena?
