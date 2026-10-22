import { useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, MapPin, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { actividadService } from '../services/actividadService';
import type { Actividad } from '../types';

const fechaMinima = new Date().toISOString().slice(0, 10);

function fechaVisible(fecha: string) {
  const date = new Date(`${fecha}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? fecha
    : new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export const ActividadesPage = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(fechaMinima);
  const [hora, setHora] = useState('10:00');
  const [lugar, setLugar] = useState('');
  const [cupos, setCupos] = useState('20');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    actividadService.obtenerTodas()
      .then((data) => {
        if (activo) setActividades(data);
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar las actividades.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const crearActividad = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      const nueva = await actividadService.crear({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fecha,
        hora,
        lugar: lugar.trim(),
        cupos: Number(cupos),
      });
      setActividades((actuales) => [...actuales, nueva].sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)));
      setTitulo('');
      setDescripcion('');
      setLugar('');
      setCupos('20');
      setMensaje('Actividad creada y disponible para inscripción.');
    } catch {
      setError('No se pudo crear la actividad. Comprueba los datos e inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Programación</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">Actividades bibliotecarias</h1>
        <p className="mt-2 text-slate-500">Crea eventos y revisa las inscripciones de la comunidad.</p>
      </header>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
      {mensaje && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{mensaje}</div>}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Próximos eventos</h2>
            <p className="mt-1 text-sm text-slate-500">Las inscripciones del portal estudiantil se reflejan aquí.</p>
          </div>
          {cargando ? (
            <div className="space-y-3" aria-label="Cargando actividades">
              {[1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />)}
            </div>
          ) : actividades.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-14 text-center text-sm text-slate-500">Aún no hay actividades futuras. Puedes crear la primera.</div>
          ) : (
            <div className="space-y-3">
              {actividades.map((actividad) => (
                <article key={actividad.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-sky-700">
                        <CalendarDays size={14} aria-hidden="true" />
                        {fechaVisible(actividad.fecha)} · {actividad.hora}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold text-slate-800">{actividad.titulo}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">{actividad.descripcion}</p>
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={13} aria-hidden="true" />{actividad.lugar}</p>
                    </div>
                    <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-center">
                      <p className="text-xl font-bold text-slate-800">{actividad.inscritos}<span className="text-slate-500">/{actividad.cupos}</span></p>
                      <p className="text-xs text-slate-500">inscritos</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          <Link to="/estudiante" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800">
            Ver portal de estudiante <span aria-hidden="true">→</span>
          </Link>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-6">
          <div className="mb-5">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700"><Plus size={17} aria-hidden="true" />Programación</span>
            <h2 className="mt-2 text-xl font-bold text-slate-800">Crear actividad</h2>
          </div>
          <form onSubmit={crearActividad} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Nombre del evento</span>
              <input required maxLength={120} value={titulo} onChange={(event) => setTitulo(event.target.value)} placeholder="Ej. Club de lectura" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Descripción</span>
              <textarea required maxLength={500} rows={3} value={descripcion} onChange={(event) => setDescripcion(event.target.value)} placeholder="¿De qué trata la actividad?" className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Fecha</span>
                <input required type="date" min={fechaMinima} value={fecha} onChange={(event) => setFecha(event.target.value)} className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none focus:border-sky-600" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Hora</span>
                <input required type="time" value={hora} onChange={(event) => setHora(event.target.value)} className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none focus:border-sky-600" />
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Lugar</span>
              <input required maxLength={120} value={lugar} onChange={(event) => setLugar(event.target.value)} placeholder="Sala o ubicación" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Cupos</span>
              <input required type="number" min="1" max="500" value={cupos} onChange={(event) => setCupos(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-600" />
            </label>
            <button type="submit" disabled={guardando} className="w-full rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-sky-600 disabled:cursor-wait disabled:opacity-60">
              {guardando ? 'Creando...' : 'Publicar actividad'}
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
};
