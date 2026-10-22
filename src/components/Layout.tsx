import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <Link to="/bibliotecario" className="mb-5 block text-xl font-bold text-sky-700">SGB Unimadeira</Link>
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
            Modo demostración: las acciones son públicas y no requieren cuenta.
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
          Universidad de Madeira · Demo de biblioteca
        </div>
      </aside>

      {/* Contenido Dinámico */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};