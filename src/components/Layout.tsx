import {
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  LibraryBig,
  LogOut,
  UsersRound,
  Warehouse,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ThemeToggle } from './ThemeToggle';

const enlaces = [
  { to: '/bibliotecario', texto: 'Resumen general', icono: ChartNoAxesCombined, end: true },
  { to: '/bibliotecario/recursos', texto: 'Colecciones', icono: BookOpen },
  { to: '/bibliotecario/usuarios', texto: 'Usuarios', icono: UsersRound },
  { to: '/bibliotecario/prestamos', texto: 'Préstamos y reservas', icono: Warehouse },
  { to: '/bibliotecario/multas', texto: 'Multas', icono: CircleDollarSign },
  { to: '/bibliotecario/actividades', texto: 'Actividades', icono: CalendarDays },
];

export const Layout = () => {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-slate-800 md:flex">
      <aside className="flex flex-col border-b border-slate-200 bg-white md:min-h-screen md:w-72 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-5 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#173b35] text-[#e4c990]">
              <LibraryBig size={23} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#173b35]">Unimadeira</p>
              <p className="mt-0.5 text-xs text-slate-500">Gestión bibliotecaria</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="mx-5 mb-4 rounded-lg bg-[#f5f6f3] px-3 py-3 md:mx-4">
          <p className="text-xs font-medium text-slate-500">Sesión iniciada</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-800">{usuario?.nombres} {usuario?.apellidos}</p>
          <p className="mt-0.5 text-xs text-[#826a3f]">Personal bibliotecario</p>
        </div>

        <nav aria-label="Navegación principal" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:px-3 md:py-2">
          {enlaces.map(({ to, texto, icono: Icono, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-[#edf2ef] text-[#173b35]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#173b35]'
              }`}
            >
              <Icono size={18} aria-hidden="true" />
              {texto}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-slate-100 p-4 md:block">
          <NavLink to="/" className="mb-3 block px-3 text-xs font-medium text-slate-500 transition hover:text-[#173b35]">
            Ir al portal institucional
          </NavLink>
          <button type="button" onClick={cerrarSesion} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-[#173b35]">
            <LogOut size={17} aria-hidden="true" />Cerrar sesión
          </button>
          <p className="mt-4 px-3 text-[11px] leading-5 text-slate-400">Universidad de Madeira</p>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 md:hidden">
          <NavLink to="/" className="text-xs font-medium text-slate-500">Portal institucional</NavLink>
          <button type="button" onClick={cerrarSesion} className="flex items-center gap-1.5 text-xs font-semibold text-[#173b35]">
            <LogOut size={15} aria-hidden="true" />Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};
