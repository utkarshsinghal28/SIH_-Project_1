import { NavLink } from 'react-router-dom';

/** Desktop-only secondary navigation for the admin operational console. */
export default function Sidebar({ links = [], title = 'Operations' }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="sticky top-0 p-4">
        <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <nav aria-label="Secondary" className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-govt-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <span aria-hidden="true">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
