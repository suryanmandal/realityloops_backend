import fs from "fs";
import path from "path";

/**
 * Log levels
 */
enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  HTTP = "HTTP",
  DEBUG = "DEBUG",
}

/**
 * Logger class for application-wide logging
 */
class AppLogger {
  private logDir: string;
  private isDevelopment: boolean;

  constructor() {
    this.logDir = path.join(process.cwd(), "logs");
    this.isDevelopment = process.env.NODE_ENV !== "production";
    this.ensureLogDirectory();
  }

  /**
   * Ensure logs directory exists
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Get timestamp
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format log message
   */
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = this.getTimestamp();
    let logMessage = `${timestamp} [${level}]: ${message}`;

    if (meta) {
      logMessage += ` | ${JSON.stringify(meta)}`;
    }

    return logMessage;
  }

  /**
   * Write to log file
   */
  private writeToFile(filename: string, message: string): void {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, message + "\n", "utf8");
  }

  /**
   * Log to console with colors
   */
  private logToConsole(level: LogLevel, message: string): void {
    const colors: Record<LogLevel, string> = {
      [LogLevel.ERROR]: "\x1b[31m", // Red
      [LogLevel.WARN]: "\x1b[33m", // Yellow
      [LogLevel.INFO]: "\x1b[36m", // Cyan
      [LogLevel.HTTP]: "\x1b[35m", // Magenta
      [LogLevel.DEBUG]: "\x1b[37m", // White
    };

    const reset = "\x1b[0m";
    console.log(`${colors[level]}${message}${reset}`);
  }

  /**
   * Base log method
   */
  private log(level: LogLevel, message: string, meta?: any): void {
    const formattedMessage = this.formatMessage(level, message, meta);

    // Console logging
    if (this.isDevelopment) {
      this.logToConsole(level, formattedMessage);
    } else {
      console.log(formattedMessage);
    }

    // File logging
    this.writeToFile("combined.log", formattedMessage);

    // Error-specific file
    if (level === LogLevel.ERROR) {
      this.writeToFile("error.log", formattedMessage);
    }
  }

  /**
   * Log info level messages
   */
  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * Log error level messages
   */
  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  /**
   * Log warning level messages
   */
  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * Log debug level messages
   */
  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }

  /**
   * Log HTTP requests
   */
  http(message: string, meta?: any): void {
    this.log(LogLevel.HTTP, message, meta);
  }
}

// Export singleton instance
export const logger = new AppLogger();
