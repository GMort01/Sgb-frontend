import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { actividadService } from '../services/actividadService';
import { multaService } from '../services/multaService';
import { prestamoService } from '../services/prestamoService';
import { recursoService } from '../services/recursoService';
import { useAuth } from '../auth/useAuth';
import { ThemeToggle } from '../components/ThemeToggle';
import type { Actividad, Multa, Prestamo, Recurso, Reserva } from '../types';

const colecciones: Array<Recurso['coleccion']> = [
  'General',
  'Reserva',
  'Referencia',
  'Hemeroteca',
  'Mapoteca',
  'Tecnoteca',
];

type SeccionComunidad = 'inicio' | 'catalogo' | 'servicios' | 'multas' | 'actividades';

const secciones: Array<{ id: SeccionComunidad; etiqueta: string; icono: typeof LayoutDashboard }> = [
  { id: 'inicio', etiqueta: 'Inicio', icono: LayoutDashboard },
  { id: 'catalogo', etiqueta: 'Catálogo', icono: BookOpen },
  { id: 'servicios', etiqueta: 'Préstamos y reservas', icono: Check },
  { id: 'multas', etiqueta: 'Multas', icono: CircleDollarSign },
  { id: 'actividades', etiqueta: 'Actividades', icono: CalendarDays },
];

