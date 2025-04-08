import { normalizePath, TFile, Vault } from "obsidian";
import { PluginSettings, NoteActivity } from "./types";
import * as winston from 'winston';
import { format } from 'winston';

export class Logger {
  private vault: Vault;
  private settings: PluginSettings;
  private winstonLogger: winston.Logger;

  constructor(vault: Vault, settings: PluginSettings) {
    this.vault = vault;
    this.settings = settings;
    this.winstonLogger = this.createWinstonLogger();
  }

  getCurrentLogFilePath(): string {
    return this.getLogFilePath();
  }

  private getLogFilePath(): string {
    const base = normalizePath(this.settings.logPath);
    if (this.settings.deriveNameFromDate) {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      return `${base}/log-${today}.${this.ext()}`;
    }
    return `${base}/activity.${this.ext()}`;
  }

  private ext(): string {
    switch (this.settings.format) {
      case "csv":
        return "csv";
      case "json":
        return "jsonl";
      default:
        return "txt"; // plain or custom
    }
  }

  private createWinstonLogger(): winston.Logger {
    // Create a custom format that includes timestamp and converts to JSON
    const customFormat = format.combine(
      format.timestamp(),
      format.json()
    );

    // Create a logger with console transport for now
    // We'll handle the file writing separately
    return winston.createLogger({
      level: 'info', // Set to info level as requested
      format: customFormat,
      transports: [
        new winston.transports.Console()
      ]
    });
  }

  async log(entry: NoteActivity) {
    try {
      // First log to Winston (which will output to console)
      this.winstonLogger.info('Activity logged', { entry });
      
      // Then write to the file using Obsidian's vault API
      const path = this.getLogFilePath();
      const file = await this.ensureFile(path);
      
      // Format the log entry
      const formattedEntry = this.format(entry);
      
      // Append to the file
      await this.vault.append(file, formattedEntry + "\n");
    } catch (e) {
      console.error("NoteActivityLogger: failed to write log", e);
    }
  }

  private format(e: NoteActivity): string {
    switch (this.settings.format) {
      case "csv":
        return `"${e.ts}","${e.event}","${e.file}"`;
      case "json":
        return JSON.stringify(e);
      case "custom":
        return this.settings.customFormat
          .replace(/%t/g, e.ts)
          .replace(/%e/g, e.event)
          .replace(/%f/g, e.file)
          .replace(/%%/g, "%");
      default:
        return `${e.ts} | ${e.event} | ${e.file}`;
    }
  }

  private async ensureFile(path: string): Promise<TFile> {
    // First check if the file already exists
    const existingFile = this.vault.getAbstractFileByPath(path);
    if (existingFile instanceof TFile) {
      return existingFile;
    }
    
    // If not, ensure the directory exists
    const dir = path.split("/").slice(0, -1).join("/");
    await this.vault.adapter.mkdir(normalizePath(dir));
    
    // Create the file
    return await this.vault.create(path, "");
  }
} 