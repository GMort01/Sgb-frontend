import { ArrowRight, BookOpen, Compass, LibraryBig, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PortalPage = () => (
  <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-800">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-sky-100 blur-3xl" />
      <div className="absolute -bottom-48 -right-20 h-[32rem] w-[32rem] rounded-full bg-cyan-100 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.08)_1px,transparent_0)] bg-[size:32px_32px]" />
    </div>

    <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">
      <header className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="SGB Unimadeira, inicio">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200">
            <LibraryBig size={23} aria-hidden="true" />
          </span>
          <span>
            <span className="block font-bold tracking-wide text-slate-800">SGB <span className="text-sky-700">UNIMADEIRA</span></span>
            <span className="mt-0.5 block text-xs text-slate-500">Sistema de Gestión Bibliotecaria</span>
          </span>
        </Link>
        <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50/90 px-3 py-1.5 text-xs font-medium text-slate-500 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          Portal de demostración
        </span>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
            <Sparkles size={14} aria-hidden="true" />
            Tu biblioteca, más cerca
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-800 sm:text-5xl lg:text-6xl">
            Bienvenido a la
            <span className="block text-sky-800">Biblioteca Unimadeira</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
            Explora el catálogo e inicia sesión para acceder a las funciones de tu perfil.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Link
            to="/login"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:bg-slate-50 sm:p-9"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-50 transition duration-300 group-hover:scale-150 group-hover:bg-sky-100" aria-hidden="true" />
            <div className="relative">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200 transition group-hover:bg-sky-200">
                <BookOpen size={26} aria-hidden="true" />
              </span>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Comunidad académica</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">Soy estudiante</h2>
              <p className="mt-3 max-w-sm leading-relaxed text-slate-500">
                Consulta el catálogo, gestiona tus préstamos y reservas con tu cuenta institucional.
              </p>
              <span className="mt-7 inline-flex items-center gap-2 font-semibold text-sky-700 transition group-hover:gap-3">
                Iniciar sesión <ArrowRight size={17} aria-hidden="true" />
              </span>
            </div>
          </Link>

          <Link
            to="/login"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:bg-slate-50 sm:p-9"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-50 transition duration-300 group-hover:scale-150 group-hover:bg-cyan-100" aria-hidden="true" />
            <div className="relative">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 ring-1 ring-inset ring-cyan-200 transition group-hover:bg-cyan-100">
                <Compass size={26} aria-hidden="true" />
              </span>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Personal bibliotecario</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">Soy bibliotecario</h2>
              <p className="mt-3 max-w-sm leading-relaxed text-slate-500">
                Gestiona el catálogo, los préstamos, los usuarios y las actividades con tu cuenta autorizada.
              </p>
              <span className="mt-7 inline-flex items-center gap-2 font-semibold text-cyan-700 transition group-hover:gap-3">
                Iniciar sesión <ArrowRight size={17} aria-hidden="true" />
              </span>
            </div>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
        El acceso a las operaciones está protegido por autenticación y permisos de usuario.
        </p>
      </section>

      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        Universidad de Madeira · Sistema de Gestión Bibliotecaria
      </footer>
    </div>
  </main>
);
