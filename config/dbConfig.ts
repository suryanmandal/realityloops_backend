import mongoose from "mongoose";
import { config } from "dotenv";

config({
    quiet: true,
});

export default async (): Promise<void> => {
    try {

        const URL = process.env.MONGODB_URL;

        mongoose.connect(URL ?? "");

        const db = mongoose.connection;

        db.on("open", () => {
            console.log("✅ Connected to database.");
        });

        db.on("error", (err) => {
            console.error("MongoDB: Error", err);
            process.exit(1);
        });

        mongoose.Promise = global.Promise;

    } catch (error) {
        console.error("MongoDB: Error", error);
        process.exit(1);
    };
};