import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { APP_NAME } from '../../utils/constants.js';
import paths from '../../routes/paths.js';

const linkBase =
  'block rounded-md px-3 py-2 text-sm font-medium transition-colors md:inline-block';

function navClasses({ isActive }) {
  return `${linkBase} ${
    isActive ? 'bg-brand-800 text-white' : 'text-brand-50 hover:bg-brand-800 hover:text-white'
  }`;
}

export default function Navbar({ links = [], variant = 'farmer' }) {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const barColour = variant === 'admin' ? 'bg-govt-900' : 'bg-brand-700';

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate(variant === 'admin' ? paths.adminLogin : paths.home);
  };

  return (
    <header className={`${barColour} text-white`}>
      <div className="k-container">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            to={isAuthenticated ? (variant === 'admin' ? paths.adminDashboard : paths.farmerDashboard) : paths.home}
            className="flex min-w-0 items-center gap-2.5"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/15 text-lg"
            >
              🌾
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-tight sm:text-base">
                {APP_NAME}
              </span>
              <span className="block text-[11px] uppercase tracking-wide text-white/70">
                {variant === 'admin' ? 'Administration portal' : 'Farmer services'}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navClasses}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <span className="max-w-[12rem] truncate text-sm text-white/85">{user?.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-white/40 px-3 py-1.5 text-sm font-semibold hover:bg-white/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to={paths.farmerLogin}
                className="rounded-md border border-white/40 px-3 py-1.5 text-sm font-semibold hover:bg-white/10"
              >
                Sign in
              </Link>
            )}
          </div>

          <button
            type="button"
            className="rounded-md border border-white/40 p-2 md:hidden"
            aria-expanded={open}
            aria-controls="primary-navigation"
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" className="block text-lg leading-none">
              {open ? '✕' : '☰'}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div id="primary-navigation" className="border-t border-white/15 md:hidden">
          <nav className="k-container space-y-1 py-3" aria-label="Mobile">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navClasses}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 border-t border-white/15 pt-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${linkBase} w-full text-left text-brand-50 hover:bg-brand-800`}
                >
                  Sign out ({user?.name})
                </button>
              ) : (
                <NavLink to={paths.farmerLogin} className={navClasses} onClick={() => setOpen(false)}>
                  Sign in
                </NavLink>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
