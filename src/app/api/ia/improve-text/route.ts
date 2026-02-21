import { NextRequest, NextResponse } from "next/server";
import { improveText } from "@/lib/ia/factory";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "El texto es requerido" },
        { status: 400 }
      );
    }

    const improved = await improveText(text);
    return NextResponse.json({ improved });
  } catch (error: any) {
    console.error("IA error:", error);
    return NextResponse.json(
      { error: error.message || "Error al mejorar texto" },
      { status: 500 }
    );
  }
}
