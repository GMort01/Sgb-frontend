import { api } from './api';
import type { Usuario } from '../types';

const TOKEN_KEY = 'sgb-access-token';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export class RolNoPermitidoError extends Error {
  constructor() {
    super('La cuenta no corresponde al tipo de acceso seleccionado.');
    this.name = 'RolNoPermitidoError';
  }
}

export const authService = {
  token: () => window.sessionStorage.getItem(TOKEN_KEY),
  guardarToken: (token: string) => window.sessionStorage.setItem(TOKEN_KEY, token),
  cerrarSesion: () => window.sessionStorage.removeItem(TOKEN_KEY),
  iniciarSesion: async (
    correo: string,
    password: string,
    rolesPermitidos?: Usuario['rol'][],
  ): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { correo, password });
    const session = response.data.data;
    if (rolesPermitidos && !rolesPermitidos.includes(session.usuario.rol)) {
      throw new RolNoPermitidoError();
    }
    authService.guardarToken(session.token);
    return session;
  },
  obtenerPerfil: async (): Promise<Usuario> => {
    const response = await api.get<ApiResponse<Usuario>>('/auth/me');
    return response.data.data;
  },
};
