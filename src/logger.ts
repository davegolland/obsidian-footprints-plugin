import { normalizePath, TFile, Vault } from "obsidian";
import { PluginSettings, NoteActivity } from "./types";

export class Logger {
  private vault: Vault;
  private settings: PluginSettings;

  constructor(vault: Vault, settings: PluginSettings) {
    this.vault = vault;
    this.settings = settings;
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

  async log(entry: NoteActivity) {
    const path = this.getLogFilePath();
    const line = this.format(entry);
    try {
      const file = await this.ensureFile(path);
      await this.vault.append(file, line + "\n");
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