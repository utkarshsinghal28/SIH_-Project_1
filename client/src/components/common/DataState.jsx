import EmptyState from '../ui/EmptyState.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';

/**
 * Guarantees that every data-driven screen renders one of:
 * loading -> error -> empty -> content. No blank screens anywhere.
 */
export default function DataState({
  loading,
  error,
  isEmpty,
  onRetry,
  loadingLabel = 'Loading…',
  emptyTitle,
  emptyMessage,
  emptyIcon,
  emptyAction,
  errorTitle,
  children,
}) {
  if (loading) return <LoadingSpinner label={loadingLabel} />;
  if (error) return <ErrorState title={errorTitle} error={error} onRetry={onRetry} />;
  if (isEmpty)
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        icon={emptyIcon}
        action={emptyAction}
      />
    );
  return children;
}
