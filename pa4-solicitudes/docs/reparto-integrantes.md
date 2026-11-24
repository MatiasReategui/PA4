# Reparto del trabajo por integrante — PA4 (Programación Web II, ISIL 30690)

Caso: **Plataforma de Gestión de Solicitudes Académicas** (continuación de PA3).
Cada integrante es responsable de una actividad técnica (3 puntos c/u en el caso práctico), pero **todos deben poder explicar todo el proyecto**.

| Integrante | Actividad | Documento detallado |
|---|---|---|
| Integrante 1 | Actividad 1 — Consumo de APIs y sesión JWT en React | [parte-1-api-jwt-sesiones.md](parte-1-api-jwt-sesiones.md) |
| Integrante 2 | Actividad 2 — Next.js: SSR, SSG y rutas dinámicas | [parte-2-nextjs-ssr-ssg.md](parte-2-nextjs-ssr-ssg.md) |
| Integrante 3 | Actividad 3 — Despliegue en Vercel | [parte-3-despliegue-vercel.md](parte-3-despliegue-vercel.md) |
| Integrante 4 | Actividad 4 — Preparación para producción | [parte-4-produccion.md](parte-4-produccion.md) |

## Archivos por responsable

**Integrante 1 — API + JWT + sesión**
`lib/http.js`, `lib/api.js`, `lib/validators.js`, `lib/auth.js`, `lib/apiHandler.js`, `lib/db.js`,
`pages/api/auth/*`, `pages/api/solicitudes/*`, `pages/api/tipos.js`,
`context/AuthContext.js`, `pages/login.js`, `pages/solicitudes/nueva.js`, `components/Alert.js`, `scripts/smoke-test.mjs`

**Integrante 2 — Next.js (renderizado)**
`pages/index.js`, `pages/tipos/index.js`, `pages/tipos/[slug].js`,
`pages/solicitudes/index.js`, `pages/solicitudes/[id].js`,
`pages/_document.js`, `pages/404.js`, `components/Layout.js`, `components/SolicitudRow.js`, `components/EstadoBadge.js`, `styles/globals.css`

**Integrante 3 — Vercel**
`vercel.json`, `.gitignore`, `.env.example`, `package.json` (scripts y `engines`), `docs/parte-3-despliegue-vercel.md`

**Integrante 4 — Producción**
`next.config.js`, `.babelrc`, `lib/env.js`, `lib/logger.js`,
`pages/api/health.js`, `pages/api/vitals.js`, `pages/_app.js` (Analytics + `reportWebVitals`), `docs/evidencias/*`

## Cómo ejecutar y revisar

```bash
npm install
cp .env.example .env.local      # y completar JWT_SECRET
npm run dev                     # desarrollo en http://localhost:3000
npm run build && npm start      # modo producción local
npm run smoke                   # pruebas de humo (con el servidor levantado)
npm run analyze                 # informe del tamaño de los bundles
```

Cuentas de práctica: `lucia@isil.pe` (estudiante) y `coordinacion@isil.pe` (coordinador), contraseña `Isil2026!`.

## Mapa de las 4 partes

```
Navegador ──(axios/fetch, cookie httpOnly con JWT)──► /api/*  (Node.js)   ← Parte 1
    │                                                   │
    └── páginas: SSG (/, /tipos, /tipos/[slug])         └── lib/db.js (datos en memoria)
                 SSR (/solicitudes, /solicitudes/[id])  ← Parte 2
Todo se publica en Vercel                                ← Parte 3
next.config.js · .babelrc · env · logger · health        ← Parte 4
```
