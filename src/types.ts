export type EventType = "open" | "close" | "create" | "save";

export interface NoteActivity {
  ts: string;       // ISO timestamp
  event: EventType;
  file: string;     // path within vault
}

export type LogFormat = "plain" | "csv" | "json" | "custom";

export interface PluginSettings {
  logPath: string;
  deriveNameFromDate: boolean;
  format: LogFormat;
  customFormat: string; // printf‑style template when format === "custom"
  trackOpen: boolean;
  trackClose: boolean;
  trackCreate: boolean;
  trackSave: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  logPath: "Logs",
  deriveNameFromDate: true,
  format: "plain",
  customFormat: "%t | %e | %f",
  trackOpen: true,
  trackClose: true,
  trackCreate: true,
  trackSave: true,
}; 