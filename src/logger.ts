import { normalizePath, TFile, Vault } from "obsidian";
import { PluginSettings, NoteActivity } from "./types";
import * as winston from 'winston';

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
      return `${base}/log-${today}.log`;
    }
    return `${base}/activity.log`;
  }

  private createWinstonLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
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
      
      // Format the log entry as JSON
      const formattedEntry = JSON.stringify(entry);
      
      // Append to the file
      await this.vault.append(file, formattedEntry + "\n");
    } catch (e) {
      console.error("NoteActivityLogger: failed to write log", e);
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