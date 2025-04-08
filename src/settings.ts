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

    // General Settings
    containerEl.createEl("h3", { text: "General Settings" });

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

    new Setting(containerEl)
      .setName("Custom Format String")
      .setDesc("Printf‑style template. %t=timestamp, %e=event, %f=file, %d=details")
      .addText((txt) =>
        txt
          .setPlaceholder("%t | %e | %f | %d")
          .setValue(this.plugin.settings.customFormat)
          .onChange(async (value) => {
            this.plugin.settings.customFormat = value || "%t | %e | %f | %d";
            await this.plugin.saveSettings();
          })
      );

    // MetadataCache events
    containerEl.createEl("h3", { text: "MetadataCache Events" });
    containerEl.createEl("p", { text: "Events related to file metadata indexing and caching" });
    
    new Setting(containerEl)
      .setName("Track All Metadata Events")
      .setDesc("Toggle all metadata events at once")
      .addToggle((tog) => {
        const allEnabled = this.areAllSettingsEnabled([
          'trackMetadataChanged',
          'trackMetadataDeleted',
          'trackMetadataResolve',
          'trackMetadataResolved'
        ]);
        tog.setValue(allEnabled).onChange(async (v) => {
          await this.toggleSettingsGroup([
            'trackMetadataChanged',
            'trackMetadataDeleted',
            'trackMetadataResolve',
            'trackMetadataResolved'
          ], v);
        });
      });
    const metadataEvents = [
      { 
        key: "trackMetadataChanged" as const, 
        label: "Track Metadata Changed",
        desc: "Called when a file has been indexed, and its (updated) cache is now available. Parameters: file, data, cache"
      },
      { 
        key: "trackMetadataDeleted" as const, 
        label: "Track Metadata Deleted",
        desc: "Called when a file has been deleted. Parameters: file, prevCache"
      },
      { 
        key: "trackMetadataResolve" as const, 
        label: "Track Metadata Resolve",
        desc: "Called when a file has been resolved for resolvedLinks and unresolvedLinks. Parameters: file"
      },
      { 
        key: "trackMetadataResolved" as const, 
        label: "Track Metadata Resolved",
        desc: "Called when all files have been resolved. Parameters: none"
      },
    ];
    this.addToggleSettings(containerEl, metadataEvents);

    // Vault events
    containerEl.createEl("h3", { text: "Vault Events" });
    containerEl.createEl("p", { text: "Events related to file operations in the vault" });
    
    new Setting(containerEl)
      .setName("Track All Vault Events")
      .setDesc("Toggle all vault events at once")
      .addToggle((tog) => {
        const allEnabled = this.areAllSettingsEnabled([
          'trackVaultCreate',
          'trackVaultModify',
          'trackVaultDelete',
          'trackVaultRename'
        ]);
        tog.setValue(allEnabled).onChange(async (v) => {
          await this.toggleSettingsGroup([
            'trackVaultCreate',
            'trackVaultModify',
            'trackVaultDelete',
            'trackVaultRename'
          ], v);
        });
      });
    const vaultEvents = [
      { 
        key: "trackVaultCreate" as const, 
        label: "Track Vault Create",
        desc: "Called when a file is created. Also called for each existing file when the vault is first loaded. Parameters: file"
      },
      { 
        key: "trackVaultModify" as const, 
        label: "Track Vault Modify",
        desc: "Called when a file is modified. Parameters: file"
      },
      { 
        key: "trackVaultDelete" as const, 
        label: "Track Vault Delete",
        desc: "Called when a file is deleted. Parameters: file"
      },
      { 
        key: "trackVaultRename" as const, 
        label: "Track Vault Rename",
        desc: "Called when a file is renamed. Parameters: file, oldPath"
      },
    ];
    this.addToggleSettings(containerEl, vaultEvents);

    // Workspace events
    containerEl.createEl("h3", { text: "Workspace Events" });
    containerEl.createEl("p", { text: "Events related to workspace interactions and UI changes" });
    
    new Setting(containerEl)
      .setName("Track All Workspace Events")
      .setDesc("Toggle all workspace events at once")
      .addToggle((tog) => {
        const allEnabled = this.areAllSettingsEnabled([
          'trackWorkspaceQuickPreview',
          'trackWorkspaceResize',
          'trackWorkspaceActiveLeafChange',
          'trackWorkspaceFileOpen',
          'trackWorkspaceLayoutChange',
          'trackWorkspaceWindowOpen',
          'trackWorkspaceWindowClose',
          'trackWorkspaceCssChange',
          'trackWorkspaceFileMenu',
          'trackWorkspaceFilesMenu',
          'trackWorkspaceUrlMenu',
          'trackWorkspaceEditorMenu',
          'trackWorkspaceEditorChange',
          'trackWorkspaceEditorPaste',
          'trackWorkspaceEditorDrop',
          'trackWorkspaceQuit'
        ]);
        tog.setValue(allEnabled).onChange(async (v) => {
          await this.toggleSettingsGroup([
            'trackWorkspaceQuickPreview',
            'trackWorkspaceResize',
            'trackWorkspaceActiveLeafChange',
            'trackWorkspaceFileOpen',
            'trackWorkspaceLayoutChange',
            'trackWorkspaceWindowOpen',
            'trackWorkspaceWindowClose',
            'trackWorkspaceCssChange',
            'trackWorkspaceFileMenu',
            'trackWorkspaceFilesMenu',
            'trackWorkspaceUrlMenu',
            'trackWorkspaceEditorMenu',
            'trackWorkspaceEditorChange',
            'trackWorkspaceEditorPaste',
            'trackWorkspaceEditorDrop',
            'trackWorkspaceQuit'
          ], v);
        });
      });
    const workspaceEvents = [
      { 
        key: "trackWorkspaceQuickPreview" as const, 
        label: "Track Quick Preview",
        desc: "Triggered when the active Markdown file is modified. Parameters: file, data"
      },
      { 
        key: "trackWorkspaceResize" as const, 
        label: "Track Resize",
        desc: "Triggered when a WorkspaceItem is resized or the workspace layout has changed. Parameters: none"
      },
      { 
        key: "trackWorkspaceActiveLeafChange" as const, 
        label: "Track Active Leaf Change",
        desc: "Triggered when the active leaf (tab or pane) changes. Parameters: leaf"
      },
      { 
        key: "trackWorkspaceFileOpen" as const, 
        label: "Track File Open",
        desc: "Triggered when the active file changes. Parameters: file"
      },
      { 
        key: "trackWorkspaceLayoutChange" as const, 
        label: "Track Layout Change",
        desc: "Triggered when the workspace layout changes. Parameters: none"
      },
      { 
        key: "trackWorkspaceWindowOpen" as const, 
        label: "Track Window Open",
        desc: "Triggered when a new popout window is created. Parameters: win, window"
      },
      { 
        key: "trackWorkspaceWindowClose" as const, 
        label: "Track Window Close",
        desc: "Triggered when a popout window is closed. Parameters: win, window"
      },
      { 
        key: "trackWorkspaceCssChange" as const, 
        label: "Track CSS Change",
        desc: "Triggered when the CSS of the app has changed. Parameters: none"
      },
      { 
        key: "trackWorkspaceFileMenu" as const, 
        label: "Track File Menu",
        desc: "Triggered when the user opens the context menu on a file. Parameters: menu, file, source, leaf"
      },
      { 
        key: "trackWorkspaceFilesMenu" as const, 
        label: "Track Files Menu",
        desc: "Triggered when the user opens the context menu with multiple files selected. Parameters: menu, files, source, leaf"
      },
      { 
        key: "trackWorkspaceUrlMenu" as const, 
        label: "Track URL Menu",
        desc: "Triggered when the user opens the context menu on an external URL. Parameters: menu, url"
      },
      { 
        key: "trackWorkspaceEditorMenu" as const, 
        label: "Track Editor Menu",
        desc: "Triggered when the user opens the context menu on an editor. Parameters: menu, editor, info"
      },
      { 
        key: "trackWorkspaceEditorChange" as const, 
        label: "Track Editor Change",
        desc: "Triggered when changes to an editor have been applied. Parameters: editor, info"
      },
      { 
        key: "trackWorkspaceEditorPaste" as const, 
        label: "Track Editor Paste",
        desc: "Triggered when the editor receives a paste event. Parameters: evt, editor, info"
      },
      { 
        key: "trackWorkspaceEditorDrop" as const, 
        label: "Track Editor Drop",
        desc: "Triggered when the editor receives a drop event. Parameters: evt, editor, info"
      },
      { 
        key: "trackWorkspaceQuit" as const, 
        label: "Track Quit",
        desc: "Triggered when the app is about to quit. Parameters: tasks"
      },
    ];
    this.addToggleSettings(containerEl, workspaceEvents);

    // WorkspaceLeaf events
    containerEl.createEl("h3", { text: "WorkspaceLeaf Events" });
    containerEl.createEl("p", { text: "Events related to workspace leaf (tab) changes" });
    
    new Setting(containerEl)
      .setName("Track All Leaf Events")
      .setDesc("Toggle all leaf events at once")
      .addToggle((tog) => {
        const allEnabled = this.areAllSettingsEnabled([
          'trackLeafPinnedChange',
          'trackLeafGroupChange'
        ]);
        tog.setValue(allEnabled).onChange(async (v) => {
          await this.toggleSettingsGroup([
            'trackLeafPinnedChange',
            'trackLeafGroupChange'
          ], v);
        });
      });
    const leafEvents = [
      { 
        key: "trackLeafPinnedChange" as const, 
        label: "Track Leaf Pinned Change",
        desc: "Triggered when a workspace leaf (tab) is pinned or unpinned. Parameters: pinned"
      },
      { 
        key: "trackLeafGroupChange" as const, 
        label: "Track Leaf Group Change",
        desc: "Triggered when a workspace leaf's group changes. Parameters: group"
      },
    ];
    this.addToggleSettings(containerEl, leafEvents);

    // Publish events
    containerEl.createEl("h3", { text: "Publish Events" });
    containerEl.createEl("p", { text: "Events related to Obsidian Publish" });
    
    new Setting(containerEl)
      .setName("Track All Publish Events")
      .setDesc("Toggle all publish events at once")
      .addToggle((tog) => {
        const allEnabled = this.areAllSettingsEnabled([
          'trackPublishNavigated'
        ]);
        tog.setValue(allEnabled).onChange(async (v) => {
          await this.toggleSettingsGroup([
            'trackPublishNavigated'
          ], v);
        });
      });
    const publishEvents = [
      { 
        key: "trackPublishNavigated" as const, 
        label: "Track Publish Navigated",
        desc: "Triggered when navigation occurs in Publish. Parameters: none"
      },
    ];
    this.addToggleSettings(containerEl, publishEvents);

    // Menu events
    containerEl.createEl("h3", { text: "Menu Events" });
    containerEl.createEl("p", { text: "Events related to menu interactions" });
    
    new Setting(containerEl)
      .setName("Track All Menu Events")
      .setDesc("Toggle all menu events at once")
      .addToggle((tog) => {
        const allEnabled = this.areAllSettingsEnabled([
          'trackMenuHide'
        ]);
        tog.setValue(allEnabled).onChange(async (v) => {
          await this.toggleSettingsGroup([
            'trackMenuHide'
          ], v);
        });
      });
    const menuEvents = [
      { 
        key: "trackMenuHide" as const, 
        label: "Track Menu Hide",
        desc: "Called after a menu is hidden. Parameters: none"
      },
    ];
    this.addToggleSettings(containerEl, menuEvents);
  }

  private addToggleSettings(containerEl: HTMLElement, settings: { key: keyof PluginSettings, label: string, desc: string }[]) {
    settings.forEach(({ key, label, desc }) => {
      new Setting(containerEl)
        .setName(label)
        .setDesc(desc)
        .addToggle((tog) =>
          tog.setValue(this.plugin.settings[key] as boolean).onChange(async (v) => {
            (this.plugin.settings[key] as boolean) = v;
            await this.plugin.saveSettings();
          })
        );
    });
  }

  private areAllSettingsEnabled(keys: (keyof PluginSettings)[]): boolean {
    return keys.every(key => this.plugin.settings[key] === true);
  }

  private async toggleSettingsGroup(keys: (keyof PluginSettings)[], value: boolean) {
    keys.forEach(key => {
      (this.plugin.settings[key] as boolean) = value;
    });
    await this.plugin.saveSettings();
    // Refresh the settings UI to reflect the changes
    this.display();
  }
} 