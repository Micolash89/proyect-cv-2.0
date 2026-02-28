"use server";

import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth/jwt";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  getUsersByStatus,
  markUserAsViewed,
  getUserByPhone,
} from "@/lib/db/models/user";
import { sendNewCVNotification } from "@/lib/email/nodemailer";
import type { CVFormData, CVStatus } from "@/types";
import { renderToStream } from "@react-pdf/renderer";
import CVTemplate from "@/components/cv/templates/CVTemplate";

export async function getCVs(search?: string, status?: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("No autorizado");
  }

  let users;
  if (search) {
    users = await searchUsers(search);
  } else if (status && status !== "all") {
    users = await getUsersByStatus(status as CVStatus);
  } else {
    users = await getAllUsers();
  }

  return { users };
}

export async function getCV(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("No autorizado");
  }

  const user = await getUserById(id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  await markUserAsViewed(id);
  return { user: { ...user, viewed: true } };
}

const cvSchema = z.object({
  phone: z.string().min(1, "Teléfono requerido"),
  fullName: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  photo: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  summary: z.string().optional(),
  experience: z.array(z.any()).default([]),
  education: z.array(z.any()).default([]),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.any()).default([]),
  projects: z.array(z.any()).optional(),
  certifications: z.array(z.any()).optional(),
  selectedTemplate: z.string().default("modern"),
  templateSettings: z.any().optional(),
});

export async function createCV(data: CVFormData) {
  const validated = cvSchema.safeParse(data);
  
  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }

  const existingUser = await getUserByPhone(validated.data.phone);
  if (existingUser) {
    throw new Error("Ya existe un CV registrado con este teléfono");
  }

  const user = await createUser(validated.data as CVFormData);
  
  sendNewCVNotification(validated.data.fullName, validated.data.phone).catch(console.error);

  return { success: true, user };
}

export async function updateCV(id: string, data: Partial<CVFormData & { status?: CVStatus; viewed?: boolean }>) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("No autorizado");
  }

  const user = await updateUser(id, data);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return { success: true, user };
}

export async function deleteCV(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("No autorizado");
  }

  const deleted = await deleteUser(id);
  if (!deleted) {
    throw new Error("Usuario no encontrado");
  }

  return { success: true };
}

export async function downloadCV(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("No autorizado");
  }

  const user = await getUserById(id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const stream = await renderToStream(
    <CVTemplate user={user} />
  );

  return {
    stream,
    filename: `CV-${user.fullName.replace(/\s+/g, "-")}.pdf`,
    contentType: "application/pdf",
  };
}
