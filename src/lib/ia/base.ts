import type { IAProvider, Experience, CVFormData } from "@/types";

export type { IAProvider };

export interface IAConfig {
  apiKey: string;
}

export function createIAProvider(type: "gemini" | "claude", config: IAConfig): IAProvider {
  if (type === "gemini") {
    return new GeminiProvider(config.apiKey);
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
          model: "gemini-2.0-flash",
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

    const prompt = `
Eres un experto en简历 y perfiles profesionales. Basándote en la siguiente experiencia laboral y skills, 
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

    const result = await this.client.generateContent(prompt);
    return result.response.text();
  }

  async improveText(text: string): Promise<string> {
    if (!this.client) throw new Error("Gemini not configured");

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

    const result = await this.client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    return result.content[0].type === "text" ? result.content[0].text : "";
  }

  async improveText(text: string): Promise<string> {
    if (!this.client) throw new Error("Claude not configured");

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
}
