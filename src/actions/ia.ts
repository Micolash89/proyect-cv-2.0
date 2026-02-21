"use server";

import { getSettings } from "@/lib/db/models/settings";

export async function generateProfile(
  experience: any[],
  skills: string[],
  targetJob?: string
): Promise<string> {
  "use server";
  
  const settings = await getSettings();
  const apiKey = settings.geminiApiKey;
  
  if (!apiKey) {
    throw new Error("Gemini API key no configurada");
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const experienceText = experience
    .map((e) => `${e.position} en ${e.company}: ${e.description}`)
    .join("\n");

  const prompt = `
Eres un experto en currículums y perfiles profesionales. Basándote en la siguiente experiencia laboral y skills, 
genera un perfil profesional atractivo y conciso para un CV.

${targetJob ? `Aspiración profesional: ${targetJob}` : ""}

Experiencia laboral:
${experienceText}

Skills: ${skills.join(", ")}

El perfil debe:
- Ser de 3-4 oraciones
- Destacar fortalezas y logros
- Ser profesional pero atractivo
- Estar en español
- No incluir datos personales adicionales
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateSkills(
  experience: any[],
  education: any[],
  targetJob?: string
): Promise<string[]> {
  "use server";
  
  const settings = await getSettings();
  const apiKey = settings.geminiApiKey;
  
  if (!apiKey) {
    throw new Error("Gemini API key no configurada");
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const experienceText = experience
    .map((e) => `${e.position} en ${e.company}`)
    .join("\n");
  
  const educationText = education
    .map((e) => `${e.degree} en ${e.institution}`)
    .join("\n");

  const prompt = `
Eres un experto en recursos humanos. Basándote en la siguiente experiencia laboral y educación,
genera una lista de 5-6 skills genéricos y relevantes para un CV.

${targetJob ? `El puesto aspirado es: ${targetJob}` : ""}

Experiencia laboral:
${experienceText}

Educación:
${educationText}

Responde SOLO con un array JSON de strings, sin texto adicional.
Ejemplo: ["Gestión de proyectos", "Trabajo en equipo", "Comunicación", "Análisis de datos", "Liderazgo", "Planificación"]
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    return ["Comunicación", "Trabajo en equipo", "Responsabilidad", "Proactividad", "Gestión del tiempo"];
  }
  
  return ["Comunicación", "Trabajo en equipo", "Responsabilidad", "Proactividad", "Gestión del tiempo"];
}

export async function improveText(text: string): Promise<string> {
  "use server";
  
  const settings = await getSettings();
  const apiKey = settings.geminiApiKey;
  
  if (!apiKey) {
    throw new Error("Gemini API key no configurada");
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Mejora la siguiente descripción de funciones laborales para un CV. 
Hazla más profesional, impactante y orientada a logros. 
Mantén el mismo significado pero usa mejor vocabulario y estructura.

Descripción actual:
${text}

El resultado debe:
- Estar en español
- Ser más conciso pero con más impacto
- Usar verbos de acción
- Destacar logros y responsabilidades
- Mantener 2-3 oraciones máximo
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function testIAConnection(provider: "gemini" | "claude"): Promise<boolean> {
  "use server";
  
  const settings = await getSettings();
  const apiKey = provider === "gemini" ? settings.geminiApiKey : settings.claudeApiKey;
  
  if (!apiKey) return false;
  
  try {
    if (provider === "gemini") {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      await model.generateContent("Hello");
      return true;
    } else {
      const { Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey });
      await client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 10,
        messages: [{ role: "user", content: "Hi" }]
      });
      return true;
    }
  } catch {
    return false;
  }
}
