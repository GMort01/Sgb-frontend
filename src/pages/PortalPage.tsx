import { ArrowRight, BookOpen, CalendarDays, LibraryBig, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

const accesos = [
  {
    href: '/login/comunidad',
    etiqueta: 'Estudiantes y profesores',
    descripcion: 'Consulta el catálogo y gestiona tus servicios bibliotecarios.',
    icono: UsersRound,
  },
  {
    href: '/login/bibliotecario',
    etiqueta: 'Personal bibliotecario',
    descripcion: 'Administra colecciones, préstamos, usuarios y actividades.',
    icono: LibraryBig,
  },
];

export const PortalPage = () => (
  <main className="min-h-screen bg-[#f7f7f4] text-slate-800">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-3" aria-label="Biblioteca Unimadeira, inicio">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#173b35] text-[#e4c990]">
            <LibraryBig size={25} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold uppercase tracking-[0.12em] text-[#173b35]">Unimadeira</span>
            <span className="mt-0.5 block text-xs text-slate-500">Biblioteca universitaria</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-medium text-slate-500 sm:block">Universidad de Madeira</span>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
      <section className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-28">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#826a3f]">
            <span className="h-px w-8 bg-[#b79b66]" />
            Sistema de gestión bibliotecaria
          </p>
          <h1 className="mt-6 max-w-2xl font-serif text-4xl font-medium leading-[1.12] tracking-tight text-[#173b35] sm:text-5xl lg:text-6xl">
            Conocimiento abierto. Comunidad conectada.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Un espacio para descubrir recursos, acceder a servicios bibliotecarios y fortalecer la vida académica.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2"><BookOpen size={17} className="text-[#826a3f]" aria-hidden="true" />Colecciones universitarias</span>
            <span className="inline-flex items-center gap-2"><CalendarDays size={17} className="text-[#826a3f]" aria-hidden="true" />Actividades académicas</span>
          </div>
        </div>

        <section aria-labelledby="access-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.35)] sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#826a3f]">Acceso institucional</p>
            <h2 id="access-heading" className="mt-2 font-serif text-2xl font-medium text-[#173b35]">Ingresa a tu espacio</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Selecciona tu perfil. El acceso se valida con tu cuenta institucional.</p>
          </div>
          <div className="space-y-3">
            {accesos.map(({ href, etiqueta, descripcion, icono: Icono }) => (
              <Link
                key={href}
                to={href}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-[#9a8358] hover:bg-[#fbfaf7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b35]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#edf2ef] text-[#28574e]">
                  <Icono size={21} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-800">{etiqueta}</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-500">{descripcion}</span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#173b35]" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
            Las funciones disponibles dependen del perfil asociado a tu cuenta.
          </p>
        </section>
      </section>

      <section aria-label="Servicios bibliotecarios" className="grid gap-0 border-y border-slate-200 py-7 sm:grid-cols-3">
        <div className="py-3 sm:px-6 sm:first:pl-0">
          <p className="text-sm font-semibold text-[#173b35]">Consulta de colecciones</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">Explora los recursos disponibles en la biblioteca.</p>
        </div>
        <div className="border-slate-200 py-3 sm:border-l sm:px-6">
          <p className="text-sm font-semibold text-[#173b35]">Servicios de circulación</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">Gestiona préstamos, renovaciones y reservas.</p>
        </div>
        <div className="border-slate-200 py-3 sm:border-l sm:px-6 sm:last:pr-0">
          <p className="text-sm font-semibold text-[#173b35]">Comunidad académica</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">Consulta actividades y novedades universitarias.</p>
        </div>
      </section>
    </div>

    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <span>Universidad de Madeira · Biblioteca universitaria</span>
        <span>Sistema de Gestión Bibliotecaria</span>
      </div>
    </footer>
  </main>
);
