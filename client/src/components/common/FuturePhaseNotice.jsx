/**
 * Explicitly marks functionality that is planned but NOT built yet.
 *
 * The project is delivered in three parts; this component makes it visually
 * obvious to a reviewer/judge which capabilities are live today and which are
 * scheduled. It never displays simulated live data.
 */
export default function FuturePhaseNotice({
  phase = 'Part 3',
  title = 'Coming in a later stage',
  items = [],
  children,
  className = '',
}) {
  return (
    <section
      className={`rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-slate-400 bg-white px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-600">
          {phase} · not implemented
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      {items.length > 0 && (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
            >
              <span aria-hidden="true" className="mt-0.5 text-slate-400">
                ○
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {children && <div className="mt-3 text-sm text-slate-600">{children}</div>}
    </section>
  );
}
