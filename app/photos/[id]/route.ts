import { db } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const row = db.prepare("SELECT contenu FROM photos WHERE id=?").get(id) as
    { contenu: Buffer } | undefined;
  if (!row) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(row.contenu), {
    headers: {
      "Content-Type": "image/webp",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
