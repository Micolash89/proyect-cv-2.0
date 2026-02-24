import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import type { CVFormData, CVStatus } from "@/types";

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
  experience: any[];
  education: any[];
  skills: string[];
  languages: any[];
  projects?: any[];
  certifications?: any[];
  selectedTemplate: string;
  templateSettings: any;
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
  experience: any[];
  education: any[];
  skills: string[];
  languages: any[];
  projects?: any[];
  certifications?: any[];
  selectedTemplate: string;
  templateSettings: any;
  status: CVStatus;
  viewed: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  
  const user: Omit<UserCVDoc, "_id"> = {
    phone: data.phone,
    fullName: data.fullName,
    email: data.email,
    photo: data.photo,
    location: data.location,
    linkedin: data.linkedin,
    github: data.github,
    summary: data.summary,
    experience: data.experience.map((exp, i) => ({ ...exp, id: `exp-${i}` })),
    education: data.education.map((edu, i) => ({ ...edu, id: `edu-${i}` })),
    skills: data.skills,
    languages: data.languages.map((lang, i) => ({ ...lang, id: `lang-${i}` })),
    projects: data.projects?.map((proj, i) => ({ ...proj, id: `proj-${i}` })),
    certifications: data.certifications?.map((cert, i) => ({ ...cert, id: `cert-${i}` })),
    selectedTemplate: data.selectedTemplate,
    templateSettings: data.templateSettings,
    status: "pending",
    viewed: false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(user as UserCVDoc);
  return { ...user, _id: result.insertedId.toString() };
}

export async function getAllUsers(): Promise<UserCVResponse[]> {
  const collection = await getUsersCollection();
  const users = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return users.map(toResponse);
}

export async function getUserById(id: string): Promise<UserCVResponse | null> {
  const collection = await getUsersCollection();
  try {
    const user = await collection.findOne({ _id: new ObjectId(id) });
    if (!user) return null;
    return toResponse(user);
  } catch {
    return null;
  }
}

export async function getUserByPhone(phone: string): Promise<UserCVResponse | null> {
  const collection = await getUsersCollection();
  const user = await collection.findOne({ phone });
  if (!user) return null;
  return toResponse(user);
}

export async function updateUser(
  id: string,
  data: Partial<CVFormData & { status?: CVStatus; viewed?: boolean }>
): Promise<UserCVResponse | null> {
  const collection = await getUsersCollection();
  
  const allowedFields = [
    'phone', 'fullName', 'email', 'photo', 'location', 'linkedin', 'github',
    'summary', 'experience', 'education', 'skills', 'languages', 
    'projects', 'certifications', 'selectedTemplate', 'templateSettings',
    'dni', 'links', 'targetJob'
  ];
  
  const filteredData: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in data) {
      filteredData[key] = (data as any)[key];
    }
  }
  
  filteredData.updatedAt = new Date().toISOString();

  try {
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: filteredData }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }

  return getUserById(id);
}

export async function deleteUser(id: string): Promise<boolean> {
  const collection = await getUsersCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function markUserAsViewed(id: string): Promise<void> {
  const collection = await getUsersCollection();
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { viewed: true } }
  );
}

export async function getUsersByStatus(status: CVStatus): Promise<UserCVResponse[]> {
  const collection = await getUsersCollection();
  const users = await collection
    .find({ status })
    .sort({ createdAt: -1 })
    .toArray();
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
