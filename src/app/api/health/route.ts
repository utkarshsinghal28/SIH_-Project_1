/**
 * Runtime health probe used by the sandbox preview host.
 *
 * Part 1 of the Krishi Procurement Platform is frontend-only: there is no
 * application database and no application API. The real REST API arrives in
 * Part 2 (Node.js + Express + MongoDB Atlas), served from its own process.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    service: "krishi-procurement-platform",
    stage: "part-1-frontend-foundation",
    api: "not-implemented-until-part-2",
    timestamp: new Date().toISOString(),
  });
}
