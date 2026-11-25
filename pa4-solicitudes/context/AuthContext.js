import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import * as api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    if (initialUser) return;
    let activo = true;
    api
      .fetchMe()
      .then((u) => activo && setUser(u))
      .catch(() => activo && setUser(null))
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, [initialUser]);


  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      router.push({ pathname: '/login', query: { expired: '1', next: router.asPath } });
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [router]);

  const login = useCallback(async (email, password) => {
    const u = await api.login(email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      router.push('/');
    }
  }, [router]);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
