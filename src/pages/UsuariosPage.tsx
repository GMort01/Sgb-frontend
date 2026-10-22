import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Search, UserPlus, Users, X } from 'lucide-react';
import { usuarioService } from '../services/usuarioService';
import type { Usuario } from '../types';

const formularioInicial = {
  identificacion: '',
  codigo: '',
  nombres: '',
  apellidos: '',
  correo: '',
  rol: 'Estudiante' as Usuario['rol'],
};

const rolStyles: Record<Usuario['rol'], string> = {
  Estudiante: 'bg-sky-100 text-sky-700 ring-sky-200',
  Profesor: 'bg-violet-50 text-violet-700 ring-violet-200',
  Bibliotecario: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const cargarUsuarios = () => {
    setCargando(true);
    setError(null);
    usuarioService.obtenerTodos()
      .then(setUsuarios)
      .catch(() => setError('No se pudo cargar el directorio. Comprueba la conexión con el servidor.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    let activo = true;
    usuarioService.obtenerTodos()
      .then((data) => {
        if (activo) setUsuarios(data);
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar el directorio. Comprueba la conexión con el servidor.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase();
    return usuarios.filter((usuario) => (
      `${usuario.nombres} ${usuario.apellidos} ${usuario.identificacion} ${usuario.codigo} ${usuario.correo} ${usuario.rol}`
        .toLocaleLowerCase()
        .includes(consulta)
    ));
  }, [busqueda, usuarios]);

  const crearUsuario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardando(true);
    setErrorFormulario(null);
    try {
      const nuevoUsuario = await usuarioService.crear({
        ...formulario,
        identificacion: formulario.identificacion.trim(),
        codigo: formulario.codigo.trim(),
        nombres: formulario.nombres.trim(),
        apellidos: formulario.apellidos.trim(),
        correo: formulario.correo.trim(),
      });
      setUsuarios((actuales) => [...actuales, nuevoUsuario].sort((a, b) => (
        `${a.apellidos} ${a.nombres}`.localeCompare(`${b.apellidos} ${b.nombres}`, 'es')
      )));
      setModalAbierto(false);
      setFormulario(formularioInicial);
    } catch (requestError) {
      setErrorFormulario(isAxiosError(requestError) && requestError.response?.status === 409
        ? 'Ya hay un usuario registrado con esa identificación, código o correo.'
        : 'No se pudo registrar el usuario. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Comunidad</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">Usuarios</h1>
          <p className="mt-2 text-slate-500">Administra estudiantes, profesores y personal bibliotecario.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormulario(formularioInicial);
            setErrorFormulario(null);
            setModalAbierto(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-3 font-semibold text-slate-800 shadow-lg shadow-sky-900/10 transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <UserPlus size={18} aria-hidden="true" />
          Nuevo usuario
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <label className="relative block">
          <span className="sr-only">Buscar usuario</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por nombre, identificación, código o correo..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          <Users size={17} className="text-sky-700" aria-hidden="true" />
          <span><strong className="text-slate-800">{cargando ? '—' : usuarios.length}</strong> registrados</span>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span>{error}</span>
          <button type="button" onClick={cargarUsuarios} className="shrink-0 font-semibold text-rose-800 underline underline-offset-2">Reintentar</button>
        </div>
      )}

      {cargando ? (
        <div className="space-y-3" aria-label="Cargando usuarios">
          {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-white" />)}
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <Users className="mx-auto mb-4 text-slate-500" size={36} aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-800">
            {usuarios.length === 0 ? 'Todavía no hay usuarios registrados' : 'No se encontraron usuarios'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {usuarios.length === 0
              ? 'Agrega los miembros de la comunidad para poder identificarlos en la gestión bibliotecaria.'
              : 'Prueba con otro término de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-xs uppercase tracking-wider text-slate-500">
                  <th scope="col" className="px-5 py-4 font-semibold">Usuario</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Identificación</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Código</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Correo</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/70">
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="transition hover:bg-slate-100">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sm font-bold text-sky-700">
                          {usuario.nombres.charAt(0)}{usuario.apellidos.charAt(0)}
                        </span>
                        <span className="font-semibold text-slate-700">{usuario.nombres} {usuario.apellidos}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{usuario.identificacion}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-700">{usuario.codigo}</td>
                    <td className="px-5 py-4 text-slate-500">{usuario.correo}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${rolStyles[usuario.rol]}`}>
                        {usuario.rol}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
          </div>
        </div>
      )}

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-50/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !guardando) setModalAbierto(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="usuario-modal-titulo" className="my-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-black/40 sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-sky-700">Directorio</p>
                <h2 id="usuario-modal-titulo" className="mt-1 text-2xl font-bold text-slate-800">Registrar usuario</h2>
              </div>
              <button type="button" onClick={() => setModalAbierto(false)} disabled={guardando} aria-label="Cerrar formulario" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={crearUsuario} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {([
                  ['identificacion', 'Identificación', 'Número de documento'],
                  ['codigo', 'Código institucional', 'Código de estudiante o empleado'],
                  ['nombres', 'Nombres', 'Nombres'],
                  ['apellidos', 'Apellidos', 'Apellidos'],
                ] as const).map(([campo, etiqueta, placeholder]) => (
                  <label key={campo} className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">{etiqueta}</span>
                    <input
                      required
                      maxLength={campo === 'nombres' || campo === 'apellidos' ? 80 : 30}
                      value={formulario[campo]}
                      onChange={(event) => setFormulario({ ...formulario, [campo]: event.target.value })}
                      placeholder={placeholder}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                    />
                  </label>
                ))}
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Correo electrónico</span>
                <input
                  type="email"
                  required
                  maxLength={160}
                  value={formulario.correo}
                  onChange={(event) => setFormulario({ ...formulario, correo: event.target.value })}
                  placeholder="nombre@universidad.edu"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Rol</span>
                <select
                  value={formulario.rol}
                  onChange={(event) => setFormulario({ ...formulario, rol: event.target.value as Usuario['rol'] })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-sky-600"
                >
                  <option>Estudiante</option>
                  <option>Profesor</option>
                  <option>Bibliotecario</option>
                </select>
              </label>
              {errorFormulario && <p role="alert" className="text-sm text-rose-700">{errorFormulario}</p>}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setModalAbierto(false)} disabled={guardando} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={guardando} className="rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-sky-600 disabled:cursor-wait disabled:opacity-60">{guardando ? 'Guardando...' : 'Registrar usuario'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
};
