import { NextRequest, NextResponse } from "next/server";
import { generateProfile, improveText, extractFromCV } from "@/lib/ia/factory";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { experience, skills, targetJob, text, file } = body;

    if (experience && skills) {
      const profile = await generateProfile(experience, skills, targetJob);
      return NextResponse.json({ profile });
    }

    if (text) {
      const improved = await improveText(text);
      return NextResponse.json({ improved });
    }

    if (file) {
      const extracted = await extractFromCV(file);
      return NextResponse.json({ extracted });
    }

    return NextResponse.json(
      { error: "Parámetros inválidos" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("IA error:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar con IA" },
      { status: 500 }
    );
  }
}
