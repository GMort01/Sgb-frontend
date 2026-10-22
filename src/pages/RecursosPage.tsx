import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BookOpen, LibraryBig, Plus, Search, X } from 'lucide-react';
import { recursoService } from '../services/recursoService';
import type { Recurso } from '../types';

const colecciones: Recurso['coleccion'][] = [
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

const estadoInicial = {
  titulo: '',
  autor: '',
  coleccion: 'General' as Recurso['coleccion'],
  ejemplares: '1',
  estado: 'Disponible' as NonNullable<Recurso['estado']>,
};

export const RecursosPage = () => {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [coleccionActiva, setColeccionActiva] = useState('Todas');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState(estadoInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    recursoService.obtenerTodos()
      .then((data) => {
        if (activo) setRecursos(data);
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar el catálogo. Comprueba la conexión con el servidor.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const recursosFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase();
    return recursos.filter((recurso) => {
      const coincideTexto = `${recurso.titulo} ${recurso.autor ?? ''} ${recurso.coleccion}`
        .toLocaleLowerCase()
        .includes(consulta);
      return coincideTexto && (coleccionActiva === 'Todas' || recurso.coleccion === coleccionActiva);
    });
  }, [busqueda, coleccionActiva, recursos]);

  const abrirModal = () => {
    setFormulario(estadoInicial);
    setErrorFormulario(null);
    setModalAbierto(true);
  };

  const guardarRecurso = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardando(true);
    setErrorFormulario(null);

    try {
      const nuevoRecurso = await recursoService.crearRecurso({
        titulo: formulario.titulo.trim(),
        autor: formulario.autor.trim() || undefined,
        coleccion: formulario.coleccion,
        ejemplares: Number(formulario.ejemplares),
        estado: formulario.estado,
      });
      setRecursos((actuales) => [nuevoRecurso, ...actuales]);
      setModalAbierto(false);
    } catch {
      setErrorFormulario('No se pudo guardar el recurso. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Catálogo</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">Recursos bibliográficos</h1>
          <p className="mt-2 text-slate-500">Explora y administra el catálogo de la biblioteca.</p>
        </div>
        <button
          type="button"
          onClick={abrirModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-3 font-semibold text-slate-800 shadow-lg shadow-sky-900/10 transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <Plus size={18} aria-hidden="true" />
          Nuevo recurso
        </button>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:flex-row lg:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Buscar por título o autor</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por título, autor o colección..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <label className="flex items-center gap-3 text-sm text-slate-500">
          <span className="shrink-0">Colección</span>
          <select
            value={coleccionActiva}
            onChange={(event) => setColeccionActiva(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none focus:border-sky-600 sm:min-w-52"
          >
            <option value="Todas">Todas las colecciones</option>
            {colecciones.map((coleccion) => (
              <option key={coleccion} value={coleccion}>Colección {coleccion}</option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Cargando catálogo">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : recursosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <LibraryBig className="mx-auto mb-4 text-slate-500" size={36} aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-800">
            {recursos.length === 0 ? 'Aún no hay recursos registrados' : 'No se encontraron recursos'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {recursos.length === 0
              ? 'Registra el primer recurso para empezar a construir el catálogo.'
              : 'Prueba con otro término o cambia el filtro de colección.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {recursosFiltrados.map((recurso) => {
            const estado = recurso.estado === 'Disponible' && (recurso.ejemplares ?? 0) < 1
              ? 'Prestado'
              : recurso.estado ?? 'Disponible';
            return (
              <article
                key={recurso.id ?? `${recurso.titulo}-${recurso.coleccion}`}
                className="group flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 transition duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-900/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
                    <BookOpen size={14} aria-hidden="true" />
                    {recurso.coleccion}
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${estadoStyles[estado]}`}>
                    {estado}
                  </span>
                </div>
                <h2 className="mt-5 line-clamp-2 text-lg font-semibold leading-snug text-slate-800">{recurso.titulo}</h2>
                <p className="mt-1 text-sm text-slate-500">{recurso.autor || 'Autor no especificado'}</p>
                <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Ejemplares</span>
                  <span className="text-sm font-semibold text-slate-700">{recurso.ejemplares ?? 0} disponibles</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-50/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !guardando) setModalAbierto(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
            className="my-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-black/40 sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-sky-700">Catálogo</p>
                <h2 id="modal-titulo" className="mt-1 text-2xl font-bold text-slate-800">Registrar recurso</h2>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                disabled={guardando}
                aria-label="Cerrar formulario"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form className="space-y-5" onSubmit={guardarRecurso}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Título</span>
                <input
                  required
                  maxLength={200}
                  value={formulario.titulo}
                  onChange={(event) => setFormulario({ ...formulario, titulo: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                  placeholder="Título del recurso"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Autor</span>
                <input
                  maxLength={160}
                  value={formulario.autor}
                  onChange={(event) => setFormulario({ ...formulario, autor: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                  placeholder="Nombre del autor"
                />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Colección</span>
                  <select
                    value={formulario.coleccion}
                    onChange={(event) => setFormulario({ ...formulario, coleccion: event.target.value as Recurso['coleccion'] })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-sky-600"
                  >
                    {colecciones.map((coleccion) => <option key={coleccion} value={coleccion}>{coleccion}</option>)}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Ejemplares</span>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    required
                    value={formulario.ejemplares}
                    onChange={(event) => setFormulario({ ...formulario, ejemplares: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-sky-600"
                  />
                </label>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Estado</span>
                <select
                  value={formulario.estado}
                  onChange={(event) => setFormulario({ ...formulario, estado: event.target.value as NonNullable<Recurso['estado']> })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-sky-600"
                >
                  <option>Disponible</option>
                  <option>Prestado</option>
                  <option>Reservado</option>
                  <option>Perdido</option>
                  <option>Baja</option>
                </select>
              </label>

              {errorFormulario && <p role="alert" className="text-sm text-rose-700">{errorFormulario}</p>}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  disabled={guardando}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-sky-600 disabled:cursor-wait disabled:opacity-60"
                >
                  {guardando ? 'Guardando...' : 'Guardar recurso'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
};
