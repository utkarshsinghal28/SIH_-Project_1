import { useId } from 'react';

/**
 * @param {Array<{value: string, label: string}>|Array<string>} options
 */
export default function Select({
  label,
  name,
  options = [],
  placeholder,
  error,
  hint,
  required = false,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const id = rest.id || `${name || 'select'}-${generatedId}`;
  const normalised = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-800">
          {label}
          {required && <span className="ml-1 text-red-700" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={id}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`block w-full rounded-md border px-3 py-2.5 text-base text-slate-900
          focus:outline-none disabled:bg-slate-100 ${
            error ? 'border-red-600 bg-red-50' : 'border-slate-300 bg-white focus:border-brand-600'
          }`}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {normalised.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
