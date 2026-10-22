export interface Recurso {
  id?: number;
  titulo: string;
  autor?: string;
  coleccion: 'General' | 'Reserva' | 'Referencia' | 'Hemeroteca' | 'Mapoteca' | 'Tecnoteca';
  ejemplares?: number;
  estado?: 'Disponible' | 'Prestado' | 'Reservado' | 'Perdido' | 'Baja';
}

export interface Usuario {
  id?: number;
  identificacion: string;
  codigo: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: 'Estudiante' | 'Profesor' | 'Bibliotecario';
}

export interface Prestamo {
  id: number;
  usuario: string;
  codigoRecurso: string;
  fechaSalida: string;
  fechaDevolucion: string;
  renovacionesRestantes: number;
  estado: 'Activo' | 'Devuelto';
  usuarioId?: number;
  recursoId?: number;
}

export interface Reserva {
  id: number;
  usuario: string;
  codigoRecurso: string;
  fechaReserva: string;
  posicion: number;
  usuarioId?: number;
  recursoId?: number;
}

export interface Multa {
  id: number;
  usuario: string;
  concepto: string;
  monto: number;
  fecha: string;
  estado: 'Pendiente' | 'Pagada';
}

export interface EstudianteDemo {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  rol: 'Estudiante';
}

export interface Actividad {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  cupos: number;
  inscritos: number;
  inscrito: number;
}

export type SolicitudCirculacion =
  | { tipo: 'prestamo'; data: Prestamo }
  | { tipo: 'reserva'; data: Reserva };