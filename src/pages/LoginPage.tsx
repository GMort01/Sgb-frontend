import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { ArrowLeft, LibraryBig, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { RolNoPermitidoError } from '../services/authService';
import type { Usuario } from '../types';
import { ThemeToggle } from '../components/ThemeToggle';

export const LoginPage = ({ rolesPermitidos }: { rolesPermitidos: Usuario['rol'][] }) => {
  const { usuario, iniciarSesion, cargando } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const esBibliotecario = rolesPermitidos.includes('Bibliotecario');
  const nombreAcceso = esBibliotecario ? 'Personal bibliotecario' : 'Comunidad académica';

  if (!cargando && usuario) {
    return <Navigate to={usuario.rol === 'Bibliotecario' ? '/bibliotecario' : '/estudiante'} replace />;
  }

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const perfil = await iniciarSesion(correo.trim(), password, rolesPermitidos);
      const destino = (location.state as { from?: string } | null)?.from;
      navigate(destino || (perfil.rol === 'Bibliotecario' ? '/bibliotecario' : '/estudiante'), { replace: true });
    } catch (requestError) {
      if (requestError instanceof RolNoPermitidoError) {
        setError(rolesPermitidos.includes('Bibliotecario')
          ? 'Esta cuenta no tiene perfil de bibliotecario. Usa el acceso de la comunidad académica.'
          : 'Esta cuenta no tiene perfil de estudiante o profesor. Usa el acceso de bibliotecarios.');
      } else {
        setError(isAxiosError(requestError) && requestError.response?.status === 401
          ? 'Correo o contraseña incorrectos.'
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-slate-800 lg:grid lg:grid-cols-[minmax(320px,0.9fr)_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-[#173b35] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -bottom-36 -left-32 h-[28rem] w-[28rem] rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-20 h-[22rem] w-[22rem] rounded-full border border-white/10" aria-hidden="true" />
        <Link to="/" className="relative flex items-center gap-3" aria-label="Volver a Biblioteca Unimadeira">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#e4c990]">
            <LibraryBig size={25} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold uppercase tracking-[0.12em]">Unimadeira</span>
            <span className="mt-0.5 block text-xs text-white/65">Biblioteca universitaria</span>
          </span>
        </Link>
        <div className="relative max-w-lg py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e4c990]">Acceso institucional</p>
          <h1 className="mt-5 font-serif text-4xl font-medium leading-tight xl:text-5xl">
            Tu biblioteca, al servicio de la comunidad.
          </h1>
          <p className="mt-5 max-w-md leading-7 text-white/70">
            Recursos, servicios bibliotecarios y actividades académicas en un mismo espacio.
          </p>
        </div>
        <p className="relative text-xs text-white/55">Universidad de Madeira</p>
      </aside>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:justify-center lg:px-12 xl:px-20">
        <header className="flex items-center justify-between lg:absolute lg:right-12 lg:top-8 xl:right-20">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#173b35]">
            <ArrowLeft size={16} aria-hidden="true" />Volver al portal
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex"><ShieldCheck size={15} aria-hidden="true" />Acceso protegido</span>
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto my-auto w-full max-w-md py-12 lg:my-0 lg:py-0">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#173b35] text-[#e4c990]">
              <LibraryBig size={23} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold uppercase tracking-[0.12em] text-[#173b35]">Unimadeira</span>
              <span className="mt-0.5 block text-xs text-slate-500">Biblioteca universitaria</span>
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#826a3f]">{nombreAcceso}</p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-[#173b35] sm:text-4xl">Iniciar sesión</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Ingresa con el correo y la contraseña asociados a tu cuenta institucional.</p>

          <form onSubmit={enviar} className="mt-8 space-y-5">
            <label className="block space-y-2 text-sm font-medium">
              <span>Correo electrónico</span>
              <input
                type="email"
                autoComplete="username"
                required
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#28574e] focus:ring-2 focus:ring-[#28574e]/15"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Contraseña</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#28574e] focus:ring-2 focus:ring-[#28574e]/15"
              />
            </label>
            {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
            <button type="submit" disabled={enviando} className="w-full rounded-lg bg-[#173b35] px-4 py-3 font-semibold text-white transition hover:bg-[#245449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b35] disabled:cursor-not-allowed disabled:opacity-60">
              {enviando ? 'Verificando acceso...' : 'Ingresar'}
            </button>
          </form>
          <p className="mt-6 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
            Si tienes inconvenientes para ingresar, comunícate con el personal de la biblioteca.
          </p>
        </div>
      </section>
    </main>
  );
};
