import { api } from './api';
import type { Prestamo, Reserva, SolicitudCirculacion } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const prestamoService = {
  obtenerActivos: async (): Promise<Prestamo[]> => {
    const response = await api.get<ApiResponse<Prestamo[]>>('/prestamos');
    return response.data.data;
  },
  obtenerTodos: async (): Promise<Prestamo[]> => {
    const response = await api.get<ApiResponse<Prestamo[]>>('/prestamos/todos');
    return response.data.data;
  },
  obtenerReservas: async (): Promise<Reserva[]> => {
    const response = await api.get<ApiResponse<Reserva[]>>('/reservas');
    return response.data.data;
  },
  cancelarReserva: async (id: number, usuarioId: number): Promise<void> => {
    await api.delete(`/reservas/${id}`, { data: { usuarioId } });
  },
  renovar: async (id: number): Promise<Prestamo> => {
    const response = await api.patch<ApiResponse<Prestamo>>(`/prestamos/${id}/renovar`);
    return response.data.data;
  },
  solicitar: async (usuarioId: number, recursoId: number): Promise<SolicitudCirculacion> => {
    const response = await api.post<ApiResponse<SolicitudCirculacion>>('/prestamos', { usuarioId, recursoId });
    return response.data.data;
  },
  reservar: async (recursoId: number): Promise<Reserva> => {
    const response = await api.post<ApiResponse<{ tipo: 'reserva'; data: Reserva }>>('/reservas', { recursoId });
    return response.data.data.data;
  },
  devolver: async (id: number): Promise<{
    prestamo: Prestamo;
    promovido: Prestamo | null;
    reservaPromovida: Reserva | null;
  }> => {
    const response = await api.patch<ApiResponse<{
      prestamo: Prestamo;
      promovido: Prestamo | null;
      reservaPromovida: Reserva | null;
    }>>(`/prestamos/${id}/devolver`);
    return response.data.data;
  },
};
