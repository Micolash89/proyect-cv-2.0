"use server";

import { getSettings } from "@/lib/db/models/settings";
import { improveText, generateProfile, extractFromCV } from "@/lib/ia/factory";
import type { CVFormData } from "@/types";

export async function extractCVAction(file: File) {
  try {
    const settings = await getSettings();
    const apiKey = settings.geminiApiKey;

    if (!apiKey) {
      throw new Error("API key de Gemini no configurada");
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
      return { success: true, extracted };
    }

    throw new Error("No se pudo extraer información");
  } catch (error: any) {
    console.error("Error extracting CV:", error);
    return { success: false, error: error.message || "Error al procesar" };
  }
}

export async function improveTextAction(text: string) {
  try {
    if (!text) {
      return { success: false, error: "El texto es requerido" };
    }

    const improved = await improveText(text);
    return { success: true, improved };
  } catch (error: any) {
    console.error("IA error:", error);
    return { success: false, error: error.message || "Error al mejorar texto" };
  }
}

export async function generateProfileAction(
  experience: any[],
  skills: string[],
  targetJob?: string
) {
  try {
    if (!experience || !skills) {
      return { success: false, error: "Parámetros inválidos" };
    }

    const profile = await generateProfile(experience, skills, targetJob);
    return { success: true, profile };
  } catch (error: any) {
    console.error("IA error:", error);
    return { success: false, error: error.message || "Error al generar perfil" };
  }
}

export async function processIAAction(body: {
  experience?: any[];
  skills?: string[];
  targetJob?: string;
  text?: string;
  file?: File;
}) {
  try {
    const { experience, skills, targetJob, text, file } = body;

    if (experience && skills) {
      const profile = await generateProfile(experience, skills, targetJob);
      return { success: true, profile };
    }

    if (text) {
      const improved = await improveText(text);
      return { success: true, improved };
    }

    if (file) {
      const extracted = await extractFromCV(file);
      return { success: true, extracted };
    }

    return { success: false, error: "Parámetros inválidos" };
  } catch (error: any) {
    console.error("IA error:", error);
    return { success: false, error: error.message || "Error al procesar con IA" };
  }
}
