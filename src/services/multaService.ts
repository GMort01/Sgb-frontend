import { api } from './api';
import type { Multa } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const multaService = {
  obtenerTodas: async (): Promise<Multa[]> => {
    const response = await api.get<ApiResponse<Multa[]>>('/multas');
    return response.data.data;
  },
  crear: async (multa: { usuarioId: number; concepto: string; monto: number; fecha: string }): Promise<Multa> => {
    const response = await api.post<ApiResponse<Multa>>('/multas', multa);
    return response.data.data;
  },
  marcarPagada: async (id: number): Promise<Multa> => {
    const response = await api.patch<ApiResponse<Multa>>(`/multas/${id}/pagar`);
    return response.data.data;
  },
};
