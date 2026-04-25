import type { IAProvider, Experience, Education, CVFormData } from "@/types";
import { AIProvider } from "../constants/AIconst";

export type { IAProvider };

export interface IAConfig {
  apiKey: string;
}

const IMPROVE_TEXT_PROMPT = `
Mejora la siguiente descripción de funciones laborales para un CV profesional.
Aplica los estándares de currículum recomendados por Harvard University.

Descripción actual:
{description}

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
Organización: Structured, Planned, Executed, Systematized, Consolidated, Consolidated, Arranged
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

function buildGenerateProfilePrompt(
  experienceText: string,
  skills: string[],
  targetJob?: string,
  hasExperience?: boolean,
): string {
  return `
Eres un experto en CVs ATS-optimizados siguiendo estándares Harvard University.
Genera un perfil profesional breve, natural y humano, como una introducción de la persona, no como un listado de tareas ni como una oferta laboral.
Usa una voz cercana y profesional; no fuerces la tercera persona impersonal.

${targetJob ? `Puesto aspirado: ${targetJob}` : ""}

${hasExperience ? `Experiencia laboral:\n${experienceText}` : "Sin experiencia laboral registrada"}

Skills clave: ${skills.length > 0 ? skills.join(", ") : "Sin skills registrados"}

ESTÁNDARES HARVARD - DIRECTRICES OBLIGATORIAS:
✓ ESPECÍFICO, no general - frases concretas, no vagas
✓ ACTIVO, no pasivo - lenguaje profesional y directo
✓ NATURAL, no robótico - debe sonar como una persona presentándose
✓ ARTICULADO - preciso, claro y fluido
✓ BASADO EN HECHOS - información verificable, sin métricas inventadas
✓ PARA ESCANEADORES RÁPIDOS - estructura limpia y fácil de leer

VERBOS DE LIDERAZGO Y COMUNICACIÓN PARA PERFILES:
Achieved, Coordinated, Directed, Implemented, Led, Managed, Orchestrated, Spearheaded, Supervised, Articulated, Communicated, Presented, Drafted, Established

PALABRAS CLAVE ATS (incluir naturalmente):
- Palabras relevantes al puesto ${targetJob ? `(${targetJob})` : ""}
- Términos técnicos si aplican
- Competencias blandas: Leadership, Communication, Problem-solving, Collaboration, Adaptability, Strategic thinking

FORMATO OBLIGATORIO - UN SOLO PÁRRAFO:
⚠ El resultado DEBE ser UN ÚNICO PÁRRAFO, sin saltos de línea ni subtítulos.
⚠ Extensión aproximada: 5 renglones (~250-350 caracteres).
⚠ Sin viñetas, bullets, numeraciones ni secciones.
⚠ Flujo contínuo y natural, como una presentación profesional.

ENFOQUE DE REDACCIÓN - IDENTIDAD PROFESIONAL, NO HISTORIAL:
- Escribir como una presentación profesional, no como una descripción de funciones
- NO repetir detalles concretos de experiencia (empresas, fechas, tareas específicas)
- Evitar frases impersonales o de tipo oferta: "Se ofrece", "Gestión administrativa", "Responsable de", "Se ha implementado", "Encargado de"
- No enumerar puestos anteriores ni convertir el perfil en un resumen de roles
- Empezar con la identidad profesional, área o especialidad de la persona
- Integrar competencias y fortalezas generales de forma coherente

Si TIENE experiencia clara:
- Abrir con su perfil general: "Profesional de...", "Perfil orientado a...", "Especialista en..."
- Mencionar competencias y fortalezas de forma general e integrada, SIN enumerar empresas, fechas o tareas específicas
- Usar verbos Harvard como Achieved, Directed, Managed, Coordinated cuando aporten naturalidad
- Priorizar identidad profesional sobre listado de responsabilidades

Si NO tiene experiencia o muy reciente:
- Perfil orientado a "Profesional en búsqueda de primera oportunidad"
- Énfasis en soft skills, disposición de aprendizaje, potencial y proyección
- Mantener un tono general, elegante y natural, sin exagerar responsabilidades

