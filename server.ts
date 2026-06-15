import app from "./app";
import { config } from "dotenv";
import connectDB from "./config/dbConfig";
import { logger } from "./utils/logger";

config({
  quiet: true,
});

const PORT: number = parseInt(process.env.PORT ?? "3000", 10);

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info("🚀 Server is starting...");
      logger.info(
        process.env.NODE_ENV === "production"
          ? "🌍 Running in production mode"
          : "🔍 Running in development mode"
      );
      logger.info(`✅ Server is running on http://127.0.0.1:${PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((error) => {
    logger.error("Failed to connect to the database, server not starting", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
