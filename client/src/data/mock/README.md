# Mock data (Part 1 only)

Everything in `src/data/mock/` exists **only** so the frontend can be developed
and demonstrated before the backend is written.

- It is **not** a server. There is no HTTP server, no database, no persistence
  beyond the browser's `localStorage`.
- It is **not** imported by any component or page. Only `src/services/*.js`
  touch it, and only when `VITE_USE_MOCK_API` is enabled.
- Every function here mirrors the response shape of the REST endpoint that
  Part 2 will implement, so switching over is a configuration change.

## How to remove it in Part 2

1. Set `VITE_USE_MOCK_API=false` in `client/.env`.
2. Point `VITE_API_BASE_URL` at the Express API.
3. Delete this folder and the `if (isMockMode())` guards in `src/services/`.

Nothing else in the application needs to change.
