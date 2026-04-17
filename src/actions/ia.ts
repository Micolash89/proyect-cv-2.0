"use server";

import { AIProvider } from "@/lib/constants/AIconst";
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
  const model = genAI.getGenerativeModel({ model: AIProvider.GEMINI });

  const experienceText = experience
    .map((e) => `${e.position} en ${e.company}: ${e.description}`)
    .join("\n");

  const hasExperience = experience.length > 0 && experience.some(e => e.description?.trim());

  const prompt = `
Eres un experto en CVs ATS-optimizados siguiendo estándares Harvard University.
Genera un perfil profesional que pase filtros de sistemas ATS y destaque fortalezas.

${targetJob ? `Puesto aspirado: ${targetJob}` : ""}

${hasExperience ? `Experiencia laboral:\n${experienceText}` : "Sin experiencia laboral registrada"}

Skills clave: ${skills.length > 0 ? skills.join(", ") : "Sin skills registrados"}

ESTÁNDARES HARVARD - DIRECTRICES OBLIGATORIAS:
✓ ESPECÍFICO, no general - frases concretas, no vagas
✓ ACTIVO, no pasivo - comienza con verbos de acción fuertes
✓ EXPRESAR, no impresionar - profesional y claro
✓ ARTICULADO - preciso y profesional
✓ BASADO EN HECHOS - información verificable, sin métricas inventadas
✓ PARA ESCANEADORES RÁPIDOS - estructura clara, palabras clave ATS

VERBOS DE LIDERAZGO Y COMUNICACIÓN PARA PERFILES:
Achieved, Coordinated, Directed, Implemented, Led, Managed, Orchestrated, Spearheaded, Supervised, Articulated, Communicated, Presented, Drafted, Established

PALABRAS CLAVE ATS (incluir naturalmente):
- Palabras relevantes al puesto ${targetJob ? `(${targetJob})` : ""}
- Términos técnicos si aplican
- Competencias blandas: Leadership, Communication, Problem-solving, Collaboration, Adaptability, Strategic thinking

ESTRUCTURA RECOMENDADA:
Máximo 4 renglones (~150-180 palabras total). Comienza con logro o responsabilidad principal. Termina con disposición/valor agregado.

Si TIENE experiencia clara:
- Resaltar 2-3 logros o responsabilidades principales
- Usar verbos Harvard como Achieved, Directed, Managed, Coordinated
- Resultado/impacto verificable

Si NO tiene experiencia o muy reciente:
- Perfil orientado a "Profesional en búsqueda de primera oportunidad"
- Énfasis en soft skills, disposición de aprendizaje, potencial
- Mentar capacidad de adaptarse y crecer en el rol

El resultado debe:
- Devolver SOLO el perfil (sin introducciones)
- Usar lenguaje profesional y articulado
- NO inventar métricas ni porcentajes
- NO usar pronombres personales
- Ser específico y orientado al rol/puesto
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
  const model = genAI.getGenerativeModel({ model: AIProvider.GEMINI });

  const experienceText = experience
    .map((e) => `${e.position} en ${e.company}`)
    .join("\n");
  
  const educationText = education
    .map((e) => `${e.degree} en ${e.institution}`)
    .join("\n");

  const hasExperience = experience.length > 0 && experience.some(e => e.position?.trim());

  const prompt = `
Eres un experto en recursos humanos especializado en CVs Harvard-estándar.
Genera una lista de EXACTAMENTE 6 skills más relevantes, priorizando soft skills según experiencia.

${targetJob ? `Puesto aspirado: ${targetJob}` : ""}

${experienceText ? `Experiencia laboral:\n${experienceText}` : "Sin experiencia laboral"}

${educationText ? `Educación:\n${educationText}` : "Sin educación registrada"}

CATEGORÍAS HARVARD DE SKILLS:

SOFT SKILLS (Priorizar si sin experiencia):
- Comunicación, Trabajo en equipo, Liderazgo, Adaptabilidad
- Resolución de problemas, Pensamiento crítico
- Gestión del tiempo, Responsabilidad, Proactividad, Empatía
- Colaboración, Negociación, Persuasión, Facilitación

HABILIDADES TÉCNICAS (Si hay experiencia clara):
- Análisis de datos, Programación, Diseño
- Marketing digital, Gestión de proyectos
- Cualquier técnica específica del puesto

INSTRUCCIONES CRÍTICAS:
- Generar EXACTAMENTE 6 skills (ni más, ni menos)
- Si HAY experiencia clara (>1 año): 3-4 técnicos + 2-3 soft skills balanceados
- Si NO hay experiencia o muy reciente: 5-6 SOFT SKILLS prioritarios
- NO inventar skills ficticios
- Usar lenguaje específico, no genérico
- Responde SOLO con JSON array, sin explicaciones.
- Formato exacto: ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"]
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(0, 6) : ["Comunicación", "Trabajo en equipo", "Liderazgo", "Adaptabilidad", "Proactividad", "Pensamiento crítico"];
    }
  } catch {
    return ["Comunicación", "Trabajo en equipo", "Liderazgo", "Adaptabilidad", "Proactividad", "Pensamiento crítico"];
  }
  
  return ["Comunicación", "Trabajo en equipo", "Liderazgo", "Adaptabilidad", "Proactividad", "Pensamiento crítico"];
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
  const model = genAI.getGenerativeModel({ model: AIProvider.GEMINI });

  const prompt = `
Mejora la siguiente descripción de funciones laborales para un CV profesional.
Aplica los estándares de currículum recomendados por Harvard University.

Descripción actual:
${text}

DIRECTRICES HARVARD (OBLIGATORIAS):
- ESPECÍFICO, no general - evita frases vagas como "responsable de"
- ACTIVO, no pasivo - comienza con verbos de acción fuertes
- EXPRESAR, no impresionar - claro y profesional, sin flowery language
- ARTICULADO, no redundante - preciso y directo
- BASADO EN HECHOS - información verificable, sin métricas inventadas
- PARA ESCANEADORES RÁPIDOS - párrafo conciso, sin saltos de línea

VERBOS DE ACCIÓN RECOMENDADOS POR HARVARD:
Liderazgo: Coordinated, Implemented, Achieved, Spearheaded, Directed, Led, Organized, Managed, Orchestrated, Supervised
Comunicación: Articulated, Communicated, Presented, Explained, Drafted, Wrote, Negotiated, Persuaded, Liaised
Organización: Structured, Planned, Executed, Systematized, Consolidated, Arranged
Técnico: Developed, Designed, Engineered, Optimized, Programmed, Built, Assembled, Devised
Investigación: Analyzed, Investigated, Examined, Evaluated, Determined, Identified, Collected, Researched
Cuantitativo: Calculated, Managed, Optimized, Improved, Increased, Reduced, Streamlined, Maximized, Minimized

ESTRUCTURA RECOMENDADA:
[Verbo fuerte] [Objeto/Responsabilidad] [Contexto/Coordinaciones], [Resultado/Impacto verificable]

El resultado debe:
- Ser UN SOLO PÁRRAFO SIN SALTOS DE LÍNEA (~200-250 caracteres máximo)
- Usar verbos Harvard del catálogo anterior
- NO inventar métricas ni porcentajes (ej: "incrementó 25%")
- NO usar pronombres personales (yo, mi, mío)
- Mantener lenguaje profesional, articulado y específico
- Devuelve SOLO el texto mejorado, sin comillas ni introducciones.
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
      const model = genAI.getGenerativeModel({ model: AIProvider.GEMINI });
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
