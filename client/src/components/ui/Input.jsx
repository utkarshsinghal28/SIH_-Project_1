import { useId } from 'react';

export default function Input({
  label,
  name,
  error,
  hint,
  required = false,
  optional = false,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const id = rest.id || `${name || 'field'}-${generatedId}`;
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-800">
          {label}
          {required && <span className="ml-1 text-red-700" aria-hidden="true">*</span>}
          {optional && <span className="ml-1 font-normal text-slate-500">(optional)</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        className={`block w-full rounded-md border px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-0 disabled:bg-slate-100 ${
            error
              ? 'border-red-600 bg-red-50'
              : 'border-slate-300 bg-white focus:border-brand-600'
          }`}
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
