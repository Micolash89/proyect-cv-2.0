import { getDatabase } from "@/lib/db/mongodb";
import type { Settings, IAType } from "@/types";

const defaultSettings: Settings = {
  whatsappNumber: "",
  geminiApiKey: "",
  claudeApiKey: "",
  groqApiKey: "",
  activeIA: "gemini",
  emailHost: "",
  emailPort: "",
  emailUser: "",
  emailPassword: "",
  emailFrom: "",
};

export async function getSettingsCollection() {
  const db = await getDatabase();
  return db.collection<{ key: string; value: string }>("settings");
}

export async function getSettings(): Promise<Settings> {
  const collection = await getSettingsCollection();
  const settings = await collection.find({}).toArray();
  
  const result: Record<string, string> = {};
  settings.forEach((s) => {
    result[s.key] = s.value;
  });

  return {
    ...defaultSettings,
    ...result,
    activeIA: (result.activeIA as IAType) || "gemini",
  };
}

export async function getSetting(key: string): Promise<string | null> {
  const collection = await getSettingsCollection();
  const setting = await collection.findOne({ key });
  return setting?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const collection = await getSettingsCollection();
  await collection.updateOne(
    { key },
    { $set: { value } },
    { upsert: true }
  );
}

export async function setSettings(settings: Partial<Settings>): Promise<void> {
  const updates = Object.entries(settings).filter(([, v]) => v !== undefined);
  
  for (const [key, value] of updates) {
    await setSetting(key, value as string);
  }
}

export async function getWhatsAppNumber(): Promise<string> {
  return (await getSetting("whatsappNumber")) || "";
}

export async function getActiveIA(): Promise<IAType> {
  return ((await getSetting("activeIA")) as IAType) || "gemini";
}

export async function getIAApiKey(ia: IAType): Promise<string> {
  return (await getSetting(`${ia}ApiKey`)) || "";
}
