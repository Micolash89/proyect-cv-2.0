import { NextResponse } from "next/server";
import { getWhatsAppNumber } from "@/lib/db/models/settings";

export async function GET() {
  try {
    const number = await getWhatsAppNumber();
    return NextResponse.json({ number: number || "5491112345678" });
  } catch (error) {
    console.error("Error fetching WhatsApp:", error);
    return NextResponse.json(
      { number: "5491112345678" },
      { status: 200 }
    );
  }
}
