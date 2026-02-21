import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

interface AdminDoc {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export async function getAdminsCollection() {
  const db = await getDatabase();
  return db.collection<AdminDoc>("admins");
}

export async function createAdmin(
  email: string,
  password: string,
  name: string
): Promise<{ _id: string; email: string; name: string; createdAt: string }> {
  const collection = await getAdminsCollection();
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const admin: Omit<AdminDoc, "_id"> = {
    email,
    password: hashedPassword,
    name,
    createdAt: new Date().toISOString(),
  };

  const result = await collection.insertOne(admin as never);
  return { ...admin, _id: result.insertedId.toString() };
}

export async function getAdminByEmail(email: string): Promise<AdminDoc | null> {
  const collection = await getAdminsCollection();
  const admin = await collection.findOne({ email });
  return admin;
}

export async function verifyPassword(
  admin: { password: string },
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, admin.password);
}

export async function getAdminById(id: string): Promise<{ _id: string; email: string; name: string; createdAt: string } | null> {
  const collection = await getAdminsCollection();
  const admin = await collection.findOne({ _id: new ObjectId(id) });
  if (!admin) return null;
  return { ...admin, _id: admin._id.toString() };
}
