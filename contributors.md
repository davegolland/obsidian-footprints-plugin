
---

## 🛠 Development Setup

```bash
npm install
npm run dev        # watches and rebuilds on change
npm run build       # production build
```

This project uses **TypeScript**, **Rollup**, and Obsidian’s official sample‑plugin scaffold.

---

## 🗺 Roadmap

1. **MVP (v0.1)**
    
    - Core event listeners for open/close/create/save.
        
    - Plain‑text logging.
        
    - Settings UI with toggles and path picker.
        
2. **v0.2**
    
    - CSV & JSON formats.
        
    - Daily log rotation.
        
3. **v0.3**
    
    - Extensible event registry (e.g., tag edit, backlink follow).
        
    - Command palette actions to open today’s log.
        
4. **v1.0**
    
    - Publish to Community Plugins.
        
    - Unit tests & CI.
        

---

## 🏗 Architecture Overview

```
src/
 ├─ main.ts            # Plugin entry – loads settings & wires modules
 ├─ settings.ts        # Setting tab UI & schema
 ├─ eventListeners.ts  # Subscribes to Obsidian events, emits internal events
 └─ logger.ts          # Formatting & file I/O
```

Each module exposes clean interfaces so new event types or formats can be added with minimal changes.

---

## 🤝 Contributing

Issues & PRs welcome! See **CONTRIBUTING.md**.

---

## 📜 License

MIT

---

# Task Breakdown

1. **Scaffold Project** – Clone Obsidian sample plugin, set up TypeScript, ESLint.
    
2. **Define Setting Schema** – interfaces & defaults.
    
3. **Build Settings Tab UI** – toggles, text inputs, dropdown.
    
4. **Implement Logger Module**
    
    - Path resolution & daily rotation.
        
    - Formatters for Plain/CSV/JSON.
        
5. **Implement Event Listeners** – register/unregister based on settings.
    
6. **Wire Up in main.ts** – load settings, instantiate logger & listeners.
    
7. **Add Commands & Ribbon Icon** _(optional v0.2)_.
    
8. **Testing & Linting**.
    
9. **Docs & README polish**.
    

Sequencing: 1 → 2 → 3 → 4 → 5 → 6 (then 7‑9).

---

# Implementation

Below we implement the MVP step‑by‑step.

## 1. `types.ts` – Shared Types

```ts
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
```

## 2. `logger.ts` – Logging Logic

```ts
import { normalizePath, TFile, Vault } from "obsidian";
import { PluginSettings, NoteActivity } from "./types";

export class Logger {
  private vault: Vault;
  private settings: PluginSettings;

  constructor(vault: Vault, settings: PluginSettings) {
    this.vault = vault;
    this.settings = settings;
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
    try {
      return await this.vault.adapter.read(path).then(() => this.vault.getAbstractFileByPath(path) as TFile);
    } catch {
      // file or folder may not exist
      const dir = path.split("/").slice(0, -1).join("/");
      await this.vault.adapter.mkdir(normalizePath(dir));
      return await this.vault.create(path, "");
    }
  }
}
```

## 3. `eventListeners.ts` – Event Subscriptions

```ts
import { App, WorkspaceLeaf, TFile } from "obsidian";
import { EventType, NoteActivity, PluginSettings } from "./types";
import { Logger } from "./logger";

export class ActivityWatcher {
  private app: App;
  private settings: PluginSettings;
  private logger: Logger;
  private detachFns: (() => void)[] = [];

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
      const off = workspace.on("file-close", (_leaf: WorkspaceLeaf, file: TFile) => {
        if (file) this.record("close", file);
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
    this.detachFns.forEach((off) => off());
    this.detachFns = [];
  }

  private record(type: EventType, file: TFile) {
    const entry: NoteActivity = {
      ts: new Date().toISOString(),
      event: type,
      file: file.path,
    };
    this.logger.log(entry);
  }
}
```

## 4. `settings.ts` – Settings Tab

```ts
import { App, PluginSettingTab, Setting } from "obsidian";
import { PluginSettings, DEFAULT_SETTINGS, LogFormat } from "./types";

export class NoteLoggerSettingTab extends PluginSettingTab {
  private plugin: any; // main plugin instance

  constructor(app: App, plugin: any) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Obsidian Footprints Settings" });

    new Setting(containerEl)
      .setName("Log Path")
      .setDesc("Relative or absolute path where logs are stored")
      .addText((txt) =>
        txt
          .setPlaceholder("Logs")
          .setValue(this.plugin.settings.logPath)
          .onChange(async (value) => {
            this.plugin.settings.logPath = value.trim() || "Logs";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Derive File Name From Date")
      .setDesc("Creates log-YYYY-MM-DD.* instead of a single file")
      .addToggle((tog) =>
        tog.setValue(this.plugin.settings.deriveNameFromDate).onChange(async (v) => {
          this.plugin.settings.deriveNameFromDate = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Log Format")
      .addDropdown((dd) =>
        dd
          .addOption("plain", "Plain Text")
          .addOption("csv", "CSV")
          .addOption("json", "JSON")
          .addOption("custom", "Custom")
          .setValue(this.plugin.settings.format)
          .onChange(async (v: LogFormat) => {
            this.plugin.settings.format = v;
            await this.plugin.saveSettings();
          })
      );

    // Custom format field (visible when using Custom format)
    new Setting(containerEl)
      .setName("Custom Format String")
      .setDesc("Printf‑style template. %t=timestamp, %e=event, %f=file")
      .addText((txt) =>
        txt
          .setPlaceholder("%t | %e | %f")
          .setValue(this.plugin.settings.customFormat)
          .onChange(async (value) => {
            this.plugin.settings.customFormat = value || "%t | %e | %f";
            await this.plugin.saveSettings();
          })
      );

    // Event toggles
    [
      ["trackOpen", "Track Open"],
      ["trackClose", "Track Close"],
      ["trackCreate", "Track Create"],
      ["trackSave", "Track Save"],
    ].forEach(([key, label]) => {
      new Setting(containerEl)
        .setName(label)
        .addToggle((tog) =>
          tog.setValue(this.plugin.settings[key]).onChange(async (v) => {
            this.plugin.settings[key] = v;
            await this.plugin.saveSettings();
          })
        );
    });
  }
}
```

## 5. `main.ts` – Plugin Entry

```ts
import { Plugin } from "obsidian";
import { PluginSettings, DEFAULT_SETTINGS } from "./types";
import { Logger } from "./logger";
import { ActivityWatcher } from "./eventListeners";
import { NoteLoggerSettingTab } from "./settings";

export default class NoteActivityLoggerPlugin extends Plugin {
  settings: PluginSettings;
  private logger: Logger;
  private watcher: ActivityWatcher;

  async onload() {
    await this.loadSettings();

    this.logger = new Logger(this.app.vault, this.settings);
    this.watcher = new ActivityWatcher(this.app, this.settings, this.logger);
    this.watcher.start();

    this.addSettingTab(new NoteLoggerSettingTab(this.app, this));
  }

  onunload() {
    this.watcher?.stop();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

---

🎉 **MVP complete!**

Next steps: implement CSV/JSON rotation (roadmap v0.2) and publish.