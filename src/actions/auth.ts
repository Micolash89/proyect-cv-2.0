"use server";

import { getDatabase } from "@/lib/db/mongodb";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

const COOKIE_NAME = "cv-admin-token";

export async function login(email: string, password: string) {
  "use server";
  
  const db = await getDatabase();
  const admin = await db.collection("admins").findOne({ email });
  
  if (!admin) {
    return { error: "Credenciales inválidas" };
  }
  
  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    return { error: "Credenciales inválidas" };
  }
  
  const token = await new SignJWT({
    adminId: admin._id.toString(),
    email: admin.email,
    name: admin.name
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  
  redirect("/admin");
}

export async function logout() {
  "use server";
  
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  
  redirect("/login");
}

export async function getCurrentAdmin() {
  "use server";
  
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.adminId) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  "use server";
  
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/login");
  }
  return admin;
}
