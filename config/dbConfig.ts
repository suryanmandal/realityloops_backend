import mongoose from "mongoose";
import { config } from "dotenv";

config({
  quiet: true,
});

export default async (): Promise<void> => {
  try {
    let URL = process.env.MONGODB_URL;

    if (URL === "in-memory") {
      try {
        console.log("ℹ️ Starting in-memory MongoDB server...");
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const mongoServer = await MongoMemoryServer.create();
        URL = mongoServer.getUri();
        console.log(`✅ In-memory MongoDB server started at: ${URL}`);
      } catch (err: any) {
        console.warn("⚠️ mongodb-memory-server package not found. Falling back to local MongoDB connection...");
        URL = "mongodb://127.0.0.1:27017/realityloops";
      }
    }

    if (!URL) {
      URL = "mongodb://127.0.0.1:27017/realityloops";
    }

    mongoose.connection.on("open", async () => {
      console.log("✅ Connected to database.");
      try {
        const { seedDB } = require("../utils/seeder");
        await seedDB();
      } catch (err) {
        console.error("❌ Database seeding failed:", err);
      }
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB: Error", err);
      process.exit(1);
    });

    await mongoose.connect(URL ?? "");

    mongoose.Promise = global.Promise;
  } catch (error) {
    console.error("MongoDB: Error", error);
    process.exit(1);
  }
};

