import { Link } from 'react-router-dom';

const VARIANTS = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 border border-transparent',
  secondary: 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-300',
  danger: 'bg-red-700 text-white hover:bg-red-800 border border-transparent',
  subtle: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-transparent',
  ghost: 'bg-transparent text-brand-800 hover:bg-brand-50 border border-transparent',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm sm:text-base',
  lg: 'px-5 py-3 text-base',
};

function classes({ variant, size, block, disabled }) {
  return [
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold',
    'transition-colors duration-150 focus:outline-none',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    block ? 'w-full' : '',
    disabled ? 'cursor-not-allowed opacity-60' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  type = 'button',
  to,
  href,
  loading = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;
  const classNames = `${classes({ variant, size, block, disabled: isDisabled })} ${className}`;

  const content = (
    <>
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </>
  );

  if (to && !isDisabled) {
    return (
      <Link to={to} className={classNames} {...rest}>
        {content}
      </Link>
    );
  }

  if (href && !isDisabled) {
    return (
      <a href={href} className={classNames} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classNames} disabled={isDisabled} {...rest}>
      {content}
    </button>
  );
}
