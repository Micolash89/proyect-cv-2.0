import { NextRequest } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { getUserById } from "@/lib/db/models/user";
import { getCurrentAdmin } from "@/lib/auth/jwt";
import CVTemplate from "@/components/cv/templates/CVTemplate";

function isInternalRequest(request: NextRequest): boolean {
  const referer = request.headers.get("referer") || "";
  const host = request.headers.get("host") || "";
  
  return referer.includes(host) || referer.includes("localhost");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isInternal = isInternalRequest(request);
  
  if (!isInternal) {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return new Response("No autorizado", { status: 401 });
    }
  }

  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    return new Response("Usuario no encontrado", { status: 404 });
  }

  const stream = await renderToStream(
    <CVTemplate user={user} />
  );

  const contentDisposition = isInternal 
    ? `inline; filename="CV-${user.fullName.replace(/\s+/g, "-")}.pdf"`
    : `attachment; filename="CV-${user.fullName.replace(/\s+/g, "-")}.pdf"`;

  return new Response(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition,
    },
  });
}
