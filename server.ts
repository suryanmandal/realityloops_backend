import app from "./app";
import { config } from "dotenv";
import connectDB from "./config/dbConfig";

config({
  quiet: true,
});

const PORT: number = parseInt(process.env.PORT ?? "3000", 10);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("🚀 Server is starting...");
      console.log(
        process.env.NODE_ENV === "production"
          ? "🌍 Running in production mode"
          : "🔍 Running in development mode",
      );
      console.log(`✅ Server is running on port http://127.0.0.1:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "Failed to connect to the database, server not starting:",
      error,
    );
    process.exit(1);
  });