El resultado debe:
- Devolver SOLO el perfil (sin introducciones)
- Ser UN ÚNICO PÁRRAFO sin saltos de línea
- Usar lenguaje profesional y articulado
- NO inventar métricas ni porcentajes
- NO repetir empresas, fechas ni tareas ya detalladas en la sección de experiencia
- Evitar la tercera persona impersonal; si una formulación directa o en primera persona aporta naturalidad, prioriza esa opción sin perder tono profesional
- Enfocarse en competencias generales, identidad profesional y valor general aportado
`;
}

function buildImproveTextPrompt(text: string): string {
  return IMPROVE_TEXT_PROMPT.replace("{description}", text);
}

export function createIAProvider(type: "gemini" | "claude" | "groq", config: IAConfig): IAProvider {
  if (type === "gemini") {
    return new GeminiProvider(config.apiKey);
  }
  if (type === "groq") {
    return new GroqProvider(config.apiKey);
  }
  return new ClaudeProvider(config.apiKey);
}

class GeminiProvider implements IAProvider {
  name = "Gemini";
  private client: any;

  constructor(private apiKey: string) {
    this.initClient();
  }

  private initClient() {
    if (this.apiKey) {
      import("@google/generative-ai").then(({ GoogleGenerativeAI }) => {
        this.client = new GoogleGenerativeAI(this.apiKey).getGenerativeModel({
          model: AIProvider.GEMINI,
        });
      });
    }
  }

  async generateProfile(
    experience: Experience[],
    skills: string[],
    targetJob?: string
  ): Promise<string> {
    if (!this.client) throw new Error("Gemini not configured");

    const experienceText = experience
      .map((e) => `${e.position} en ${e.company}: ${e.description}`)
      .join("\n");

    const hasExperience = experience.length > 0 && experience.some(e => e.description?.trim());

    const prompt = buildGenerateProfilePrompt(experienceText, skills, targetJob, hasExperience);

    const result = await this.client.generateContent(prompt);
    return result.response.text();
  }

  async improveText(text: string): Promise<string> {
    if (!this.client) throw new Error("Gemini not configured");

    const prompt = buildImproveTextPrompt(text);

    const result = await this.client.generateContent(prompt);
    return result.response.text();
  }

  async extractFromCV(file: File): Promise<Partial<CVFormData>> {
    if (!this.client) throw new Error("Gemini not configured");

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
Eres un asistente que extrae información de CVs. Analiza esta imagen/documento y extrae 
los siguientes datos en formato JSON:

{
  "fullName": "nombre completo",
  "email": "correo electrónico",
  "phone": "teléfono",
  "location": "ubicación",
  "summary": "perfil profesional",
  "experience": [
    {
      "company": "empresa",
      "position": "puesto",
      "startDate": "fecha inicio",
      "endDate": "fecha fin o 'actual'",
      "current": true/false,
      "description": "descripción de funciones"
    }
  ],
  "education": [
    {
      "institution": "institución",
      "degree": "título",
      "field": "campo de estudio",
      "status": "complete | in_progress | incomplete",
      "startDate": "fecha inicio",
      "endDate": "fecha fin"
    }
  ],
  "skills": ["skill1", "skill2"],
  "languages": [{"language": "idioma", "level": "nivel"}]
}

Responde SOLO con el JSON, sin texto adicional.
`;

    const result = await this.client.generateContent([
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
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not extract data from CV");
  }

  async extractFromText(text: string): Promise<Partial<CVFormData>> {
    if (!this.client) throw new Error("Gemini not configured");

    const prompt = `
Eres un asistente que extrae información de currículums. Analiza el siguiente texto que contiene datos de un CV 
y extrae los siguientes datos en formato JSON:

{
  "fullName": "nombre completo",
  "email": "correo electrónico",
  "phone": "teléfono",
  "location": "ubicación",
  "summary": "perfil profesional",
  "experience": [
    {
      "company": "empresa",
      "position": "puesto",
      "startDate": "fecha inicio",
      "endDate": "fecha fin o 'actual'",
      "current": true/false,
      "description": "descripción de funciones"
    }
  ],
  "education": [
    {
      "institution": "institución",
      "degree": "título",
      "field": "campo de estudio",
      "status": "complete | in_progress | incomplete",
      "startDate": "fecha inicio",
      "endDate": "fecha fin"
    }
  ],
  "skills": ["skill1", "skill2"],
  "languages": [{"language": "idioma", "level": "nivel"}]
}

Texto del CV:
${text}

Responde SOLO con el JSON, sin texto adicional.
`;

    const result = await this.client.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not extract data from text");
  }

  async generateSkills(experience: Experience[], education: Education[], targetJob?: string): Promise<string[]> {
    const experienceText = experience.map((e) => `${e.position} en ${e.company}`).join("\n");
    const educationText = education.map((e) => `${e.degree} en ${e.institution}`).join("\n");
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

    const result = await this.client.generateContent(prompt);
    const text = result.response.text();
    
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(0, 6) : ["Comunicación", "Trabajo en equipo", "Liderazgo", "Adaptabilidad", "Proactividad", "Pensamiento crítico"];
      }
    } catch {
      return ["Comunicación", "Trabajo en equipo", "Responsabilidad", "Adaptabilidad", "Proactividad", "Pensamiento crítico"];
    }
    
    return ["Comunicación", "Trabajo en equipo", "Responsabilidad", "Adaptabilidad", "Proactividad", "Pensamiento crítico"];
  }
}

class ClaudeProvider implements IAProvider {
  name = "Claude";
  private client: any;

  constructor(private apiKey: string) {
    this.initClient();
  }

  private initClient() {
    if (this.apiKey) {
      import("@anthropic-ai/sdk").then(({ Anthropic }) => {
        this.client = new Anthropic({ apiKey: this.apiKey });
      });
    }
  }

