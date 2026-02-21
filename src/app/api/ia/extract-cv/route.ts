import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/db/models/settings";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    }

    const settings = await getSettings();
    const apiKey = settings.geminiApiKey;

    if (!apiKey) {
      return NextResponse.json({ error: "API key de Gemini no configurada" }, { status: 500 });
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
Eres un asistente experto en extraer información de currículums vitae. 
Analiza este documento y extrae los datos en formato JSON.

El JSON debe tener esta estructura exacta:
{
  "fullName": "nombre completo",
  "email": "correo electrónico o null",
  "phone": "teléfono o null", 
  "location": "ubicación o null",
  "summary": "perfil profesional o null",
  "experience": [
    {
      "company": "empresa",
      "position": "puesto",
      "startDate": "fecha inicio (YYYY-MM-DD)",
      "endDate": "fecha fin (YYYY-MM-DD) o null si es actual",
      "current": true/false,
      "description": "descripción de funciones"
    }
  ],
  "education": [
    {
      "institution": "institución",
      "degree": "título",
      "field": "campo de estudio o null",
      "startDate": "fecha inicio",
      "endDate": "fecha fin"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "languages": [{"language": "idioma", "level": "nivel"}]
}

Responde SOLO con el JSON válido, sin texto adicional.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ extracted });
    }

    return NextResponse.json({ error: "No se pudo extraer información" }, { status: 400 });
  } catch (error: any) {
    console.error("Error extracting CV:", error);
    return NextResponse.json({ error: error.message || "Error al procesar" }, { status: 500 });
  }
}
