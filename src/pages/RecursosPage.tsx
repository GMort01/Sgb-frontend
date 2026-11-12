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
  'Baja administrativa': 'bg-slate-100 text-slate-700 ring-slate-500/20',
  Baja: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

const estadosRecurso: NonNullable<Recurso['estado']>[] = [
  'Disponible',
  'Prestado',
  'Reservado',
  'Perdido',
  'Baja administrativa',
];

const estadoInicial = {
  titulo: '',
  autor: '',
  isbn: '',
  resumen: '',
  fechaPublicacion: '',
  dimensiones: '',
  encuadernacion: '',
  issn: '',
  periodicidad: '',
  formato: 'pdf' as NonNullable<Recurso['formato']>,
  tipoEquipo: 'Laptop' as NonNullable<Recurso['tipoEquipo']>,
  numeroEquipo: '',
  marca: '',
  modelo: '',
  cargador: true,
  funda: true,
  coleccion: 'General' as Recurso['coleccion'],
  ejemplares: '5',
  estado: 'Disponible' as NonNullable<Recurso['estado']>,
};

function minimoEjemplares(coleccion: Recurso['coleccion'], tipoEquipo: Recurso['tipoEquipo']) {
  if (coleccion === 'General') return 5;
  if (coleccion === 'Reserva') return 10;
  if (coleccion === 'Referencia') return 3;
  if (coleccion === 'Hemeroteca') return 2;
  if (coleccion === 'Tecnoteca') return tipoEquipo === 'Tableta' ? 10 : 3;
  return 0;
}

