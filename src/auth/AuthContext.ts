import { createContext } from 'react';
import type { Usuario } from '../types';

export interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (correo: string, password: string) => Promise<Usuario>;
  cerrarSesion: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
