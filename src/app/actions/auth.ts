"use server";

import { redirect } from "next/navigation";
import { getAdminByEmail, verifyPassword } from "@/lib/db/models/admin";
import {
  createToken,
  setAuthCookie,
  getCurrentAdmin,
  removeAuthCookie,
} from "@/lib/auth/jwt";
import { AUTH_ERROR_MESSAGES } from "@/lib/constants/auth";
import { loginSchema } from "@/lib/validations/auth";

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
    return { error: AUTH_ERROR_MESSAGES.validationFailed, errors };
  }

  try {
    const admin = await getAdminByEmail(validated.data.email);
    if (!admin) {
      return {
        error: AUTH_ERROR_MESSAGES.invalidCredentials,
        errors: { email: AUTH_ERROR_MESSAGES.invalidCredentials },
      };
    }

    const isValid = await verifyPassword(admin, validated.data.password);
    if (!isValid) {
      return {
        error: AUTH_ERROR_MESSAGES.invalidCredentials,
        errors: { password: AUTH_ERROR_MESSAGES.invalidCredentials },
      };
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
    return { error: AUTH_ERROR_MESSAGES.internalServerError };
  }
}

export async function logout(): Promise<void> {
  await removeAuthCookie();
  redirect("/login");
}

export async function getSession() {
  return getCurrentAdmin();
}
