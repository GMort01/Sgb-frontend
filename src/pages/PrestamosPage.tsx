import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRightLeft, BookCopy, CalendarDays, Check, Clock3, RotateCw } from 'lucide-react';
import { prestamoService } from '../services/prestamoService';
import { recursoService } from '../services/recursoService';
import { usuarioService } from '../services/usuarioService';
import type { Prestamo, Recurso, Reserva, Usuario } from '../types';

type Pestana = 'activos' | 'reservas';

function formatearFecha(fecha: string) {
  const fechaLocal = new Date(`${fecha.slice(0, 10)}T00:00:00`);
  const formatted = Number.isNaN(fechaLocal.getTime())
    ? fecha.slice(0, 10)
    : new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' }).format(fechaLocal);
  return fecha.includes('21:00') ? `${formatted} · 21:00` : formatted;
}

function formatearFechaHora(fecha: string) {
  const parsed = new Date(fecha);
  return Number.isNaN(parsed.getTime())
    ? fecha
    : new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(parsed);
}

export const PrestamosPage = () => {
  const [pestana, setPestana] = useState<Pestana>('activos');
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [recursoId, setRecursoId] = useState('');
  const [registrando, setRegistrando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [accionId, setAccionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    Promise.all([
      prestamoService.obtenerActivos(),
      prestamoService.obtenerReservas(),
      recursoService.obtenerTodos(),
      usuarioService.obtenerTodos(),
    ])
      .then(([prestamosActivos, colaReservas, listaRecursos, listaUsuarios]) => {
        if (!activo) return;
        setPrestamos(prestamosActivos);
        setReservas(colaReservas);
        setRecursos(listaRecursos);
        setUsuarios(listaUsuarios.filter((item) => item.rol === 'Estudiante' || item.rol === 'Profesor'));
        setUsuarioId(String(listaUsuarios.find((item) => item.rol === 'Estudiante' || item.rol === 'Profesor')?.id ?? ''));
        setRecursoId(String(listaRecursos[0]?.id ?? ''));
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar los préstamos y las reservas. Inténtalo de nuevo.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const registrarPrestamo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegistrando(true);
    setError(null);
    setMensaje(null);
    try {
      const resultado = await prestamoService.solicitar(Number(usuarioId), Number(recursoId));
      const [activos, cola] = await Promise.all([
        prestamoService.obtenerActivos(),
        prestamoService.obtenerReservas(),
      ]);
      setPrestamos(activos);
      setReservas(cola);
      setRecursos(await recursoService.obtenerTodos());
      setMensaje(resultado.tipo === 'prestamo'
        ? `Préstamo registrado. Devolución prevista: ${formatearFecha(resultado.data.fechaDevolucion)}.`
        : `Sin ejemplares disponibles. Se creó una reserva en la posición ${resultado.data.posicion}.`);
    } catch {
      setError('No se pudo registrar la operación. Verifica la disponibilidad, las multas pendientes y los datos.');
    } finally {
      setRegistrando(false);
    }
  };

  const renovar = async (prestamo: Prestamo) => {
    setAccionId(prestamo.id);
    setError(null);
    setMensaje(null);
    try {
      const actualizado = await prestamoService.renovar(prestamo.id);
      setPrestamos((actuales) => actuales.map((item) => item.id === actualizado.id ? actualizado : item));
    } catch {
      setError('No se pudo renovar el préstamo. Puede que ya no tenga renovaciones disponibles.');
    } finally {
      setAccionId(null);
    }
  };

  const devolver = async (prestamo: Prestamo) => {
    setAccionId(prestamo.id);
    setError(null);
    setMensaje(null);
    try {
      const resultado = await prestamoService.devolver(prestamo.id);
      const [activos, cola] = await Promise.all([
        prestamoService.obtenerActivos(),
        prestamoService.obtenerReservas(),
      ]);
      setPrestamos(activos);
      setReservas(cola);
      if (resultado.reservaPromovida) {
        setMensaje(`${resultado.reservaPromovida.usuario} tiene ahora un apartado de Colección General para recoger el ejemplar en 48 horas.`);
      } else if (resultado.promovido) {
        setMensaje(`${resultado.promovido.usuario} recibió el ejemplar desde la cola de reservas.`);
      } else {
        setMensaje('Devolución registrada. El ejemplar está disponible.');
      }
    } catch {
      setError('No se pudo registrar la devolución. Actualiza la página e inténtalo de nuevo.');
    } finally {
      setAccionId(null);
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Circulación</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">Préstamos y reservas</h1>
        <p className="mt-2 text-slate-500">Administra los préstamos activos, apartados y listas de espera.</p>
      </header>

      <form onSubmit={registrarPrestamo} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Estudiante o profesor</span>
          <select required value={usuarioId} onChange={(event) => setUsuarioId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            {usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.nombres} {usuario.apellidos} · {usuario.codigo}</option>)}
          </select>
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Recurso</span>
          <select required value={recursoId} onChange={(event) => setRecursoId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            {recursos.filter((recurso) => !['Perdido', 'Baja'].includes(recurso.estado ?? '')).map((recurso) => (
              <option key={recurso.id} value={recurso.id}>{recurso.titulo} · {recurso.coleccion} ({recurso.ejemplares ?? 0} disponibles)</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={registrando || !usuarioId || !recursoId} className="rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white disabled:opacity-50">
          {registrando ? 'Registrando...' : 'Registrar préstamo'}
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <span className="rounded-xl bg-sky-100 p-3 text-sky-700 ring-1 ring-inset ring-sky-200">
            <BookCopy size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-slate-500">Préstamos activos</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{cargando ? '—' : prestamos.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <span className="rounded-xl bg-amber-50 p-3 text-amber-700 ring-1 ring-inset ring-amber-200">
            <Clock3 size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-slate-500">Personas en espera</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{cargando ? '—' : reservas.filter((item) => item.estado === 'Espera').length}</p>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        {mensaje && (
          <div role="status" className="mx-4 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 sm:mx-6">
            {mensaje}
          </div>
        )}
        <div className="border-b border-slate-200 px-4 pt-4 sm:px-6">
          <div className="flex gap-2" role="tablist" aria-label="Secciones de circulación">
            <button
              type="button"
              role="tab"
              id="tab-activos"
              aria-selected={pestana === 'activos'}
              aria-controls="panel-circulacion"
              onClick={() => setPestana('activos')}
              className={`rounded-t-xl border-b-2 px-4 py-3 text-sm font-semibold transition ${
                pestana === 'activos'
                  ? 'border-sky-300 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Préstamos activos
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{prestamos.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              id="tab-reservas"
              aria-selected={pestana === 'reservas'}
              aria-controls="panel-circulacion"
              onClick={() => setPestana('reservas')}
              className={`rounded-t-xl border-b-2 px-4 py-3 text-sm font-semibold transition ${
                pestana === 'reservas'
                  ? 'border-sky-300 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Lista de espera / Apartados
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{reservas.length}</span>
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:mx-6">
            {error}
          </div>
        )}

        <div
          id="panel-circulacion"
          role="tabpanel"
          aria-labelledby={pestana === 'activos' ? 'tab-activos' : 'tab-reservas'}
          className="p-4 sm:p-6"
        >
          {cargando ? (
            <div className="space-y-3" aria-label="Cargando información">
              {[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : pestana === 'activos' ? (
            prestamos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-5 py-14 text-center">
                <BookCopy className="mx-auto mb-3 text-slate-500" size={32} aria-hidden="true" />
                <h2 className="font-semibold text-slate-800">No hay préstamos activos</h2>
                <p className="mt-2 text-sm text-slate-500">Los nuevos préstamos aparecerán aquí cuando se registren.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th scope="col" className="px-4 py-3 font-semibold">Usuario</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Código recurso</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Medio</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Fecha salida</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Fecha devolución</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Renovaciones</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/70">
                    {prestamos.map((prestamo) => (
                      <tr key={prestamo.id} className="transition hover:bg-slate-100">
                        <td className="px-4 py-4 font-medium text-slate-700">{prestamo.usuario}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-sky-800">{prestamo.codigoRecurso}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-500">{prestamo.medioEntrega ?? 'Regular'}</td>
                        <td className="px-4 py-4 text-slate-500">{formatearFecha(prestamo.fechaSalida)}</td>
                        <td className="px-4 py-4 text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={15} aria-hidden="true" />
                            {formatearFecha(prestamo.fechaDevolucion)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{prestamo.renovacionesRestantes} restantes</td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void renovar(prestamo)}
                              disabled={accionId !== null || prestamo.renovacionesRestantes < 1}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <RotateCw size={14} aria-hidden="true" />
                              Renovar
                            </button>
                            <button
                              type="button"
                              onClick={() => void devolver(prestamo)}
                              disabled={accionId !== null}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Check size={14} aria-hidden="true" />
                              Devolver
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : reservas.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-5 py-14 text-center">
              <ArrowRightLeft className="mx-auto mb-3 text-slate-500" size={32} aria-hidden="true" />
              <h2 className="font-semibold text-slate-800">La cola de espera está vacía</h2>
              <p className="mt-2 text-sm text-slate-500">Los apartados para recoger y las listas de espera aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th scope="col" className="px-4 py-3 font-semibold">Estado / posición</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Usuario</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Código recurso</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Fecha de reserva</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Recoger antes de</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/70">
                  {reservas.map((reserva) => (
                    <tr key={reserva.id} className="transition hover:bg-slate-100">
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          reserva.estado === 'Apartada'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {reserva.estado === 'Apartada' ? 'Apartado' : `Espera · ${reserva.posicion}`}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">{reserva.usuario}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-sky-800">{reserva.codigoRecurso}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{formatearFecha(reserva.fechaReserva)}</td>
                      <td className="px-4 py-4 text-slate-500">
                        {reserva.estado === 'Apartada' && reserva.venceEn ? formatearFechaHora(reserva.venceEn) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};
