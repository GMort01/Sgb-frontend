import { api } from './api';
import type { EstudianteDemo } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const estudianteService = {
  obtenerTodos: async (): Promise<EstudianteDemo[]> => {
    const response = await api.get<ApiResponse<EstudianteDemo[]>>('/usuarios/estudiantes');
    return response.data.data;
  },
};
