const DEFAULT_WHATSAPP_NUMBER = "1135716832";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;

export function normalizeWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (!cleaned) {
    return "";
  }

  if (cleaned.startsWith("549") || cleaned.startsWith("54")) {
    return cleaned;
  }

  if (cleaned.length === 10) {
    return `549${cleaned}`;
  }

  return cleaned;
}
