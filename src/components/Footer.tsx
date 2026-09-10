import { Link } from '@/lib/router';
import { Cpu, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-white">
                Gear<span className="text-sky-400">Genius</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Your intelligent companion for discovering the perfect smart gadgets.
              We analyze specs, compare features, and match you with technology that
              fits your life.
            </p>
            <div className="mt-6 flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#/"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse" className="text-slate-400 hover:text-sky-400">Browse All</Link></li>
              <li><Link to="/quiz" className="text-slate-400 hover:text-sky-400">Recommendation Quiz</Link></li>
              <li><Link to="/compare" className="text-slate-400 hover:text-sky-400">Compare Gadgets</Link></li>
              <li><Link to="/about" className="text-slate-400 hover:text-sky-400">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse/smartwatches" className="text-slate-400 hover:text-sky-400">Smartwatches</Link></li>
              <li><Link to="/browse/smartphones" className="text-slate-400 hover:text-sky-400">Smartphones</Link></li>
              <li><Link to="/browse/wireless-earbuds" className="text-slate-400 hover:text-sky-400">Earbuds</Link></li>
              <li><Link to="/browse/drones" className="text-slate-400 hover:text-sky-400">Drones</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} GearGenius. Built for smart gadget enthusiasts.</p>
        </div>
      </div>
    </footer>
  );
}
