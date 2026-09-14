/** Shared shell for the three authentication screens. */
export default function AuthCard({ title, subtitle, children, footer, tone = 'brand' }) {
  const accent = tone === 'admin' ? 'border-t-govt-900' : 'border-t-brand-700';

  return (
    <div className="k-container py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className={`rounded-lg border border-slate-200 border-t-4 bg-white shadow-sm ${accent}`}>
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          </div>
          <div className="px-5 py-6 sm:px-6">{children}</div>
        </div>
        {footer && <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>}
      </div>
    </div>
  );
}
