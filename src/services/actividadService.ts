import { api } from './api';
import type { Actividad } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const actividadService = {
  obtenerTodas: async (usuarioId?: number): Promise<Actividad[]> => {
    const response = await api.get<ApiResponse<Actividad[]>>('/actividades', {
      params: usuarioId ? { usuarioId } : undefined,
    });
    return response.data.data;
  },
  crear: async (actividad: Omit<Actividad, 'id' | 'inscritos' | 'inscrito'>): Promise<Actividad> => {
    const response = await api.post<ApiResponse<Actividad>>('/actividades', actividad);
    return response.data.data;
  },
  inscribir: async (actividadId: number, usuarioId: number): Promise<void> => {
    await api.post(`/actividades/${actividadId}/inscripciones`, { usuarioId });
  },
};
