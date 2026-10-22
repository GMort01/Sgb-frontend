import { api } from './api';
import type { Usuario } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const usuarioService = {
  obtenerTodos: async (): Promise<Usuario[]> => {
    const response = await api.get<ApiResponse<Usuario[]>>('/usuarios');
    return response.data.data;
  },
  crear: async (usuario: Omit<Usuario, 'id'>): Promise<Usuario> => {
    const response = await api.post<ApiResponse<Usuario>>('/usuarios', usuario);
    return response.data.data;
  },
};
