import { api } from './api';
import type { Recurso } from '../types';

export const recursoService = {
  obtenerTodos: async (): Promise<Recurso[]> => {
    const response = await api.get<{ success: boolean; data: Recurso[] }>('/recursos');
    return response.data.data;
  },
  crearRecurso: async (recurso: Recurso): Promise<Recurso> => {
    const response = await api.post<{ success: boolean; data: Recurso }>('/recursos', recurso);
    return response.data.data;
  }
};