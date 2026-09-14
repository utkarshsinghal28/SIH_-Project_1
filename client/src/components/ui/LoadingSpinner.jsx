export default function LoadingSpinner({ label = 'Loading…', size = 'md', inline = false }) {
  const dimensions = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size] ?? 'h-8 w-8';

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        inline
          ? 'inline-flex items-center gap-2'
          : 'flex flex-col items-center justify-center gap-3 py-10 text-center'
      }
    >
      <span
        aria-hidden="true"
        className={`${dimensions} animate-spin rounded-full border-4 border-slate-300 border-t-brand-700`}
      />
      <span className={inline ? 'text-sm text-slate-600' : 'text-sm font-medium text-slate-600'}>
        {label}
      </span>
    </div>
  );
}
