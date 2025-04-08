import { App, PluginSettingTab, Setting } from "obsidian";
import { PluginSettings, DEFAULT_SETTINGS, LogFormat } from "./types";
import NoteActivityLoggerPlugin from "./main";

export class NoteLoggerSettingTab extends PluginSettingTab {
  private plugin: NoteActivityLoggerPlugin;

  constructor(app: App, plugin: NoteActivityLoggerPlugin) {
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
    const toggleSettings = [
      { key: "trackOpen" as const, label: "Track Open" },
      { key: "trackClose" as const, label: "Track Close" },
      { key: "trackCreate" as const, label: "Track Create" },
      { key: "trackSave" as const, label: "Track Save" },
    ];

    toggleSettings.forEach(({ key, label }) => {
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