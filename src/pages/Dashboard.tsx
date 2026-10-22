import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, CircleDollarSign, Clock3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { multaService } from '../services/multaService';
import { prestamoService } from '../services/prestamoService';
import { recursoService } from '../services/recursoService';
import { usuarioService } from '../services/usuarioService';
import type { Multa, Prestamo, Recurso, Usuario } from '../types';

function fechaCorta(fecha: string) {
  const valor = new Date(`${fecha.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(valor.getTime())) return fecha;
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short' }).format(valor);
}

function moneda(valor: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
}

export const Dashboard = () => {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [multas, setMultas] = useState<Multa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    Promise.all([
      recursoService.obtenerTodos(),
      prestamoService.obtenerActivos(),
      usuarioService.obtenerTodos(),
      multaService.obtenerTodas(),
    ])
      .then(([listaRecursos, listaPrestamos, listaUsuarios, listaMultas]) => {
        if (!activo) return;
        setRecursos(listaRecursos);
        setPrestamos(listaPrestamos);
        setUsuarios(listaUsuarios);
        setMultas(listaMultas);
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar todos los indicadores. Verifica que el servidor esté disponible.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const ejemplares = recursos.reduce((total, recurso) => total + (recurso.ejemplares ?? 0), 0);
  const saldoPendiente = multas
    .filter((multa) => multa.estado === 'Pendiente')
    .reduce((total, multa) => total + multa.monto, 0);
  const prestamosRecientes = [...prestamos]
    .sort((a, b) => b.fechaSalida.localeCompare(a.fechaSalida))
    .slice(0, 5);

  const metricas = [
    {
      label: 'Recursos en catálogo',
      valor: recursos.length,
      detalle: `${ejemplares} ejemplares registrados`,
      icono: BookOpen,
      color: 'text-sky-700 bg-sky-100 ring-sky-200',
      ruta: '/bibliotecario/recursos',
    },
    {
      label: 'Préstamos activos',
      valor: prestamos.length,
      detalle: 'Préstamos por gestionar',
      icono: Clock3,
      color: 'text-amber-700 bg-amber-50 ring-amber-200',
      ruta: '/bibliotecario/prestamos',
    },
    {
      label: 'Usuarios registrados',
      valor: usuarios.length,
      detalle: 'Miembros de la comunidad',
      icono: Users,
      color: 'text-violet-700 bg-violet-50 ring-violet-200',
      ruta: '/bibliotecario/usuarios',
    },
    {
      label: 'Saldo de multas',
      valor: moneda(saldoPendiente),
      detalle: `${multas.filter((multa) => multa.estado === 'Pendiente').length} pendientes`,
      icono: CircleDollarSign,
      color: 'text-rose-700 bg-rose-50 ring-rose-200',
      ruta: '/bibliotecario/multas',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Resumen general</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">Panel de biblioteca</h1>
          <p className="mt-2 text-slate-500">Estado actual del catálogo y la actividad bibliotecaria.</p>
        </div>
        <p className="text-sm text-slate-500">
          {new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
        </p>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricas.map((metrica) => {
          const Icono = metrica.icono;
          return (
            <Link
              key={metrica.label}
              to={metrica.ruta}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 transition hover:-translate-y-1 hover:border-sky-300 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-xl p-3 ring-1 ring-inset ${metrica.color}`}>
                  <Icono size={21} aria-hidden="true" />
                </span>
                <ArrowUpRight size={17} className="text-slate-500 transition group-hover:text-sky-700" aria-hidden="true" />
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">{metrica.label}</p>
              <p className="mt-1 truncate text-2xl font-bold text-slate-800">
                {cargando ? <span className="inline-block h-8 w-24 animate-pulse rounded bg-slate-100" /> : metrica.valor}
              </p>
              <p className="mt-2 text-xs text-slate-500">{cargando ? 'Cargando información...' : metrica.detalle}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-semibold text-slate-800">Préstamos activos</h2>
              <p className="mt-1 text-xs text-slate-500">Actividad reciente del catálogo</p>
            </div>
            <Link to="/bibliotecario/prestamos" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 transition hover:text-sky-800">
              Ver todos <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {cargando ? (
            <div className="space-y-3 p-5" aria-label="Cargando préstamos">
              {[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : prestamosRecientes.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <BookOpen className="mx-auto mb-3 text-slate-500" size={30} aria-hidden="true" />
              <p className="font-medium text-slate-700">No hay préstamos activos</p>
              <p className="mt-1 text-sm text-slate-500">Cuando se registren, aparecerán en este resumen.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/70">
              {prestamosRecientes.map((prestamo) => (
                <div key={prestamo.id} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-100 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-700">{prestamo.usuario}</p>
                    <p className="mt-1 truncate font-mono text-xs text-slate-500">{prestamo.codigoRecurso}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-slate-500">Devolución</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">{fechaCorta(prestamo.fechaDevolucion)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-6">
            <h2 className="font-semibold text-slate-800">Accesos rápidos</h2>
            <p className="mt-1 text-sm text-slate-500">Tareas frecuentes de administración</p>
            <div className="mt-5 space-y-2">
              {[
                { label: 'Registrar recurso', detalle: 'Añadir al catálogo', ruta: '/bibliotecario/recursos', icono: BookOpen },
                { label: 'Añadir usuario', detalle: 'Registrar miembro', ruta: '/bibliotecario/usuarios', icono: Users },
                { label: 'Registrar multa', detalle: 'Crear un cargo', ruta: '/bibliotecario/multas', icono: CircleDollarSign },
              ].map((acceso) => {
                const Icono = acceso.icono;
                return (
                  <Link
                    key={acceso.label}
                    to={acceso.ruta}
                    className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-slate-200 hover:bg-slate-100/80"
                  >
                    <span className="rounded-lg bg-slate-100 p-2 text-sky-700 transition group-hover:bg-sky-100">
                      <Icono size={17} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-700">{acceso.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{acceso.detalle}</span>
                    </span>
                    <ArrowRight size={15} className="text-slate-500 transition group-hover:text-sky-700" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-slate-100 p-5 sm:p-6">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
              <ArrowDownRight size={17} aria-hidden="true" />
              Resumen del catálogo
            </span>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {cargando
                ? 'Consultando el estado de los recursos...'
                : `${recursos.filter((recurso) => (recurso.estado === 'Disponible' || !recurso.estado) && (recurso.ejemplares ?? 0) > 0).length} recursos figuran disponibles en ${new Set(recursos.map((recurso) => recurso.coleccion)).size} colecciones.`}
            </p>
            <Link to="/bibliotecario/recursos" className="mt-4 inline-flex text-sm font-semibold text-sky-700 transition hover:text-sky-800">
              Explorar catálogo <ArrowRight size={15} className="ml-1" aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
    </section>
  );
};
