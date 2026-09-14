const TONES = {
  info: { wrapper: 'border-sky-300 bg-sky-50 text-sky-900', icon: 'ℹ️' },
  success: { wrapper: 'border-brand-300 bg-brand-50 text-brand-900', icon: '✅' },
  warning: { wrapper: 'border-amber-300 bg-amber-50 text-amber-900', icon: '⚠️' },
  error: { wrapper: 'border-red-300 bg-red-50 text-red-900', icon: '⛔' },
};

export default function Alert({ tone = 'info', title, children, className = '' }) {
  const { wrapper, icon } = TONES[tone] ?? TONES.info;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-md border px-4 py-3 text-sm ${wrapper} ${className}`}
    >
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-1' : ''}>{children}</div>}
      </div>
    </div>
  );
}