export const RecursosPage = () => {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [coleccionActiva, setColeccionActiva] = useState('Todas');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState(estadoInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [estadoActualizandoId, setEstadoActualizandoId] = useState<number | null>(null);
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
        ...(formulario.coleccion === 'Mapoteca' ? {} : { ejemplares: Number(formulario.ejemplares) }),
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

  const cambiarEstado = async (recurso: Recurso, estado: NonNullable<Recurso['estado']>) => {
    if (recurso.id === undefined) return;
    setEstadoActualizandoId(recurso.id);
    setError(null);
    try {
      const actualizado = await recursoService.actualizarEstado(recurso.id, estado);
      setRecursos((actuales) => actuales.map((item) => (
        item.id === actualizado.id ? { ...item, ...actualizado } : item
      )));
    } catch {
      setError('No se pudo actualizar el estado del recurso. Inténtalo de nuevo.');
    } finally {
      setEstadoActualizandoId(null);
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
            const estado = recurso.estado === 'Disponible' && recurso.coleccion !== 'Mapoteca' && (recurso.ejemplares ?? 0) < 1
              ? 'Prestado'
              : recurso.estado ?? 'Disponible';
            const estadoLegible = estado === 'Baja' ? 'Baja administrativa' : estado;
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
                  <div className="flex flex-col items-end gap-2">
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${estadoStyles[estado]}`}>
                      {estadoLegible}
                    </span>
                    <label>
                      <span className="sr-only">Cambiar estado de {recurso.titulo}</span>
                      <select
                        aria-label={`Cambiar estado de ${recurso.titulo}`}
                        value={estado === 'Baja' ? 'Baja administrativa' : estado}
                        disabled={estadoActualizandoId === recurso.id}
                        onChange={(event) => void cambiarEstado(recurso, event.target.value as NonNullable<Recurso['estado']>)}
                        className="max-w-40 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 disabled:opacity-50"
                      >
                        {estadosRecurso.map((estadoOpcion) => (
                          <option key={estadoOpcion} value={estadoOpcion}>{estadoOpcion}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <h2 className="mt-5 line-clamp-2 text-lg font-semibold leading-snug text-slate-800">{recurso.titulo}</h2>
                <p className="mt-1 text-sm text-slate-500">{recurso.autor || 'Autor no especificado'}</p>
                <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Ejemplares</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {recurso.coleccion === 'Mapoteca'
                      ? 'Préstamo por USB'
                      : `${recurso.ejemplares ?? 0} disponibles / ${recurso.ejemplaresTotales ?? recurso.ejemplares ?? 0} registrados`}
                  </span>
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
            className="my-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-black/40 sm:p-8"
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
                    onChange={(event) => {
                      const coleccion = event.target.value as Recurso['coleccion'];
                      setFormulario({
                        ...formulario,
                        coleccion,
                        ejemplares: String(minimoEjemplares(coleccion, formulario.tipoEquipo) || 0),
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-sky-600"
                  >
                    {colecciones.map((coleccion) => <option key={coleccion} value={coleccion}>{coleccion}</option>)}
                  </select>
                </label>
                {formulario.coleccion !== 'Mapoteca' && (
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Ejemplares iniciales</span>
                    <input
                      type="number"
                      min={minimoEjemplares(formulario.coleccion, formulario.tipoEquipo)}
                      max="999"
                      required
                      value={formulario.ejemplares}
                      onChange={(event) => setFormulario({ ...formulario, ejemplares: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-sky-600"
                    />
                  </label>
                )}
              </div>
              {['General', 'Reserva'].includes(formulario.coleccion) && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">ISBN</span>
                      <input required maxLength={20} value={formulario.isbn} onChange={(event) => setFormulario({ ...formulario, isbn: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Fecha de publicación</span>
                      <input type="date" required value={formulario.fechaPublicacion} onChange={(event) => setFormulario({ ...formulario, fechaPublicacion: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Dimensiones</span>
                      <input required maxLength={100} value={formulario.dimensiones} onChange={(event) => setFormulario({ ...formulario, dimensiones: event.target.value })} placeholder="Ej. 15 x 23 cm" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Encuadernación</span>
                      <input required maxLength={100} value={formulario.encuadernacion} onChange={(event) => setFormulario({ ...formulario, encuadernacion: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" />
                    </label>
                  </div>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Resumen</span>
                    <textarea required maxLength={2000} value={formulario.resumen} onChange={(event) => setFormulario({ ...formulario, resumen: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" />
                  </label>
                </>
              )}
              {formulario.coleccion === 'Referencia' && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Medidas (pulgadas)</span>
                  <input required maxLength={100} value={formulario.dimensiones} onChange={(event) => setFormulario({ ...formulario, dimensiones: event.target.value })} placeholder="Ej. 8 x 10 pulgadas" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" />
                </label>
              )}
              {formulario.coleccion === 'Hemeroteca' && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">ISSN</span>
                    <input required maxLength={20} value={formulario.issn} onChange={(event) => setFormulario({ ...formulario, issn: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Periodicidad</span>
                    <input required maxLength={80} value={formulario.periodicidad} onChange={(event) => setFormulario({ ...formulario, periodicidad: event.target.value })} placeholder="Mensual, semanal..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" />
                  </label>
                </div>
              )}
              {formulario.coleccion === 'Mapoteca' && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Formato digital</span>
                  <select value={formulario.formato} onChange={(event) => setFormulario({ ...formulario, formato: event.target.value as NonNullable<Recurso['formato']> })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800">
                    <option value="jpg">JPG</option><option value="pdf">PDF</option><option value="shape">Shape</option><option value="dwg">DWG</option>
                  </select>
                  <span className="block text-xs text-slate-500">Préstamo de lectura mediante USB; no se administra cantidad de ejemplares.</span>
                </label>
              )}
              {formulario.coleccion === 'Tecnoteca' && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Tipo de equipo</span>
                      <select value={formulario.tipoEquipo} onChange={(event) => {
                        const tipoEquipo = event.target.value as NonNullable<Recurso['tipoEquipo']>;
                        setFormulario({ ...formulario, tipoEquipo, ejemplares: String(minimoEjemplares('Tecnoteca', tipoEquipo)) });
                      }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800">
                        <option>Laptop</option><option>Tableta</option>
                      </select>
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Número de equipo</span>
                      <input required maxLength={40} value={formulario.numeroEquipo} onChange={(event) => setFormulario({ ...formulario, numeroEquipo: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Marca</span>
                      <input required maxLength={80} value={formulario.marca} onChange={(event) => setFormulario({ ...formulario, marca: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Modelo</span>
                      <input required maxLength={80} value={formulario.modelo} onChange={(event) => setFormulario({ ...formulario, modelo: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" />
                    </label>
                  </div>
                  <div className="flex gap-6 text-sm text-slate-700">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={formulario.cargador} onChange={(event) => setFormulario({ ...formulario, cargador: event.target.checked })} />Incluye cargador</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={formulario.funda} onChange={(event) => setFormulario({ ...formulario, funda: event.target.checked })} />Incluye funda</label>
                  </div>
                </>
              )}
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
                  <option>Baja administrativa</option>
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
