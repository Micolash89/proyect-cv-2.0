import { getActiveIA, getIAApiKey } from "@/lib/db/models/settings";
import { createIAProvider, type IAProvider } from "./base";

let cachedProvider: IAProvider | null = null;
let cachedType: string | null = null;

export async function getIAProvider(): Promise<IAProvider | null> {
  try {
    const activeIA = await getActiveIA();
    const apiKey = await getIAApiKey(activeIA);

    if (!apiKey) {
      console.error(`API key not configured for ${activeIA}`);
      return null;
    }

    if (cachedProvider && cachedType === activeIA) {
      return cachedProvider;
    }

    cachedProvider = createIAProvider(activeIA, { apiKey });
    cachedType = activeIA;

    return cachedProvider;
  } catch (error) {
    console.error("Error getting IA provider:", error);
    return null;
  }
}

export async function generateProfile(
  experience: any[],
  skills: string[],
  targetJob?: string
): Promise<string> {
  const provider = await getIAProvider();
  if (!provider) throw new Error("No IA provider configured");
  return provider.generateProfile(experience, skills, targetJob);
}

export async function improveText(text: string): Promise<string> {
  const provider = await getIAProvider();
  if (!provider) throw new Error("No IA provider configured");
  return provider.improveText(text);
}

export async function extractFromCV(file: File): Promise<any> {
  const provider = await getIAProvider();
  if (!provider) throw new Error("No IA provider configured");
  return provider.extractFromCV(file);
}
