import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * SPA fallback for the sandbox preview host.
 *
 * The application itself is a React + Vite single page app (see `client/`).
 * Its production build is emitted to `public/`, and every non-API request is
 * answered with `public/index.html` so React Router can handle client routing
 * (deep links such as /farmer/dashboard keep working on a hard refresh).
 */
export const dynamic = "force-dynamic";

const FALLBACK_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Client build missing</title></head>
<body style="font-family:system-ui;padding:2rem;max-width:40rem;margin:auto">
<h1>Client bundle not built</h1>
<p>Run <code>npm run build:client</code> to emit the React + Vite SPA into <code>public/</code>.</p>
</body></html>`;

export async function GET() {
  try {
    const html = await readFile(path.join(process.cwd(), "public", "index.html"), "utf8");
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response(FALLBACK_HTML, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
}
