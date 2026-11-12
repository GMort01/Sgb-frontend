import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { ArrowLeft, LibraryBig } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export const LoginPage = () => {
  const { usuario, iniciarSesion, cargando } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!cargando && usuario) {
    return <Navigate to={usuario.rol === 'Bibliotecario' ? '/bibliotecario' : '/estudiante'} replace />;
  }

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const perfil = await iniciarSesion(correo.trim(), password);
      const destino = (location.state as { from?: string } | null)?.from;
      navigate(destino || (perfil.rol === 'Bibliotecario' ? '/bibliotecario' : '/estudiante'), { replace: true });
    } catch (requestError) {
      setError(isAxiosError(requestError) && requestError.response?.status === 401
        ? 'Correo o contraseña incorrectos.'
        : 'No se pudo iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12 text-slate-800">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-sky-700">
          <ArrowLeft size={16} />Volver al portal
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-xl bg-sky-100 p-3 text-sky-700"><LibraryBig size={22} /></span>
          <div><p className="font-bold">SGB Unimadeira</p><p className="text-sm text-slate-500">Acceso seguro</p></div>
        </div>
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-500">Usa el correo y la contraseña de tu cuenta institucional.</p>
        <form onSubmit={enviar} className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm font-medium">
            <span>Correo electrónico</span>
            <input type="email" autoComplete="username" required value={correo} onChange={(event) => setCorreo(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600" />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Contraseña</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-600" />
          </label>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <button type="submit" disabled={enviando} className="w-full rounded-xl bg-sky-700 px-4 py-3 font-semibold text-white disabled:opacity-60">
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        {import.meta.env.DEV && (
          <p className="mt-5 text-xs leading-relaxed text-slate-500">
            En desarrollo, las cuentas semilla utilizan la contraseña <code>Demo123!</code>. Cámbiala configurando <code>DEMO_USER_PASSWORD</code>.
          </p>
        )}
      </section>
    </main>
  );
};
