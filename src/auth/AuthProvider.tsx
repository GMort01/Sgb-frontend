import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { Usuario } from '../types';
import { AuthContext, type AuthContextValue } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(() => Boolean(authService.token()));

  useEffect(() => {
    const cerrarSesion = () => {
      authService.cerrarSesion();
      setUsuario(null);
      setCargando(false);
    };
    window.addEventListener('sgb:unauthorized', cerrarSesion);
    if (!authService.token()) {
      return () => window.removeEventListener('sgb:unauthorized', cerrarSesion);
    }
    authService.obtenerPerfil()
      .then(setUsuario)
      .catch(() => {
        authService.cerrarSesion();
        setUsuario(null);
      })
      .finally(() => setCargando(false));
    return () => window.removeEventListener('sgb:unauthorized', cerrarSesion);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    usuario,
    cargando,
    async iniciarSesion(correo, password, rolesPermitidos) {
      const session = await authService.iniciarSesion(correo, password, rolesPermitidos);
      setUsuario(session.usuario);
      return session.usuario;
    },
    cerrarSesion() {
      authService.cerrarSesion();
      setUsuario(null);
    },
  }), [cargando, usuario]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
