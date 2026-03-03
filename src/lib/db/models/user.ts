import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import type { Experience, Education, Language, Project, Certification, CVStatus, TemplateType, TemplateSettings, CVFormData } from "@/types";

interface UserCVDoc {
  _id: ObjectId;
  phone: string;
  fullName: string;
  email: string;
  photo?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  projects?: Project[];
  certifications?: Certification[];
  selectedTemplate: TemplateType;
  templateSettings: TemplateSettings;
  status: CVStatus;
  viewed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserCVResponse {
  _id: string;
  phone: string;
  fullName: string;
  email: string;
  photo?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  projects?: Project[];
  certifications?: Certification[];
  selectedTemplate: TemplateType;
  templateSettings: TemplateSettings;
  status: CVStatus;
  viewed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type { UserCVDoc, UserCVResponse };

export async function getUsersCollection() {
  const db = await getDatabase();
  return db.collection<UserCVDoc>("users");
}

function toResponse(user: UserCVDoc): UserCVResponse {
  return { ...user, _id: user._id.toString() };
}

export async function createUser(data: CVFormData): Promise<UserCVResponse> {
  const collection = await getUsersCollection();
  const now = new Date().toISOString();
  
  const doc: Omit<UserCVDoc, "_id"> = {
    phone: data.phone,
    fullName: data.fullName,
    email: data.email || "",
    photo: data.photo,
    location: data.location,
    linkedin: "",
    github: "",
    summary: data.summary,
    experience: data.experience || [],
    education: data.education || [],
    skills: data.skills || [],
    languages: data.languages || [],
    projects: data.projects,
    certifications: data.certifications,
    selectedTemplate: data.selectedTemplate || "harvard",
    templateSettings: data.templateSettings || {
      primaryColor: "#1e3a5f",
      fontSize: "medium",
      fontFamily: "Helvetica",
      layout: "descending",
      padding: 40,
      margin: 20,
    },
    status: "pending",
    viewed: false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as UserCVDoc);
  return { ...doc, _id: result.insertedId.toString() } as UserCVResponse;
}

export async function getAllUsers(): Promise<UserCVResponse[]> {
  const collection = await getUsersCollection();
  const users = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return users.map(toResponse);
}

export async function getUserById(id: string): Promise<UserCVResponse | null> {
  const collection = await getUsersCollection();
  const user = await collection.findOne({ _id: new ObjectId(id) });
  return user ? toResponse(user) : null;
}

export async function getUserByPhone(phone: string): Promise<UserCVResponse | null> {
  const collection = await getUsersCollection();
  const user = await collection.findOne({ phone });
  return user ? toResponse(user) : null;
}

export async function updateUser(
  id: string,
  data: Partial<UserCVResponse>
): Promise<UserCVResponse | null> {
  const collection = await getUsersCollection();
  const { _id, ...updateData } = data;
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" }
  );
  
  return result ? toResponse(result) : null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const collection = await getUsersCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function getUsersByStatus(status: CVStatus): Promise<UserCVResponse[]> {
  const collection = await getUsersCollection();
  const users = await collection.find({ status }).sort({ createdAt: -1 }).toArray();
  return users.map(toResponse);
}

export async function searchUsers(query: string): Promise<UserCVResponse[]> {
  const collection = await getUsersCollection();
  const users = await collection
    .find({
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
    .sort({ createdAt: -1 })
    .toArray();
  return users.map(toResponse);
}

export async function markUserAsViewed(id: string): Promise<void> {
  const collection = await getUsersCollection();
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { viewed: true, updatedAt: new Date().toISOString() } }
  );
}
