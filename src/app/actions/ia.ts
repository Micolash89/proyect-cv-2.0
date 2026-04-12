"use server";

import { AIProvider } from "@/lib/constants/AIconst";
import { getSettings } from "@/lib/db/models/settings";
import { improveText, generateProfile, extractFromCV, extractFromText } from "@/lib/ia/factory";
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
    const model = genAI.getGenerativeModel({ model: AIProvider.GEMINI });

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
Eres un asistente experto en extraer información de currículums vitae. 
Analiza este documento y extrae los datos en formato JSON.

El JSON debe tener esta estructura exacta:
{
  "fullName": "nombre completo",
  "email": "correo electrónico o string vacío",
  "phone": "teléfono o string vacío", 
  "location": "ubicación o string vacío",
  "summary": "perfil profesional o string vacío",
  "experience": [
    {
      "id": "id único generado",
      "company": "empresa",
      "position": "puesto",
      "startDate": "fecha inicio (YYYY-MM-DD)",
      "endDate": "fecha fin (YYYY-MM-DD) o string vacío si es actual",
      "current": true/false,
      "description": "descripción de funciones"
    }
  ],
  "education": [
    {
      "id": "id único generado",
      "institution": "institución",
      "degree": "título",
      "field": "campo de estudio o string vacío",
      "startDate": "fecha inicio",
      "endDate": "fecha fin o string vacío"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "languages": [{"id": "id único generado", "language": "idioma", "level": "nivel"}],
  "licencia": "tipo de licencia o string vacío",
  "movilidad": true/false,
  "incorporacionInmediata": true/false,
  "office": true/false,
  "disponibilidad": "fullTime" | "partTime" | "",
  "certifications": [
    {
      "id": "id único generado",
      "title": "título del curso/certificación",
      "institution": "institución o string vacío",
      "startMonth": "mes de inicio en minúscula en español o string vacío",
      "startYear": "año de inicio (YYYY) o string vacío"
    }
  ]
}

Usa timestamps únicos para cada id (Date.now() + random).

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
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        return { success: true, extracted };
      } catch (parseError) {
        // Intentar limpiar el JSON si el parsing falla
        const cleanedJson = cleanJSONResponse(text);
        if (cleanedJson) {
          try {
            const extracted = JSON.parse(cleanedJson);
            return { success: true, extracted };
          } catch (e) {
            console.error("Error parsing cleaned JSON:", e);
          }
        }
      }
    }

    throw new Error("No se pudo extraer información");
  } catch (error: any) {
    console.error("Error extracting CV:", error);
    return { success: false, error: error.message || "Error al procesar" };
  }
}

function cleanJSONResponse(text: string): string | null {
  try {
    // Buscar el bloque JSON más completo
    const jsonBlockMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonBlockMatch) return null;
    
    let jsonStr = jsonBlockMatch[0];
    
    // Eliminar caracteres inválidos al inicio y final
    jsonStr = jsonStr.trim();
    
    // Eliminar texto antes del primer { y después del último }
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) return null;
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    
    // Reemplazar comillas smart por comillas normales
    jsonStr = jsonStr.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
    
    // Reemplazar null por strings vacíos en campos de texto
    jsonStr = jsonStr.replace(/"(\w+)": null,/g, '"$1": "",');
    jsonStr = jsonStr.replace(/"(\w+)": null}/g, '"$1": ""}');
    jsonStr = jsonStr.replace(/"(\w+)": null/g, '"$1": ""');
    
    // Eliminar trailing commas
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    
    return jsonStr;
  } catch {
    return null;
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

export async function extractFromTextAction(text: string) {
  try {
    if (!text || text.trim().length < 10) {
      return { success: false, error: "El texto debe tener al menos 10 caracteres" };
    }

    const settings = await getSettings();
    const apiKey = settings.geminiApiKey;

    if (!apiKey) {
      throw new Error("API key de Gemini no configurada");
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: AIProvider.GEMINI });

    const prompt = `
  Eres un asistente experto en extraer información de currículums vitae.
  Analiza el siguiente texto y extrae datos en JSON aunque el texto sea desordenado, informal o incompleto.

  Reglas de interpretación obligatorias:
  - El texto NO tiene formato fijo: puede tener frases sueltas, errores de redacción, orden mezclado o campos sin etiqueta.
  - Debes inferir experiencia laboral aunque esté escrita en una sola línea.
  - En experiencia identifica: empresa, puesto, fechas y tareas aunque estén mezcladas.
  - Si una experiencia contiene tareas separadas por comas, unifícalas en description en una frase coherente.
  - Si hay rango de fechas invertido por error (ej: desde 2026 hasta 2025), corrígelo intercambiando inicio/fin.
  - Si solo hay mes y año (ej: febrero-2026 o 04/2025), usa día 01 y formatea como YYYY-MM-DD.
  - Si dice "actual", "actualidad" o "presente", endDate debe ser string vacío y current=true.
  - Si falta algún dato puntual, no descartes el registro: completa faltantes con string vacío.
  - Devuelve siempre estructura completa aunque algunos campos queden vacíos.

El JSON debe tener esta estructura exacta:
{
  "fullName": "nombre completo",
  "email": "correo electrónico o string vacío",
  "phone": "teléfono o string vacío", 
  "location": "ubicación o string vacío",
  "summary": "perfil profesional o string vacío",
  "experience": [
    {
      "id": "id único generado",
      "company": "empresa",
      "position": "puesto",
      "startDate": "fecha inicio (YYYY-MM-DD) o string vacío",
      "endDate": "fecha fin (YYYY-MM-DD) o string vacío si es actual",
      "current": true/false,
      "description": "descripción de funciones"
    }
  ],
  "education": [
    {
      "id": "id único generado",
      "institution": "institución",
      "degree": "título",
      "field": "campo de estudio o string vacío",
      "startDate": "fecha inicio o string vacío",
      "endDate": "fecha fin o string vacío"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "languages": [{"id": "id único generado", "language": "idioma", "level": "nivel"}],
  "licencia": "tipo de licencia o string vacío",
  "movilidad": true/false,
  "incorporacionInmediata": true/false,
  "office": true/false,
  "disponibilidad": "fullTime" | "partTime" | "",
  "certifications": [
    {
      "id": "id único generado",
      "title": "título del curso/certificación",
      "institution": "institución o string vacío",
      "startMonth": "mes de inicio en minúscula en español o string vacío",
      "startYear": "año de inicio (YYYY) o string vacío"
    }
  ]
}

Usa timestamps únicos para cada id (Date.now() + random).

Ejemplo de entrada libre y cómo interpretarla:
"experiencia: empresa de bolsas aperin, ayudante de extrusor desde febrero-2026 hasta abril-2025. limpieza, organización, orden, mezcla de material"
Debes generar una experiencia con:
- company: "Empresa de Bolsas Aperin"
- position: "Ayudante de extrusor"
- startDate/endDate corregidas y normalizadas (YYYY-MM-DD)
- description con las tareas detectadas.

Texto del CV:
${text}

Responde SOLO con el JSON válido, sin texto adicional.
`;

    const result = await model.generateContent(prompt);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        return { success: true, extracted };
      } catch (parseError) {
        const cleanedJson = cleanJSONResponse(responseText);
        if (cleanedJson) {
          try {
            const extracted = JSON.parse(cleanedJson);
            return { success: true, extracted };
          } catch (e) {
            console.error("Error parsing cleaned JSON:", e);
          }
        }
      }
    }

    throw new Error("No se pudo extraer información del texto");
  } catch (error: any) {
    console.error("Error extracting from text:", error);
    return { success: false, error: error.message || "Error al procesar texto" };
  }
}
