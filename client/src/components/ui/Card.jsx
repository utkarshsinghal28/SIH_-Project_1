export default function Card({ title, description, actions, children, className = '', as = 'div' }) {
  const Wrapper = as;
  return (
    <Wrapper
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {description && <p className="mt-0.5 text-sm text-slate-600">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </Wrapper>
  );
}

export function StatCard({ label, value, tone = 'default', hint }) {
  const tones = {
    default: 'border-slate-200',
    positive: 'border-l-4 border-l-brand-600 border-slate-200',
    warning: 'border-l-4 border-l-amber-500 border-slate-200',
    neutral: 'border-l-4 border-l-slate-400 border-slate-200',
  };

  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${tones[tone] ?? tones.default}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
