import mongoose from "mongoose";
import { config } from "dotenv";
import Admin from "../models/admin";
import { AccountStatus } from "../types/enums";

config();

async function resetAdmin() {
  const mongoUri = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/realityloops";
  
  if (mongoUri === "in-memory") {
    console.error("❌ Cannot reset admin on an in-memory database server. Configure MONGODB_URL in your .env first.");
    process.exit(1);
  }

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!");

    const adminEmail = "admin@realityloops.com";
    const defaultPassword = "password123";

    let admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Found existing admin user: ${adminEmail}. Updating password...`);
      admin.password = defaultPassword;
      admin.status = AccountStatus.ACTIVE;
      admin.isEmailVerified = true;
      await admin.save();
      console.log(`✅ Admin password successfully reset to: ${defaultPassword}`);
    } else {
      console.log(`Admin user ${adminEmail} not found. Creating a fresh admin user...`);
      await Admin.create({
        name: "System Administrator",
        email: adminEmail,
        phone: "9876543210",
        password: defaultPassword,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
        permissions: ["ALL"],
      });
      console.log(`✅ Fresh admin created successfully!`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${defaultPassword}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Reset script failed:", error);
    process.exit(1);
  }
}

resetAdmin();
