import { useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { Menu, X, Cpu, GitCompare } from 'lucide-react';
import { useCompare } from '@/lib/compare';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Browse', to: '/browse' },
  { label: 'Quiz', to: '/quiz' },
  { label: 'Compare', to: '/compare' },
  { label: 'About', to: '/about' },
];

export function Navbar() {
  const { path, navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const { compareList } = useCompare();

  const isActive = (to: string) => {
    if (to === '/') return path === '/';
    return path.startsWith(to);
  };

  const handleNav = (to: string) => {
    navigate(to);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-lg shadow-sky-200">
            <Cpu className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Gear<span className="text-sky-600">Genius</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'text-sky-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {link.label}
                {link.to === '/compare' && compareList.length > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-600 px-1 text-xs font-bold text-white">
                    {compareList.length}
                  </span>
                )}
              </span>
              {isActive(link.to) && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-sky-600" />
              )}
            </Link>
          ))}
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <button
                key={link.to}
                onClick={() => handleNav(link.to)}
                className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
                {link.to === '/compare' && compareList.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <GitCompare className="h-4 w-4" />
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-600 px-1 text-xs font-bold text-white">
                      {compareList.length}
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
