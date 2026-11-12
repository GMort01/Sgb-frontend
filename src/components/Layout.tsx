import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export const Layout: React.FC = () => {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <Link to="/bibliotecario" className="mb-5 block text-xl font-bold text-sky-700">SGB Unimadeira</Link>
          <p className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-800">
            Sesión: {usuario?.nombres} {usuario?.apellidos} · Bibliotecario
          </p>
          <nav className="space-y-3">
            <Link to="/" className="block rounded-lg px-4 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-800">Volver al portal</Link>
            <Link to="/bibliotecario" className="block rounded-lg px-4 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-800">Resumen e informes</Link>
            <Link to="/bibliotecario/recursos" className="block rounded-lg px-4 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-800">Recursos bibliográficos</Link>
            <Link to="/bibliotecario/usuarios" className="block rounded-lg px-4 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-800">Usuarios</Link>
            <Link to="/bibliotecario/prestamos" className="block rounded-lg px-4 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-800">Préstamos y reservas</Link>
            <Link to="/bibliotecario/multas" className="block rounded-lg px-4 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-800">Multas</Link>
            <Link to="/bibliotecario/actividades" className="block rounded-lg px-4 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-800">Actividades</Link>
          </nav>
        </div>
        <div className="text-xs text-slate-500">
          <button type="button" onClick={cerrarSesion} className="mb-3 block font-semibold text-sky-700">Cerrar sesión</button>
          Universidad de Madeira · Sistema bibliotecario
        </div>
      </aside>

      {/* Contenido Dinámico */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};