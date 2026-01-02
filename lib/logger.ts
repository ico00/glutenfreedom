import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  SECURITY = "SECURITY",
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  ip?: string;
}

/**
 * Strukturirani logger
 */
export class Logger {
  private static async ensureLogsDir(): Promise<void> {
    if (!existsSync(logsDir)) {
      await mkdir(logsDir, { recursive: true });
    }
  }

  private static async writeLog(entry: LogEntry): Promise<void> {
    try {
      await this.ensureLogsDir();
      
      const date = new Date().toISOString().split("T")[0];
      const logFile = path.join(logsDir, `${date}.log`);
      
      const logLine = JSON.stringify(entry) + "\n";
      
      const { appendFile } = await import("fs/promises");
      await appendFile(logFile, logLine, "utf-8");
    } catch (error) {
      // Fallback na console ako ne može pisati u fajl
      console.error("Error writing log:", error);
      console.log(JSON.stringify(entry));
    }
  }

  static async info(message: string, context?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
    };
    
    await this.writeLog(entry);
    console.log(`[INFO] ${message}`, context || "");
  }

  static async warn(message: string, context?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
    };
    
    await this.writeLog(entry);
    console.warn(`[WARN] ${message}`, context || "");
  }

  static async error(message: string, error?: Error | unknown, context?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context: {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      },
    };
    
    await this.writeLog(entry);
    console.error(`[ERROR] ${message}`, error, context || "");
  }

  static async security(
    message: string,
    userId?: string,
    ip?: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.SECURITY,
      message,
      userId,
      ip,
      context,
    };
    
    await this.writeLog(entry);
    console.warn(`[SECURITY] ${message}`, { userId, ip, ...context });
  }
}