  async generateProfile(
    experience: Experience[],
    skills: string[],
    targetJob?: string
  ): Promise<string> {
    if (!this.client) throw new Error("Claude not configured");

    const experienceText = experience
      .map((e) => `${e.position} en ${e.company}: ${e.description}`)
      .join("\n");

    const hasExperience = experience.length > 0 && experience.some(e => e.description?.trim());

    const prompt = buildGenerateProfilePrompt(experienceText, skills, targetJob, hasExperience);

    const result = await this.client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    return result.content[0].type === "text" ? result.content[0].text : "";
  }

  async improveText(text: string): Promise<string> {
    if (!this.client) throw new Error("Claude not configured");

    const prompt = buildImproveTextPrompt(text);

    const result = await this.client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    return result.content[0].type === "text" ? result.content[0].text : "";
  }

  async extractFromCV(file: File): Promise<Partial<CVFormData>> {
    throw new Error("Claude does not support file vision in the free tier");
  }

  async extractFromText(text: string): Promise<Partial<CVFormData>> {
    if (!this.client) throw new Error("Claude not configured");

    const prompt = `
Eres un asistente que extrae información de currículums. Analiza el siguiente texto que contiene datos de un CV 
y extrae los siguientes datos en formato JSON:

{
  "fullName": "nombre completo",
  "email": "correo electrónico",
  "phone": "teléfono",
  "location": "ubicación",
  "summary": "perfil profesional",
  "experience": [
    {
      "company": "empresa",
      "position": "puesto",
      "startDate": "fecha inicio",
      "endDate": "fecha fin o 'actual'",
      "current": true/false,
      "description": "descripción de funciones"
    }
  ],
  "education": [
    {
      "institution": "institución",
      "degree": "título",
      "field": "campo de estudio",
      "status": "complete | in_progress | incomplete",
      "startDate": "fecha inicio",
      "endDate": "fecha fin"
    }
  ],
  "skills": ["skill1", "skill2"],
  "languages": [{"language": "idioma", "level": "nivel"}]
}

Texto del CV:
${text}

Responde SOLO con el JSON, sin texto adicional.
`;

    const result = await this.client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = result.content[0].type === "text" ? result.content[0].text : "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not extract data from text");
  }

  async generateSkills(experience: Experience[], education: Education[], targetJob?: string): Promise<string[]> {
    const experienceText = experience.map((e) => `${e.position} en ${e.company}`).join("\n");
    const educationText = education.map((e) => `${e.degree} en ${e.institution}`).join("\n");
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

    const result = await this.client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = result.content[0].type === "text" ? result.content[0].text : "";
    
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
}

class GroqProvider implements IAProvider {
  name = "Groq";
  private client: any;

  constructor(private apiKey: string) {
    const Groq = require("groq-sdk");
    this.client = new Groq({ apiKey: this.apiKey });
  }

  async generateProfile(
    experience: Experience[],
    skills: string[],
    targetJob?: string
  ): Promise<string> {
    const experienceText = experience
      .map((e) => `${e.position} en ${e.company}: ${e.description}`)
      .join("\n");

    const hasExperience = experience.length > 0 && experience.some(e => e.description?.trim());

    const prompt = buildGenerateProfilePrompt(experienceText, skills, targetJob, hasExperience);

    const result = await this.client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return result.choices[0]?.message?.content || "";
  }

  async improveText(text: string): Promise<string> {
    const prompt = buildImproveTextPrompt(text);

    const result = await this.client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return result.choices[0]?.message?.content || "";
  }

  async extractFromCV(file: File): Promise<Partial<CVFormData>> {
    throw new Error("Groq no soporta extracción de CV desde archivo. Usá Gemini para esta función.");
  }

  async extractFromText(text: string): Promise<Partial<CVFormData>> {
    const prompt = `
Eres un asistente que extrae información de currículums. Analiza el siguiente texto que contiene datos de un CV 
y extrae los siguientes datos en formato JSON:

{
  "fullName": "nombre completo",
  "email": "correo electrónico",
  "phone": "teléfono",
  "location": "ubicación",
  "summary": "perfil profesional",
  "experience": [
    {
      "company": "empresa",
      "position": "puesto",
      "startDate": "fecha inicio",
      "endDate": "fecha fin o 'actual'",
      "current": true/false,
      "description": "descripción de funciones"
    }
  ],
  "education": [
    {
      "institution": "institución",
      "degree": "título",
      "field": "campo de estudio",
      "status": "complete | in_progress | incomplete",
      "startDate": "fecha inicio",
      "endDate": "fecha fin"
    }
  ],
  "skills": ["skill1", "skill2"],
  "languages": [{"language": "idioma", "level": "nivel"}]
}

Texto del CV:
${text}

Responde SOLO con el JSON, sin texto adicional.
`;

    const result = await this.client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
    });

    const responseText = result.choices[0]?.message?.content || "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not extract data from text");
  }

  async generateSkills(experience: Experience[], education: Education[], targetJob?: string): Promise<string[]> {
    const experienceText = experience.map((e) => `${e.position} en ${e.company}`).join("\n");
    const educationText = education.map((e) => `${e.degree} en ${e.institution}`).join("\n");
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

    const result = await this.client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const text = result.choices[0]?.message?.content || "";
    
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
}
