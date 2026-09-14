import { Link, Outlet } from 'react-router-dom';
import Footer from '../components/layout/Footer.jsx';
import { APP_NAME } from '../utils/constants.js';
import paths from '../routes/paths.js';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a href="#main" className="k-skip-link">
        Skip to main content
      </a>

      <div className="bg-govt-900 text-xs text-white/80">
        <div className="k-container flex flex-wrap items-center justify-between gap-2 py-1.5">
          <span>Smart India Hackathon 2026 · Agricultural procurement prototype</span>
          <span className="hidden sm:inline">Part 1 · Frontend foundation</span>
        </div>
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="k-container flex h-16 items-center justify-between gap-4">
          <Link to={paths.home} className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-700 text-lg"
            >
              🌾
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-900 sm:text-base">
                {APP_NAME}
              </span>
              <span className="hidden text-[11px] uppercase tracking-wide text-slate-500 sm:block">
                Procurement slot booking &amp; queue coordination
              </span>
            </span>
          </Link>

          <nav aria-label="Account" className="flex items-center gap-2">
            <Link
              to={paths.farmerLogin}
              className="rounded-md px-3 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50"
            >
              Farmer login
            </Link>
            <Link
              to={paths.adminLogin}
              className="hidden rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-block"
            >
              Admin
            </Link>
            <Link
              to={paths.farmerRegister}
              className="rounded-md bg-brand-700 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