const estadoStyles: Record<NonNullable<Recurso['estado']>, string> = {
  Disponible: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Prestado: 'bg-amber-50 text-amber-700 ring-amber-200',
  Reservado: 'bg-sky-100 text-sky-700 ring-sky-200',
  Perdido: 'bg-rose-50 text-rose-700 ring-rose-200',
  'Baja administrativa': 'bg-slate-100 text-slate-700 ring-slate-500/20',
  Baja: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

function diasRenovacion(coleccion?: Recurso['coleccion']) {
  if (coleccion === 'General') return 15;
  if (coleccion === 'Referencia') return 3;
  if (coleccion === 'Hemeroteca') return 1;
  if (coleccion === 'Tecnoteca') return 7;
  return 0;
}

function estadoNoPrestable(estado?: Recurso['estado']) {
  return estado === 'Perdido' || estado === 'Baja' || estado === 'Baja administrativa';
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export const EstudiantePage = () => {
  const { usuario, cerrarSesion } = useAuth();
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [multas, setMultas] = useState<Multa[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [coleccion, setColeccion] = useState('Todas');
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [accion, setAccion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<SeccionComunidad>('inicio');
  const estudianteId = usuario?.id ?? null;

  useEffect(() => {
    let activo = true;
    recursoService.obtenerTodos()
      .then((listaRecursos) => {
        if (!activo) return;
        setRecursos(listaRecursos);
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar la información de la biblioteca. Intenta de nuevo más tarde.');
      })
      .finally(() => {
        if (activo) setCargandoCatalogo(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (estudianteId === null) return undefined;
    let activo = true;
    Promise.all([
      prestamoService.obtenerTodos(),
      prestamoService.obtenerReservas(),
      multaService.obtenerTodas(),
      actividadService.obtenerTodas(),
    ])
      .then(([todosPrestamos, todasReservas, todasMultas, listaActividades]) => {
        if (!activo) return;
        setPrestamos(todosPrestamos.filter((item) => item.estado === 'Activo' || item.estado === 'Vencido'));
        setReservas(todasReservas);
        setMultas(todasMultas);
        setActividades(listaActividades);
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar tus servicios. Actualiza la página para intentarlo otra vez.');
      })
      .finally(() => {
        if (activo) setCargandoServicios(false);
      });
    return () => {
      activo = false;
    };
  }, [estudianteId]);

  const resultados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase();
    return recursos.filter((recurso) => (
      `${recurso.titulo} ${recurso.autor ?? ''} ${recurso.coleccion}`.toLocaleLowerCase().includes(consulta)
      && (coleccion === 'Todas' || recurso.coleccion === coleccion)
    ));
  }, [busqueda, coleccion, recursos]);

  const recargarServicios = async () => {
    if (estudianteId === null) return;
    const [listaRecursos, todosPrestamos, todasReservas, todasMultas, listaActividades] = await Promise.all([
      recursoService.obtenerTodos(),
      prestamoService.obtenerTodos(),
      prestamoService.obtenerReservas(),
      multaService.obtenerTodas(),
      actividadService.obtenerTodas(),
    ]);
    setRecursos(listaRecursos);
    setPrestamos(todosPrestamos.filter((item) => item.estado === 'Activo' || item.estado === 'Vencido'));
    setReservas(todasReservas);
    setMultas(todasMultas);
    setActividades(listaActividades);
  };

  const solicitarRecurso = async (recurso: Recurso) => {
    if (estudianteId === null || recurso.id === undefined) return;
    setAccion(`recurso-${recurso.id}`);
    setError(null);
    setMensaje(null);
    try {
      if (recurso.coleccion === 'Mapoteca') {
        setMensaje('El material de Mapoteca se presta por USB en modalidad de lectura. Acércate al mostrador.');
        return;
      }
      if (recurso.coleccion !== 'General'
        && (recurso.ejemplares ?? 0) > 0) {
        setMensaje('El préstamo debe ser registrado por un bibliotecario. Acércate al mostrador.');
        return;
      }
      const resultado = await prestamoService.reservar(recurso.id);
      await recargarServicios();
      setMensaje(resultado.estado === 'Apartada'
        ? `“${recurso.titulo}” quedó apartado a tu nombre. Recógelo en la biblioteca antes del ${resultado.venceEn ? formatDateTime(resultado.venceEn) : 'vencimiento del plazo de 48 horas'}. El préstamo se registra cuando el bibliotecario te entregue el ejemplar.`
        : `“${recurso.titulo}” no tiene ejemplares disponibles. Quedaste en la posición ${resultado.posicion} de la lista de espera.`);
    } catch (requestError) {
      setError(isAxiosError(requestError) && typeof requestError.response?.data?.message === 'string'
        ? requestError.response.data.message
        : 'No se pudo procesar la solicitud. Puede que ya hayas pedido este recurso.');
    } finally {
      setAccion(null);
    }
  };

  const renovar = async (prestamo: Prestamo) => {
    setAccion(`prestamo-${prestamo.id}`);
    setError(null);
    setMensaje(null);
    try {
      await prestamoService.renovar(prestamo.id);
      await recargarServicios();
      const recurso = recursos.find((item) => item.id === prestamo.recursoId);
      const dias = diasRenovacion(recurso?.coleccion);
      setMensaje(dias ? `Préstamo renovado por ${dias} días.` : 'Préstamo renovado.');
    } catch {
      setError('No se pudo renovar. Puede que el préstamo ya no tenga renovaciones disponibles.');
    } finally {
      setAccion(null);
    }
  };

  const cancelarReserva = async (reserva: Reserva) => {
    if (estudianteId === null) return;
    setAccion(`reserva-${reserva.id}`);
    setError(null);
    setMensaje(null);
    try {
      await prestamoService.cancelarReserva(reserva.id, estudianteId);
      await recargarServicios();
      setMensaje('Reserva cancelada.');
    } catch {
      setError('No se pudo cancelar la reserva. Actualiza la página e inténtalo de nuevo.');
    } finally {
      setAccion(null);
    }
  };

  const inscribirActividad = async (actividad: Actividad) => {
    if (estudianteId === null) return;
    setAccion(`actividad-${actividad.id}`);
    setError(null);
    setMensaje(null);
    try {
      await actividadService.inscribir(actividad.id, estudianteId);
      await recargarServicios();
      setMensaje(`Te inscribiste en “${actividad.titulo}”.`);
    } catch {
      setError('No se pudo completar la inscripción. Revisa los cupos e inténtalo de nuevo.');
    } finally {
      setAccion(null);
    }
  };

  const simularPagoMulta = async (multa: Multa) => {
    const confirmado = window.confirm(
      'Este es un pago de demostración: no se realizará ningún cobro real. ¿Deseas marcar esta multa como pagada?',
    );
    if (!confirmado) return;
    setAccion(`multa-${multa.id}`);
    setError(null);
    setMensaje(null);
    try {
      const multaPagada = await multaService.marcarPagada(multa.id);
      setMultas((actuales) => actuales.map((item) => item.id === multa.id ? multaPagada : item));
      setMensaje('Pago de demostración registrado. No se realizó ningún cobro real.');
    } catch (requestError) {
      setError(isAxiosError(requestError) && typeof requestError.response?.data?.message === 'string'
        ? requestError.response.data.message
        : 'No se pudo registrar el pago de demostración. Actualiza la página e inténtalo de nuevo.');
    } finally {
      setAccion(null);
    }
  };

  const cambiarSeccion = (seccion: SeccionComunidad) => {
    setSeccionActiva(seccion);
    setError(null);
    setMensaje(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <aside className="flex flex-col border-b border-slate-200 bg-white md:min-h-screen md:w-72 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-5 py-5 md:px-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#173b35] text-[#e4c990]">
            <BookOpen size={23} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#173b35]">Unimadeira</p>
            <p className="mt-0.5 text-xs text-slate-500">Biblioteca universitaria</p>
          </div>
        </div>

        <div className="mx-5 mb-4 rounded-lg bg-[#f5f6f3] px-3 py-3 md:mx-4">
          <p className="text-xs font-medium text-slate-500">Cuenta institucional</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-800">{usuario?.nombres} {usuario?.apellidos}</p>
          <p className="mt-0.5 text-xs text-[#826a3f]">{usuario?.rol} · {usuario?.codigo}</p>
        </div>

        <nav aria-label="Navegación principal" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:px-3 md:py-2">
          {secciones.map(({ id, etiqueta, icono: Icono }) => (
            <button
              key={id}
              type="button"
              onClick={() => cambiarSeccion(id)}
              aria-current={seccionActiva === id ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                seccionActiva === id
                  ? 'bg-[#edf2ef] text-[#173b35]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#173b35]'
              }`}
            >
              <Icono size={18} aria-hidden="true" />
              {etiqueta}
              {id === 'servicios' && (prestamos.length + reservas.length) > 0 && (
                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-slate-600">{prestamos.length + reservas.length}</span>
              )}
              {id === 'actividades' && actividades.length > 0 && (
                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-slate-600">{actividades.length}</span>
              )}
              {id === 'multas' && multas.filter((multa) => multa.estado === 'Pendiente').length > 0 && (
                <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {multas.filter((multa) => multa.estado === 'Pendiente').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="hidden border-t border-slate-100 p-4 md:block">
          <Link to="/" className="mb-3 block px-3 text-xs font-medium text-slate-500 transition hover:text-[#173b35]">
            Ir al portal institucional
          </Link>
          <button type="button" onClick={cerrarSesion} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-[#173b35]">
            <LogOut size={17} aria-hidden="true" />Cerrar sesión
          </button>
          <p className="mt-4 px-3 text-[11px] leading-5 text-slate-400">Universidad de Madeira</p>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 md:hidden">
          <Link to="/" className="text-xs font-medium text-slate-500">Portal institucional</Link>
          <button type="button" onClick={cerrarSesion} className="flex items-center gap-1.5 text-xs font-semibold text-[#173b35]">
            <LogOut size={15} aria-hidden="true" />Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white/80">
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#826a3f]">Espacio académico</p>
              <h1 className="mt-1 text-lg font-semibold text-slate-800">
                {secciones.find((seccion) => seccion.id === seccionActiva)?.etiqueta}
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8 lg:p-10">
          {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
          {mensaje && (
            <div role="status" className="flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <span>{mensaje}</span>
              <button type="button" onClick={() => setMensaje(null)} aria-label="Cerrar notificación" className="text-emerald-700 hover:text-slate-800"><X size={17} /></button>
            </div>
          )}

          {seccionActiva === 'inicio' && (
            <section className="space-y-7">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-cyan-100/50 p-7 sm:p-9">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Biblioteca Unimadeira</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-slate-800 sm:text-4xl">
                  Hola{usuario ? `, ${usuario.nombres}` : ''}. ¿Qué necesitas hoy?
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-slate-500">
                  Encuentra recursos, revisa tus servicios activos y descubre actividades de la comunidad universitaria.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { etiqueta: 'Préstamos activos', valor: prestamos.length, destino: 'servicios' as const },
                  { etiqueta: 'Apartados y reservas', valor: reservas.length, destino: 'servicios' as const },
                  { etiqueta: 'Multas pendientes', valor: multas.filter((multa) => multa.estado === 'Pendiente').length, destino: 'multas' as const },
                  { etiqueta: 'Próximas actividades', valor: actividades.length, destino: 'actividades' as const },
                ].map((indicador) => (
                  <button
                    key={indicador.etiqueta}
                    type="button"
                    onClick={() => cambiarSeccion(indicador.destino)}
                    className="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-sky-300 hover:bg-slate-50"
                  >
                    <span className="text-sm text-slate-500">{indicador.etiqueta}</span>
                    <span className="mt-2 block text-3xl font-semibold text-slate-800">{cargandoServicios ? '—' : indicador.valor}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => cambiarSeccion('catalogo')}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-sky-300"
                >
                  <span>
                    <span className="block font-semibold text-slate-800">Explorar el catálogo</span>
                    <span className="mt-1 block text-sm text-slate-500">Busca por título, autor o colección.</span>
                  </span>
                  <ArrowRight size={19} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-700" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => cambiarSeccion('servicios')}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-sky-300"
                >
                  <span>
                    <span className="block font-semibold text-slate-800">Consultar mis servicios</span>
                    <span className="mt-1 block text-sm text-slate-500">Revisa préstamos activos y reservas.</span>
                  </span>
                  <ArrowRight size={19} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-700" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => cambiarSeccion('actividades')}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-sky-300"
                >
                  <span>
                    <span className="block font-semibold text-slate-800">Ver actividades académicas</span>
                    <span className="mt-1 block text-sm text-slate-500">Consulta fechas, lugares y cupos disponibles.</span>
                  </span>
                  <ArrowRight size={19} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-700" aria-hidden="true" />
                </button>
              </div>
            </section>
          )}

          {seccionActiva === 'catalogo' && (
            <section id="catalogo" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Colección bibliográfica</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800">Explora y solicita recursos</h2>
              <p className="mt-1 text-sm text-slate-500">Aparta ejemplares disponibles de Colección General para recogerlos en 48 horas; otros préstamos se registran en el mostrador.</p>
            </div>
            {!cargandoCatalogo && <span className="text-sm text-slate-500">{resultados.length} {resultados.length === 1 ? 'recurso' : 'recursos'}</span>}
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 sm:grid-cols-[minmax(0,1fr)_240px]">
            <label className="relative block">
              <span className="sr-only">Buscar título, autor o colección</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} aria-hidden="true" />
              <input
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Título, autor o colección..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600"
              />
            </label>
            <label className="sr-only" htmlFor="filtro-coleccion">Filtrar por colección</label>
            <select id="filtro-coleccion" value={coleccion} onChange={(event) => setColeccion(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none focus:border-sky-600">
              <option value="Todas">Todas las colecciones</option>
              {colecciones.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {cargandoCatalogo ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando catálogo">
              {[1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-slate-50" />)}
            </div>
          ) : resultados.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-14 text-center">
              <BookOpen className="mx-auto mb-3 text-slate-500" size={32} aria-hidden="true" />
              <h3 className="font-semibold text-slate-800">{recursos.length ? 'No encontramos resultados' : 'El catálogo aún no tiene recursos'}</h3>
              <p className="mt-2 text-sm text-slate-500">{recursos.length ? 'Prueba con otra búsqueda o colección.' : 'Los nuevos títulos aparecerán aquí cuando se incorporen.'}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resultados.map((recurso) => {
                const estado = recurso.estado === 'Disponible' && recurso.coleccion !== 'Mapoteca' && (recurso.ejemplares ?? 0) < 1
                  ? 'Prestado'
                  : recurso.estado ?? 'Disponible';
                const yaSolicitado = prestamos.some((item) => item.recursoId === recurso.id)
                  || reservas.some((item) => item.recursoId === recurso.id);
                const tieneStock = (recurso.ejemplares ?? 0) > 0;
                const admiteListaEspera = recurso.coleccion === 'General'
                  || (recurso.coleccion === 'Tecnoteca' && recurso.tipoEquipo === 'Tableta');
                return (
                  <article key={recurso.id ?? recurso.titulo} className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-slate-50/90 p-5 transition hover:border-sky-300 hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
                        <BookOpen size={13} aria-hidden="true" />
                        {recurso.coleccion}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${estadoStyles[estado]}`}>
                        {estado === 'Baja' ? 'Baja administrativa' : estado}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold leading-snug text-slate-800">{recurso.titulo}</h3>
                    <p className="mt-1 text-sm text-slate-500">{recurso.autor || 'Autor no especificado'}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                      <span className="text-xs text-slate-500">
                        {recurso.coleccion === 'Mapoteca'
                          ? 'Préstamo por USB'
                          : `${recurso.ejemplares ?? 0} disponibles / ${recurso.ejemplaresTotales ?? recurso.ejemplares ?? 0} registrados`}
                      </span>
                      <button
                        type="button"
                        onClick={() => void solicitarRecurso(recurso)}
                        disabled={estudianteId === null || accion !== null || yaSolicitado
                          || estadoNoPrestable(estado)
                          || (recurso.coleccion !== 'Mapoteca' && !tieneStock && !admiteListaEspera)}
                        className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        {accion === `recurso-${recurso.id}` ? 'Procesando...' : yaSolicitado ? 'Ya solicitado'
                          : recurso.coleccion === 'Mapoteca' ? 'Consultar en mostrador'
                            : recurso.coleccion === 'General' && tieneStock ? 'Apartar para recoger'
                              : recurso.coleccion === 'General' || admiteListaEspera ? 'Lista de espera'
                                : tieneStock ? 'Solicitar en mostrador' : 'No disponible'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
            </section>
          )}

          {seccionActiva === 'servicios' && (
            <section className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Tu actividad</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-800">Mis préstamos y reservas</h2>
            <p className="mt-1 text-sm text-slate-500">Sesión de {usuario?.nombres} {usuario?.apellidos} · {usuario?.codigo}.</p>
          </div>
          {cargandoServicios ? (
            <div className="grid gap-4 md:grid-cols-2" aria-label="Cargando tu actividad">
              {[1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-slate-50" />)}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-slate-100/80 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Préstamos activos</h3>
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs text-sky-700">{prestamos.length}</span>
                </div>
                {prestamos.length === 0 ? (
                  <p className="mt-5 text-sm text-slate-500">Aún no tienes préstamos activos. Aparta un libro de Colección General o solicita otros materiales en el mostrador.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {prestamos.map((prestamo) => (
                      <div key={prestamo.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/80 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700">{prestamo.codigoRecurso}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Devolver: {formatDate(prestamo.fechaDevolucion)}
                            {prestamo.estado === 'Vencido' && <span className="ml-2 font-semibold text-rose-700">Vencido</span>}
                          </p>
                        </div>
                        <button type="button" onClick={() => void renovar(prestamo)} disabled={accion !== null || prestamo.estado === 'Vencido' || prestamo.renovacionesRestantes < 1} className="shrink-0 rounded-lg border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:opacity-40">
                          {accion === `prestamo-${prestamo.id}` ? '...' : 'Renovar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="rounded-2xl border border-slate-200 bg-slate-100/80 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Mis reservas</h3>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700">{reservas.length}</span>
                </div>
                {reservas.length === 0 ? (
                  <p className="mt-5 text-sm text-slate-500">Tus apartados para recoger y las posiciones en lista de espera aparecerán aquí.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {reservas.map((reserva) => (
                      <div key={reserva.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/80 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700">{reserva.codigoRecurso}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {reserva.estado === 'Apartada'
                              ? `Apartado · recoger antes del ${reserva.venceEn ? formatDateTime(reserva.venceEn) : 'plazo de 48 horas'}`
                              : `Lista de espera · posición ${reserva.posicion} · ${formatDate(reserva.fechaReserva)}`}
                          </p>
                        </div>
                        <button type="button" onClick={() => void cancelarReserva(reserva)} disabled={accion !== null} className="shrink-0 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-40">
                          {accion === `reserva-${reserva.id}` ? '...' : 'Cancelar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>
          )}
            </section>
          )}

          {seccionActiva === 'multas' && (
            <section className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Estado de cuenta</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-800">Mis multas</h2>
                <p className="mt-1 text-sm text-slate-500">Consulta los cargos asociados a tu cuenta institucional.</p>
              </div>
              {cargandoServicios ? (
                <div className="h-40 animate-pulse rounded-xl bg-slate-100" aria-label="Cargando multas" />
              ) : multas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
                  <CircleDollarSign className="mx-auto mb-3 text-slate-400" size={30} aria-hidden="true" />
                  <h3 className="font-semibold text-slate-800">No tienes multas registradas</h3>
                  <p className="mt-2 text-sm text-slate-500">Si se registra un cargo en tu cuenta, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
                    <div>
                      <h3 className="font-semibold text-slate-800">Resumen de cuenta</h3>
                      <p className="mt-1 text-sm text-slate-500">{multas.length} {multas.length === 1 ? 'cargo registrado' : 'cargos registrados'}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                      Pendiente: {formatCurrency(multas.filter((multa) => multa.estado === 'Pendiente').reduce((total, multa) => total + multa.monto, 0))}
                    </span>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-2">
                    {multas.map((multa) => (
                      <article key={multa.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className={`h-1 ${multa.estado === 'Pendiente' ? 'bg-amber-400' : 'bg-emerald-500'}`} aria-hidden="true" />
                        <div className="space-y-4 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Multa bibliotecaria</p>
                              <p className="mt-2 text-sm font-medium leading-6 text-slate-800">{multa.concepto}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              multa.estado === 'Pendiente'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {multa.estado}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
                            <div>
                              <p className="text-xs text-slate-500">Fecha de registro · {formatDate(multa.fecha)}</p>
                              <p className="mt-1 text-xl font-bold text-slate-800">{formatCurrency(multa.monto)}</p>
                            </div>
                            {multa.estado === 'Pendiente' && (
                              <button
                                type="button"
                                onClick={() => void simularPagoMulta(multa)}
                                disabled={accion !== null}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#173b35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b35] disabled:cursor-wait disabled:opacity-50"
                              >
                                <CircleDollarSign size={16} aria-hidden="true" />
                                {accion === `multa-${multa.id}` ? 'Procesando...' : 'Pagar'}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  {multas.some((multa) => multa.estado === 'Pendiente') && (
                    <p className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-800">
                      El botón «Pagar» es una simulación para esta versión; no se realizará ningún cobro real.
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {seccionActiva === 'actividades' && (
            <section className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Vida universitaria</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-800">Horarios y actividades</h2>
            <p className="mt-1 text-sm text-slate-500">Estudiantes y profesores pueden consultar e inscribirse a las actividades.</p>
          </div>
          {cargandoServicios ? (
            <div className="grid gap-4 md:grid-cols-3" aria-label="Cargando actividades">
              {[1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-slate-50" />)}
            </div>
          ) : actividades.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">No hay actividades programadas por el momento.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {actividades.map((actividad) => {
                const cuposDisponibles = actividad.cupos - actividad.inscritos;
                return (
                  <article key={actividad.id} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-lg bg-amber-50 p-2.5 text-amber-700"><CalendarDays size={18} aria-hidden="true" /></span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${actividad.inscrito ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-500'}`}>
                        {actividad.inscrito ? 'Inscrito' : `${cuposDisponibles} cupos`}
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-800">{actividad.titulo}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{actividad.descripcion}</p>
                    <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
                      <p className="flex items-center gap-2"><CalendarDays size={14} aria-hidden="true" />{formatDate(actividad.fecha)} · {actividad.hora}</p>
                      <p className="flex items-center gap-2"><MapPin size={14} aria-hidden="true" />{actividad.lugar}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void inscribirActividad(actividad)}
                      disabled={Boolean(actividad.inscrito) || cuposDisponibles <= 0 || accion !== null || estudianteId === null}
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-500"
                    >
                      {actividad.inscrito ? <><Check size={15} />Inscripción confirmada</> : accion === `actividad-${actividad.id}` ? 'Inscribiendo...' : 'Inscribirme'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
            </section>
          )}

          <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
            Tus datos y acciones están asociados a tu cuenta.
          </footer>
        </div>
      </div>
    </main>
  );
};
