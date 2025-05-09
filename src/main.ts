/// <reference types="obsidian" />

import { Plugin } from "obsidian";
import { PluginSettings, DEFAULT_SETTINGS } from "./types";
import { Logger } from "./logger";
import { EventListeners } from "./eventListeners";
import { NoteLoggerSettingTab } from "./settings";

export default class NoteActivityLoggerPlugin extends Plugin {
  settings: PluginSettings;
  private logger: Logger;
  private watcher: EventListeners;

  async onload() {
    await this.loadSettings();

    this.logger = new Logger(this.app.vault, this.settings);
    this.watcher = new EventListeners(this.app, this.settings, this.logger, this);
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