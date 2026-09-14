import Button from './Button.jsx';

export default function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
  retryLabel = 'Try again',
}) {
  const message =
    typeof error === 'string'
      ? error
      : (error?.message ?? 'We could not load this information. Please try again.');

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-300 bg-red-50 px-4 py-6 text-center sm:px-6"
    >
      <span aria-hidden="true" className="text-3xl">
        ⚠️
      </span>
      <h3 className="mt-2 text-base font-semibold text-red-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-red-800">{message}</p>
      {error?.status === 0 && (
        <p className="mt-1 text-xs text-red-700">
          The application could not reach the server.
        </p>
      )}
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
