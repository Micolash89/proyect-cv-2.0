import { NextRequest } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { getUserById } from "@/lib/db/models/user";
import { getCurrentAdmin } from "@/lib/auth/jwt";
import { CVTemplate } from "@/components/cv/templates/CVTemplate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return new Response("No autorizado", { status: 401 });
    }

    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return new Response("Usuario no encontrado", { status: 404 });
    }

    const stream = await renderToStream(
      <CVTemplate user={user} />
    );

    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="CV-${user.fullName.replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response("Error al generar PDF", { status: 500 });
  }
}
