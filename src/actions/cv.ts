"use server";

import { getDatabase } from "@/lib/db/mongodb";
import { revalidatePath } from "next/cache";

interface CVFormData {
  phone: string;
  fullName: string;
  email?: string;
  photo?: string;
  location?: string;
  links?: string;
  summary?: string;
  dni?: string;
  experience: any[];
  education: any[];
  skills: string[];
  languages: any[];
  projects?: any[];
  certifications?: any[];
  selectedTemplate: string;
  templateSettings: {
    primaryColor: string;
    fontSize: string;
    fontFamily: string;
    layout: string;
    padding: number;
    margin: number;
  };
}

export async function createCV(data: CVFormData) {
  "use server";
  
  const db = await getDatabase();
  const now = new Date().toISOString();
  
  const user = {
    phone: data.phone,
    fullName: data.fullName,
    email: data.email || "",
    photo: data.photo || "",
    location: data.location || "",
    links: data.links || "",
    summary: data.summary || "",
    dni: data.dni || "",
    experience: data.experience || [],
    education: data.education || [],
    skills: data.skills || [],
    languages: data.languages || [],
    projects: data.projects || [],
    certifications: data.certifications || [],
    selectedTemplate: data.selectedTemplate || "harvard",
    templateSettings: data.templateSettings || {
      primaryColor: "#0ea5e9",
      fontSize: "medium",
      fontFamily: "Inter",
      layout: "descending",
      padding: 20,
      margin: 15,
    },
    status: "pending",
    viewed: false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("users").insertOne(user);
  
  revalidatePath("/admin");
  
  return { success: true, id: result.insertedId.toString() };
}

export async function updateCV(id: string, data: Partial<FormData>) {
  "use server";
  
  const db = await getDatabase();
  
  await db.collection("users").updateOne(
    { _id: new (await import("mongodb")).ObjectId(id) },
    { $set: { ...data, updatedAt: new Date().toISOString() } }
  );
  
  revalidatePath("/admin");
  revalidatePath(`/admin/cv/${id}`);
  
  return { success: true };
}

export async function deleteCV(id: string) {
  "use server";
  
  const db = await getDatabase();
  
  await db.collection("users").deleteOne({
    _id: new (await import("mongodb")).ObjectId(id)
  });
  
  revalidatePath("/admin");
  
  return { success: true };
}

export async function getCVs(filters?: { status?: string; search?: string }) {
  "use server";
  
  const db = await getDatabase();
  let query: Record<string, unknown> = {};
  
  if (filters?.status && filters.status !== "all") {
    query.status = filters.status;
  }
  
  if (filters?.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: "i" } },
      { phone: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }
  
  const users = await db.collection("users")
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();
  
  return users.map((u: any) => ({ ...u, _id: u._id.toString() }));
}

export async function getCV(id: string) {
  "use server";
  
  const db = await getDatabase();
  
  try {
    const user = await db.collection("users").findOne({
      _id: new (await import("mongodb")).ObjectId(id)
    });
    
    if (!user) return null;
    
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { viewed: true } }
    );
    
    return { ...user, _id: user._id.toString() };
  } catch {
    return null;
  }
}

export async function updateCVStatus(id: string, status: string) {
  "use server";
  
  const db = await getDatabase();
  
  await db.collection("users").updateOne(
    { _id: new (await import("mongodb")).ObjectId(id) },
    { $set: { status, updatedAt: new Date().toISOString() } }
  );
  
  revalidatePath("/admin");
  revalidatePath(`/admin/cv/${id}`);
  
  return { success: true };
}
