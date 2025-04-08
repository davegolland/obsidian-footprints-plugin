import { App, WorkspaceLeaf, TFile, EventRef } from "obsidian";
import { EventType, NoteActivity, PluginSettings } from "./types";
import { Logger } from "./logger";

export class ActivityWatcher {
  private app: App;
  private settings: PluginSettings;
  private logger: Logger;
  private detachFns: EventRef[] = [];

  constructor(app: App, settings: PluginSettings, logger: Logger) {
    this.app = app;
    this.settings = settings;
    this.logger = logger;
  }

  start() {
    const { workspace, vault } = this.app;

    // Open
    if (this.settings.trackOpen) {
      const off = workspace.on("file-open", (file: TFile | null) => {
        if (file) this.record("open", file);
      });
      this.detachFns.push(off);
    }

    // Close
    if (this.settings.trackClose) {
      const off = workspace.on("active-leaf-change", (leaf: WorkspaceLeaf | null) => {
        const file = leaf?.view?.getState()?.file;
        if (file && file instanceof TFile) {
          this.record("close", file);
        }
      });
      this.detachFns.push(off);
    }

    // Create
    if (this.settings.trackCreate) {
      const off = vault.on("create", (file: TFile) => {
        this.record("create", file);
      });
      this.detachFns.push(off);
    }

    // Save
    if (this.settings.trackSave) {
      const off = vault.on("modify", (file: TFile) => {
        this.record("save", file);
      });
      this.detachFns.push(off);
    }
  }

  stop() {
    this.detachFns.forEach((off) => {
      if (off && typeof off === 'object' && 'unload' in off) {
        (off as any).unload();
      }
    });
    this.detachFns = [];
  }

  private record(type: EventType, file: TFile) {
    // Skip logging if the file is the current log file
    const currentLogPath = this.logger.getCurrentLogFilePath();
    if (file.path === currentLogPath) {
      return;
    }
    
    const entry: NoteActivity = {
      ts: new Date().toISOString(),
      event: type,
      file: file.path,
    };
    this.logger.log(entry);
  }
} 