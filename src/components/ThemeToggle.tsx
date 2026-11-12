import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../auth/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const temaSiguiente = theme === 'dark' ? 'claro' : 'oscuro';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${temaSiguiente}`}
      title={`Cambiar a modo ${temaSiguiente}`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#173b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b35]"
    >
      {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
