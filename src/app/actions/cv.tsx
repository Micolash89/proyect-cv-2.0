"use server";

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
import { normalizeCVPayload, validateCVPayload } from "@/lib/validations";

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

export async function createCV(data: CVFormData) {
  const validated = validateCVPayload(data);

  if (!validated.success) {
    const firstError = Object.values(validated.errors)[0] ?? "Datos inválidos";
    throw new Error(firstError);
  }

  const { name, lastName, ...payload } = validated.data;

  const user = await createUser(payload as CVFormData);
  
  sendNewCVNotification(`${name} ${lastName}`.trim(), payload.phone).catch(console.error);

  return { success: true, id: user._id };
}

export async function updateCV(id: string, data: Partial<CVFormData & { status?: CVStatus; viewed?: boolean }>) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("No autorizado");
  }

  const existing = await getUserById(id);
  if (!existing) {
    throw new Error("Usuario no encontrado");
  }

  const mergedPayload = normalizeCVPayload({
    ...existing,
    ...data,
  });

  const validated = validateCVPayload(mergedPayload);
  if (!validated.success) {
    const firstError = Object.values(validated.errors)[0] ?? "Datos inválidos";
    throw new Error(firstError);
  }

  const { name: _name, lastName: _lastName, ...safePayload } = validated.data;

  const user = await updateUser(id, {
    ...safePayload,
    status: data.status ?? safePayload.status,
    viewed: data.viewed ?? safePayload.viewed,
  });
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
