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

export const authService = {
  token: () => window.sessionStorage.getItem(TOKEN_KEY),
  guardarToken: (token: string) => window.sessionStorage.setItem(TOKEN_KEY, token),
  cerrarSesion: () => window.sessionStorage.removeItem(TOKEN_KEY),
  iniciarSesion: async (correo: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { correo, password });
    authService.guardarToken(response.data.data.token);
    return response.data.data;
  },
  obtenerPerfil: async (): Promise<Usuario> => {
    const response = await api.get<ApiResponse<Usuario>>('/auth/me');
    return response.data.data;
  },
};
