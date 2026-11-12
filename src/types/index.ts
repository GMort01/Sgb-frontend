export interface Recurso {
  id?: number;
  titulo: string;
  autor?: string;
  coleccion: 'General' | 'Reserva' | 'Referencia' | 'Hemeroteca' | 'Mapoteca' | 'Tecnoteca';
  ejemplares?: number;
  ejemplaresTotales?: number;
  estado?: 'Disponible' | 'Prestado' | 'Reservado' | 'Perdido' | 'Baja';
  isbn?: string;
  resumen?: string;
  fechaPublicacion?: string;
  dimensiones?: string;
  encuadernacion?: string;
  issn?: string;
  periodicidad?: string;
  formato?: 'jpg' | 'pdf' | 'shape' | 'dwg';
  tipoEquipo?: 'Laptop' | 'Tableta';
  numeroEquipo?: string;
  marca?: string;
  modelo?: string;
  cargador?: boolean;
  funda?: boolean;
}

export interface Usuario {
  id?: number;
  identificacion: string;
  codigo: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: 'Estudiante' | 'Profesor' | 'Bibliotecario';
  plan?: string;
  semestre?: number;
  password?: string;
}

export interface Prestamo {
  id: number;
  usuario: string;
  codigoRecurso: string;
  fechaSalida: string;
  fechaDevolucion: string;
  renovacionesRestantes: number;
  medioEntrega?: string;
  bibliotecarioId?: number;
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
  estado: 'Espera' | 'Apartada';
  venceEn: string | null;
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