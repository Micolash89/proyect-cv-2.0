"use server";

import { getCurrentAdmin } from "@/lib/auth/jwt";
import { getSettings, setSettings, getWhatsAppNumber } from "@/lib/db/models/settings";
import type { Settings } from "@/types";

export async function getSettingsAction() {
  try {
    const settings = await getSettings();
    return { success: true, settings };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { success: false, error: "Error al obtener configuración" };
  }
}

export async function saveSettingsAction(data: Partial<Settings>) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return { success: false, error: "No autorizado" };
    }

    await setSettings(data);
    return { success: true };
  } catch (error) {
    console.error("Error saving settings:", error);
    return { success: false, error: "Error al guardar configuración" };
  }
}

export async function getWhatsAppNumberAction() {
  try {
    const number = await getWhatsAppNumber();
    return { success: true, number: number || "5491112345678" };
  } catch (error) {
    console.error("Error fetching WhatsApp:", error);
    return { success: true, number: "5491112345678" };
  }
}
