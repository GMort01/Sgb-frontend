import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import type { Usuario } from '../types';

type Rol = Usuario['rol'];

export function RequireRole({ roles, children }: { roles: Rol[]; children: ReactNode }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <main className="p-8 text-center text-slate-500">Verificando sesión...</main>;
  }
  if (!usuario) {
    const loginPath = roles.includes('Bibliotecario') ? '/login/bibliotecario' : '/login/comunidad';
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }
  if (!roles.includes(usuario.rol)) {
    return <Navigate to={usuario.rol === 'Bibliotecario' ? '/bibliotecario' : '/estudiante'} replace />;
  }
  return children;
}
