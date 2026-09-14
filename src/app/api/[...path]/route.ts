/**
 * Reverse proxy: forwards /api/* from the preview host to the Express API
 * (server/) so the browser talks to a single origin.
 *
 * This exists only because the sandbox preview serves everything from one port.
 * In normal local development the Vite dev server proxies /api instead
 * (see client/vite.config.js), and in production you would put nginx or a
 * platform router in front of the two processes.
 */
const API_TARGET = process.env.API_PROXY_TARGET || "http://127.0.0.1:5000";

export const dynamic = "force-dynamic";

async function proxy(request: Request, path: string[]) {
  const incoming = new URL(request.url);
  const target = `${API_TARGET}/api/${path.join("/")}${incoming.search}`;

  const headers = new Headers();
  const forward = ["authorization", "content-type", "accept"];
  forward.forEach((name) => {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  });

  const hasBody = !["GET", "HEAD"].includes(request.method);

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      redirect: "manual",
    });

    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return Response.json(
      {
        success: false,
        message:
          "The API server is not reachable. Start it with: cd server && npm run dev",
      },
      { status: 503 },
    );
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
export async function POST(request: Request, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
export async function PUT(request: Request, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
export async function PATCH(request: Request, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
export async function DELETE(request: Request, ctx: Ctx) {
  return proxy(request, (await ctx.params).path);
}
