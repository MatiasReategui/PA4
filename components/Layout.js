import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Solicitudes Académicas';

function NavLink({ href, children }) {
  const { pathname } = useRouter();
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
  return (
    <Link href={href} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  );
}

export default function Layout({ children }) {
  const { user, loading, logout } = useAuth();
  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <header className="site-header">
        <div className="wrap header-row">
          <Link href="/" className="brand">{APP_NAME}</Link>
          <nav aria-label="Principal" className="nav">
            <NavLink href="/tipos">Trámites</NavLink>
            {user && <NavLink href="/solicitudes">Mis solicitudes</NavLink>}
            {user && user.rol === 'estudiante' && <NavLink href="/solicitudes/nueva">Nueva solicitud</NavLink>}
          </nav>
          <div className="session">
            {loading ? null : user ? (
              <>
                <span className="session-name">{user.nombre}</span>
                <button type="button" className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary">Iniciar sesión</Link>
            )}
          </div>
        </div>
      </header>
      <main id="contenido" className="wrap main">{children}</main>
      <footer className="site-footer">
        <div className="wrap">Práctica PA4 · Programación Web II · ISIL</div>
      </footer>
    </>
  );
}
