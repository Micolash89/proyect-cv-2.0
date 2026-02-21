import { NextRequest, NextResponse } from "next/server";
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
} from "@/lib/db/models/user";
import { sendNewCVNotification } from "@/lib/email/nodemailer";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    let users;
    if (search) {
      users = await searchUsers(search);
    } else if (status && status !== "all") {
      users = await getUsersByStatus(status as any);
    } else {
      users = await getAllUsers();
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.fullName || !data.email || !data.phone) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const user = await createUser(data);

    sendNewCVNotification(data.fullName, data.phone).catch(console.error);

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
