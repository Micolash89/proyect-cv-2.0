import { NextRequest, NextResponse } from "next/server";
import { getAdminByEmail, verifyPassword } from "@/lib/db/models/admin";
import { createToken, setAuthCookie } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const admin = await getAdminByEmail(email);
    if (!admin) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(admin, password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = await createToken({
      adminId: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
