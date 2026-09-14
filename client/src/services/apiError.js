/**
 * A single error shape for the whole application.
 *
 * Both the Axios layer and the Part 1 mock layer produce this shape, so pages
 * never need to know where an error came from.
 */
export function createApiError(message, status = 400, details = null) {
  const error = new Error(message);
  error.name = 'ApiError';
  error.status = status;
  error.details = details;
  return error;
}

/** Normalises anything thrown by Axios into an ApiError. */
export function normaliseAxiosError(error) {
  if (error?.name === 'ApiError') return error;

  if (error?.response) {
    const { status, data } = error.response;
    const message =
      data?.message ||
      data?.error ||
      (status === 401
        ? 'Your session has expired. Please sign in again.'
        : 'The server could not complete this request.');
    return createApiError(message, status, data?.errors ?? null);
  }

  if (error?.request) {
    return createApiError(
      'Unable to reach the server. Check your internet connection and try again.',
      0,
    );
  }

  return createApiError(error?.message || 'Something went wrong.', 500);
}
