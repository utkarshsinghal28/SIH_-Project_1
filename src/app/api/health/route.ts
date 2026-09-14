/**
 * Liveness probe for the preview web host.
 *
 * The application's own API health endpoint is `GET /api/health` on the Express
 * server (server/src/routes/index.js). In the sandbox preview both run behind
 * this one origin, so this handler reports the web host status and, for
 * convenience, whether the API process behind it is reachable.
 */
const API_TARGET = process.env.API_PROXY_TARGET || "http://127.0.0.1:5000";

export const dynamic = "force-dynamic";

export async function GET() {
  let api: Record<string, unknown> = { reachable: false };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(`${API_TARGET}/api/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    const payload = await response.json();
    api = {
      reachable: true,
      status: response.status,
      database: payload?.data?.database ?? "unknown",
    };
  } catch {
    api = { reachable: false, hint: "Start the API with: cd server && npm run dev" };
  }

  return Response.json({
    ok: true,
    service: "krishi-procurement-platform",
    stage: "part-2-backend-complete",
    web: "up",
    api,
    timestamp: new Date().toISOString(),
  });
}
