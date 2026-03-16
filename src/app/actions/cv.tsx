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

export async function getCVs(filters?: { status?: string; search?: string; page?: number; limit?: number }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("No autorizado");
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;
  
  let users;
  let total = 0;
  
  if (filters?.search) {
    const result = await searchUsers(filters.search);
    users = result;
    total = result.length;
  } else if (filters?.status && filters.status !== "all") {
    users = await getUsersByStatus(filters.status as CVStatus);
    total = users.length;
  } else {
    users = await getAllUsers();
    total = users.length;
  }

  const paginatedUsers = users.slice(skip, skip + limit);
  
  return { 
    users: paginatedUsers, 
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
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
  email: z.string().email("Email inválido").optional().or(z.literal("")),
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

  const user = await createUser(validated.data as CVFormData);
  
  sendNewCVNotification(validated.data.fullName, validated.data.phone).catch(console.error);

  return { success: true, id: user._id };
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
