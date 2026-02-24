"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getAdminByEmail, verifyPassword } from "@/lib/db/models/admin";
import { createToken, setAuthCookie, getCurrentAdmin } from "@/lib/auth/jwt";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type LoginState = {
  success?: boolean;
  error?: string;
  errors?: {
    email?: string;
    password?: string;
  };
};

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validated = loginSchema.safeParse({ email, password });

  if (!validated.success) {
    const errors: LoginState["errors"] = {};
    validated.error.issues.forEach((issue) => {
      if (issue.path[0] === "email") {
        errors.email = issue.message;
      }
      if (issue.path[0] === "password") {
        errors.password = issue.message;
      }
    });
    return { error: "Validation failed", errors };
  }

  try {
    const admin = await getAdminByEmail(validated.data.email);
    if (!admin) {
      return { error: "Credenciales inválidas", errors: { email: "Credenciales inválidas" } };
    }

    const isValid = await verifyPassword(admin, validated.data.password);
    if (!isValid) {
      return { error: "Credenciales inválidas", errors: { password: "Credenciales inválidas" } };
    }

    const token = await createToken({
      adminId: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    });

    await setAuthCookie(token);

    return { success: true };
  } catch (error) {
    console.error("Auth error:", error);
    return { error: "Error interno del servidor" };
  }
}

export async function logout(): Promise<void> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("cv-admin-token");
  redirect("/login");
}

export async function getSession() {
  return getCurrentAdmin();
}
