import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Check, CircleDollarSign, Search, ShieldAlert } from 'lucide-react';
import { multaService } from '../services/multaService';
import type { Multa } from '../types';

const fechaHoy = () => new Date().toISOString().slice(0, 10);

function formatoMoneda(valor: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
}

function formatoFecha(valor: string) {
  const fecha = new Date(`${valor.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return valor;
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' }).format(fecha);
}

export const MultasPage = () => {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [usuario, setUsuario] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(fechaHoy);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [accionId, setAccionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const cargarMultas = () => {
    setCargando(true);
    setError(null);
    multaService.obtenerTodas()
      .then(setMultas)
      .catch(() => setError('No se pudieron cargar las multas. Comprueba la conexión con el servidor.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    let activo = true;
    multaService.obtenerTodas()
      .then((data) => {
        if (activo) setMultas(data);
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar las multas. Comprueba la conexión con el servidor.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const multasFiltradas = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase();
    return multas.filter((multa) => (
      `${multa.usuario} ${multa.concepto} ${multa.estado}`.toLocaleLowerCase().includes(consulta)
    ));
  }, [busqueda, multas]);

  const pendientes = multas.filter((multa) => multa.estado === 'Pendiente');
  const saldoPendiente = pendientes.reduce((total, multa) => total + multa.monto, 0);

  const registrarMulta = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardando(true);
    setErrorFormulario(null);
    try {
      const nueva = await multaService.crear({
        usuario: usuario.trim(),
        concepto: concepto.trim(),
        monto: Number(monto),
        fecha,
      });
      setMultas((actuales) => [nueva, ...actuales]);
      setUsuario('');
      setConcepto('');
      setMonto('');
      setFecha(fechaHoy());
    } catch {
      setErrorFormulario('No se pudo registrar la multa. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const marcarPagada = async (multa: Multa) => {
    setAccionId(multa.id);
    setError(null);
    try {
      const actualizada = await multaService.marcarPagada(multa.id);
      setMultas((actuales) => actuales.map((item) => item.id === multa.id ? actualizada : item));
    } catch {
      setError('No se pudo actualizar el estado de la multa. Actualiza la página e inténtalo de nuevo.');
    } finally {
      setAccionId(null);
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Cuenta bibliotecaria</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">Multas</h1>
        <p className="mt-2 text-slate-500">Registra cargos y lleva el seguimiento de pagos pendientes.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <span className="rounded-xl bg-amber-50 p-3 text-amber-700 ring-1 ring-inset ring-amber-200">
            <ShieldAlert size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-slate-500">Multas pendientes</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{cargando ? '—' : pendientes.length}</p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <span className="rounded-xl bg-rose-50 p-3 text-rose-700 ring-1 ring-inset ring-rose-200">
            <CircleDollarSign size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-slate-500">Saldo pendiente</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{cargando ? '—' : formatoMoneda(saldoPendiente)}</p>
          </div>
        </article>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Registro de multas</h2>
            <label className="relative block sm:w-72">
              <span className="sr-only">Buscar multas</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} aria-hidden="true" />
              <input
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar usuario o concepto..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
              />
            </label>
          </div>

          {error && (
            <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <span>{error}</span>
              <button type="button" onClick={cargarMultas} className="shrink-0 font-semibold underline underline-offset-2">Reintentar</button>
            </div>
          )}

          {cargando ? (
            <div className="space-y-3" aria-label="Cargando multas">
              {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-white" />)}
            </div>
          ) : multasFiltradas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <ShieldAlert className="mx-auto mb-4 text-slate-500" size={34} aria-hidden="true" />
              <h3 className="font-semibold text-slate-800">{multas.length ? 'No hay coincidencias' : 'No hay multas registradas'}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {multas.length ? 'Prueba con otro término de búsqueda.' : 'Las multas que registres aparecerán en esta lista.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-white text-xs uppercase tracking-wider text-slate-500">
                      <th scope="col" className="px-4 py-4 font-semibold">Usuario y concepto</th>
                      <th scope="col" className="px-4 py-4 font-semibold">Fecha</th>
                      <th scope="col" className="px-4 py-4 font-semibold">Monto</th>
                      <th scope="col" className="px-4 py-4 font-semibold">Estado</th>
                      <th scope="col" className="px-4 py-4 text-right font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/70">
                    {multasFiltradas.map((multa) => (
                      <tr key={multa.id} className="transition hover:bg-slate-100">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-700">{multa.usuario}</p>
                          <p className="mt-1 text-xs text-slate-500">{multa.concepto}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-500">{formatoFecha(multa.fecha)}</td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{formatoMoneda(multa.monto)}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            multa.estado === 'Pagada'
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : 'bg-amber-50 text-amber-700 ring-amber-200'
                          }`}>
                            {multa.estado}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {multa.estado === 'Pendiente' ? (
                            <button
                              type="button"
                              onClick={() => void marcarPagada(multa)}
                              disabled={accionId !== null}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-50"
                            >
                              <Check size={14} aria-hidden="true" />
                              {accionId === multa.id ? 'Actualizando...' : 'Marcar pagada'}
                            </button>
                          ) : <span className="text-xs text-slate-500">Sin acciones</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold text-sky-700">Nuevo cargo</p>
            <h2 className="mt-1 text-xl font-bold text-slate-800">Registrar multa</h2>
            <p className="mt-2 text-sm text-slate-500">Completa los datos para agregar una multa pendiente.</p>
          </div>
          <form onSubmit={registrarMulta} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Usuario</span>
              <input
                required
                maxLength={160}
                value={usuario}
                onChange={(event) => setUsuario(event.target.value)}
                placeholder="Nombre del usuario"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Concepto</span>
              <textarea
                required
                maxLength={240}
                rows={3}
                value={concepto}
                onChange={(event) => setConcepto(event.target.value)}
                placeholder="Describe el motivo del cargo"
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Monto (COP)</span>
                <input
                  required
                  type="number"
                  min="1"
                  max="100000000"
                  step="100"
                  value={monto}
                  onChange={(event) => setMonto(event.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Fecha</span>
                <input
                  required
                  type="date"
                  value={fecha}
                  onChange={(event) => setFecha(event.target.value)}
                  className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none focus:border-sky-600"
                />
              </label>
            </div>
            {errorFormulario && <p role="alert" className="text-sm text-rose-700">{errorFormulario}</p>}
            <button
              type="submit"
              disabled={guardando}
              className="w-full rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-sky-600 disabled:cursor-wait disabled:opacity-60"
            >
              {guardando ? 'Registrando...' : 'Registrar multa'}
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
};
