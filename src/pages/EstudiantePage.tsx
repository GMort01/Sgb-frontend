import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, MapPin, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { actividadService } from '../services/actividadService';
import { prestamoService } from '../services/prestamoService';
import { recursoService } from '../services/recursoService';
import { useAuth } from '../auth/useAuth';
import { ThemeToggle } from '../components/ThemeToggle';
import type { Actividad, Prestamo, Recurso, Reserva } from '../types';

const colecciones: Array<Recurso['coleccion']> = [
  'General',
  'Reserva',
  'Referencia',
  'Hemeroteca',
  'Mapoteca',
  'Tecnoteca',
];

const estadoStyles: Record<NonNullable<Recurso['estado']>, string> = {
  Disponible: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Prestado: 'bg-amber-50 text-amber-700 ring-amber-200',
  Reservado: 'bg-sky-100 text-sky-700 ring-sky-200',
  Perdido: 'bg-rose-50 text-rose-700 ring-rose-200',
  Baja: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export const EstudiantePage = () => {
  const { usuario, cerrarSesion } = useAuth();
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [coleccion, setColeccion] = useState('Todas');
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [accion, setAccion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
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
    actividadService.obtenerTodas(),
    ])
      .then(([todosPrestamos, todasReservas, listaActividades]) => {
        if (!activo) return;
      setPrestamos(todosPrestamos.filter((item) => item.estado === 'Activo'));
      setReservas(todasReservas);
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
    const [listaRecursos, todosPrestamos, todasReservas, listaActividades] = await Promise.all([
      recursoService.obtenerTodos(),
      prestamoService.obtenerTodos(),
      prestamoService.obtenerReservas(),
      actividadService.obtenerTodas(),
    ]);
    setRecursos(listaRecursos);
    setPrestamos(todosPrestamos.filter((item) => item.estado === 'Activo'));
    setReservas(todasReservas);
    setActividades(listaActividades);
  };

  const solicitarRecurso = async (recurso: Recurso) => {
    if (estudianteId === null || recurso.id === undefined) return;
    setAccion(`recurso-${recurso.id}`);
    setError(null);
    setMensaje(null);
    try {
      if ((recurso.ejemplares ?? 0) > 0) {
        setMensaje('El préstamo debe ser registrado por un bibliotecario. Acércate al mostrador.');
        return;
      }
      if (recurso.coleccion === 'Mapoteca') {
        setMensaje('El material de Mapoteca se presta por USB en modalidad de lectura. Acércate al mostrador.');
        return;
      }
      const resultado = await prestamoService.reservar(recurso.id);
      await recargarServicios();
      setMensaje(`No quedan ejemplares de “${recurso.titulo}”. Quedaste en la posición ${resultado.posicion} de la lista de espera.`);
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
      setMensaje('Préstamo renovado por 14 días.');
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-slate-50/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3 text-sm font-semibold text-slate-800 transition hover:text-sky-700">
            <ArrowLeft size={17} aria-hidden="true" />
            SGB Unimadeira
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600">{usuario?.nombres} {usuario?.apellidos} · {usuario?.rol}</span>
            <ThemeToggle />
            <button type="button" onClick={cerrarSesion} className="font-semibold text-sky-700">Cerrar sesión</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-12 px-5 py-10 sm:px-8 sm:py-14">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-cyan-100/50 p-7 sm:p-10 lg:p-12">
          <div className="absolute -right-12 -top-16 h-72 w-72 rounded-full bg-sky-100 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Portal de la comunidad</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-800 sm:text-5xl">
              Hola{usuario ? `, ${usuario.nombres}` : ''}. Encuentra tu próxima lectura.
            </h1>
            <p className="mt-4 max-w-xl leading-relaxed text-slate-500">
              Busca recursos, consulta tus préstamos y reserva títulos sin ejemplares.
            </p>
            <a href="#catalogo" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-sky-600">
              Buscar en el catálogo <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
        {mensaje && (
          <div role="status" className="flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span>{mensaje}</span>
            <button type="button" onClick={() => setMensaje(null)} aria-label="Cerrar notificación" className="text-emerald-700 hover:text-slate-800"><X size={17} /></button>
          </div>
        )}

        <section id="catalogo" className="scroll-mt-8 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Colección bibliográfica</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800">Explora y solicita recursos</h2>
              <p className="mt-1 text-sm text-slate-500">Los préstamos duran 14 días. Si no hay ejemplares, entrarás a la cola de reservas.</p>
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
                return (
                  <article key={recurso.id ?? recurso.titulo} className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-slate-50/90 p-5 transition hover:border-sky-300 hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
                        <BookOpen size={13} aria-hidden="true" />
                        {recurso.coleccion}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${estadoStyles[estado]}`}>{estado}</span>
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
                        disabled={estudianteId === null || accion !== null || yaSolicitado || ['Perdido', 'Baja'].includes(estado)}
                        className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        {accion === `recurso-${recurso.id}` ? 'Procesando...' : yaSolicitado ? 'Ya solicitado' : recurso.coleccion === 'Mapoteca' ? 'Consultar en mostrador' : tieneStock ? 'Préstamo en mostrador' : 'Reservar'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

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
                  <p className="mt-5 text-sm text-slate-500">Aún no tienes préstamos activos. Solicita un ejemplar en el catálogo.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {prestamos.map((prestamo) => (
                      <div key={prestamo.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/80 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700">{prestamo.codigoRecurso}</p>
                          <p className="mt-1 text-xs text-slate-500">Devolver: {formatDate(prestamo.fechaDevolucion)}</p>
                        </div>
                        <button type="button" onClick={() => void renovar(prestamo)} disabled={accion !== null || prestamo.renovacionesRestantes < 1} className="shrink-0 rounded-lg border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:opacity-40">
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
                  <p className="mt-5 text-sm text-slate-500">Cuando solicites un título sin ejemplares, aparecerá aquí tu lugar en la cola.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {reservas.map((reserva) => (
                      <div key={reserva.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/80 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700">{reserva.codigoRecurso}</p>
                          <p className="mt-1 text-xs text-slate-500">Posición {reserva.posicion} · {formatDate(reserva.fechaReserva)}</p>
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

        <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          <Link to="/" className="transition hover:text-slate-700">Volver al portal</Link>
          <span className="mx-2">·</span>
          Tus datos y acciones están asociados a tu cuenta.
        </footer>
      </div>
    </main>
  );
};
