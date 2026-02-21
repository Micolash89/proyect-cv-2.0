import clientPromise from "@/lib/db/mongodb";
import { createAdmin } from "@/lib/db/models/admin";

async function initAdmin() {
  try {
    await clientPromise;
    console.log("Connected to MongoDB");
    
    const email = "admin@cvgenerator.com";
    const password = "admin123";
    const name = "Administrador";
    
    try {
      const admin = await createAdmin(email, password, name);
      console.log("Admin created:", admin);
    } catch (error: any) {
      if (error.code === 11000) {
        console.log("Admin already exists");
      } else {
        throw error;
      }
    }
    
    console.log("Initialization complete");
    process.exit(0);
  } catch (error) {
    console.error("Initialization failed:", error);
    process.exit(1);
  }
}

initAdmin();
