import { App, PluginSettingTab, Setting } from "obsidian";
import { PluginSettings, DEFAULT_SETTINGS, LogFormat, EventParameterConfig, ParameterConfig } from "./types";
import NoteActivityLoggerPlugin from "./main";

export class NoteLoggerSettingTab extends PluginSettingTab {
  private plugin: NoteActivityLoggerPlugin;
  private expandedSections: Record<string, boolean> = {
    general: true,
    metadata: false,
    vault: false,
    workspace: false,
    leaf: false,
    publish: false,
    menu: false
  };
  private expandedParameterSections: Record<string, boolean> = {};

  constructor(app: App, plugin: NoteActivityLoggerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Obsidian Footprints Settings" });

    // General Settings
    this.createCollapsibleSection(containerEl, "general", "General Settings", (contentContainer) => {
      new Setting(contentContainer)
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

      new Setting(contentContainer)
        .setName("Derive File Name From Date")
        .setDesc("Creates log-YYYY-MM-DD.* instead of a single file")
        .addToggle((tog) =>
          tog.setValue(this.plugin.settings.deriveNameFromDate).onChange(async (v) => {
            this.plugin.settings.deriveNameFromDate = v;
            await this.plugin.saveSettings();
          })
        );

      new Setting(contentContainer)
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

      new Setting(contentContainer)
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
    });

    // MetadataCache events
    this.createCollapsibleSection(containerEl, "metadata", "MetadataCache Events", (contentContainer) => {
      contentContainer.createEl("p", { text: "Events related to file metadata indexing and caching" });
      
      // Create a container for the master toggle with special styling
      const metadataMasterContainer = contentContainer.createDiv({ cls: "master-toggle-container" });
      metadataMasterContainer.style.border = "1px solid var(--background-modifier-border)";
      metadataMasterContainer.style.borderRadius = "4px";
      metadataMasterContainer.style.padding = "8px";
      metadataMasterContainer.style.marginBottom = "16px";
      metadataMasterContainer.style.backgroundColor = "var(--background-secondary)";
      
      new Setting(metadataMasterContainer)
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
      
      // Create a container for individual toggles with indentation
      const metadataTogglesContainer = contentContainer.createDiv({ cls: "individual-toggles-container" });
      metadataTogglesContainer.style.paddingLeft = "16px";
      
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
      this.addToggleSettings(metadataTogglesContainer, metadataEvents);
      
      // Add parameter configuration UI
      this.addParameterConfigUI(contentContainer, "metadata", [
        "trackMetadataChanged",
        "trackMetadataDeleted",
        "trackMetadataResolve",
        "trackMetadataResolved"
      ]);
    });

    // Vault events
    this.createCollapsibleSection(containerEl, "vault", "Vault Events", (contentContainer) => {
      contentContainer.createEl("p", { text: "Events related to file operations in the vault" });
      
      // Create a container for the master toggle with special styling
      const vaultMasterContainer = contentContainer.createDiv({ cls: "master-toggle-container" });
      vaultMasterContainer.style.border = "1px solid var(--background-modifier-border)";
      vaultMasterContainer.style.borderRadius = "4px";
      vaultMasterContainer.style.padding = "8px";
      vaultMasterContainer.style.marginBottom = "16px";
      vaultMasterContainer.style.backgroundColor = "var(--background-secondary)";
      
      new Setting(vaultMasterContainer)
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
      
      // Create a container for individual toggles with indentation
      const vaultTogglesContainer = contentContainer.createDiv({ cls: "individual-toggles-container" });
      vaultTogglesContainer.style.paddingLeft = "16px";
      
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
      this.addToggleSettings(vaultTogglesContainer, vaultEvents);
      
      // Add parameter configuration UI
      this.addParameterConfigUI(contentContainer, "vault", [
        "trackVaultCreate",
        "trackVaultModify",
        "trackVaultDelete",
        "trackVaultRename"
      ]);
    });

    // Workspace events
    this.createCollapsibleSection(containerEl, "workspace", "Workspace Events", (contentContainer) => {
      contentContainer.createEl("p", { text: "Events related to workspace interactions and UI changes" });
      
      // Create a container for the master toggle with special styling
      const workspaceMasterContainer = contentContainer.createDiv({ cls: "master-toggle-container" });
      workspaceMasterContainer.style.border = "1px solid var(--background-modifier-border)";
      workspaceMasterContainer.style.borderRadius = "4px";
      workspaceMasterContainer.style.padding = "8px";
      workspaceMasterContainer.style.marginBottom = "16px";
      workspaceMasterContainer.style.backgroundColor = "var(--background-secondary)";
      
      new Setting(workspaceMasterContainer)
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
      
      // Create a container for individual toggles with indentation
      const workspaceTogglesContainer = contentContainer.createDiv({ cls: "individual-toggles-container" });
      workspaceTogglesContainer.style.paddingLeft = "16px";
      
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
      this.addToggleSettings(workspaceTogglesContainer, workspaceEvents);
      
      // Add parameter configuration UI
      this.addParameterConfigUI(contentContainer, "workspace", [
        "trackWorkspaceQuickPreview",
        "trackWorkspaceResize",
        "trackWorkspaceActiveLeafChange",
        "trackWorkspaceFileOpen",
        "trackWorkspaceLayoutChange",
        "trackWorkspaceWindowOpen",
        "trackWorkspaceWindowClose",
        "trackWorkspaceCssChange",
        "trackWorkspaceFileMenu",
        "trackWorkspaceFilesMenu",
        "trackWorkspaceUrlMenu",
        "trackWorkspaceEditorMenu",
        "trackWorkspaceEditorChange",
        "trackWorkspaceEditorPaste",
        "trackWorkspaceEditorDrop",
        "trackWorkspaceQuit"
      ]);
    });

    // WorkspaceLeaf events
    this.createCollapsibleSection(containerEl, "leaf", "WorkspaceLeaf Events", (contentContainer) => {
      contentContainer.createEl("p", { text: "Events related to workspace leaf (tab) changes" });
      
      // Create a container for the master toggle with special styling
      const leafMasterContainer = contentContainer.createDiv({ cls: "master-toggle-container" });
      leafMasterContainer.style.border = "1px solid var(--background-modifier-border)";
      leafMasterContainer.style.borderRadius = "4px";
      leafMasterContainer.style.padding = "8px";
      leafMasterContainer.style.marginBottom = "16px";
      leafMasterContainer.style.backgroundColor = "var(--background-secondary)";
      
      new Setting(leafMasterContainer)
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
      
      // Create a container for individual toggles with indentation
      const leafTogglesContainer = contentContainer.createDiv({ cls: "individual-toggles-container" });
      leafTogglesContainer.style.paddingLeft = "16px";
      
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
      this.addToggleSettings(leafTogglesContainer, leafEvents);
      
      // Add parameter configuration UI
      this.addParameterConfigUI(contentContainer, "leaf", [
        "trackLeafPinnedChange",
        "trackLeafGroupChange"
      ]);
    });

    // Publish events
    this.createCollapsibleSection(containerEl, "publish", "Publish Events", (contentContainer) => {
      contentContainer.createEl("p", { text: "Events related to Obsidian Publish" });
      
      // Create a container for the master toggle with special styling
      const publishMasterContainer = contentContainer.createDiv({ cls: "master-toggle-container" });
      publishMasterContainer.style.border = "1px solid var(--background-modifier-border)";
      publishMasterContainer.style.borderRadius = "4px";
      publishMasterContainer.style.padding = "8px";
      publishMasterContainer.style.marginBottom = "16px";
      publishMasterContainer.style.backgroundColor = "var(--background-secondary)";
      
      new Setting(publishMasterContainer)
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
      
      // Create a container for individual toggles with indentation
      const publishTogglesContainer = contentContainer.createDiv({ cls: "individual-toggles-container" });
      publishTogglesContainer.style.paddingLeft = "16px";
      
      const publishEvents = [
        { 
          key: "trackPublishNavigated" as const, 
          label: "Track Publish Navigated",
          desc: "Triggered when navigation occurs in Publish. Parameters: none"
        },
      ];
      this.addToggleSettings(publishTogglesContainer, publishEvents);
      
      // Add parameter configuration UI
      this.addParameterConfigUI(contentContainer, "publish", [
        "trackPublishNavigated"
      ]);
    });

    // Menu events
    this.createCollapsibleSection(containerEl, "menu", "Menu Events", (contentContainer) => {
      contentContainer.createEl("p", { text: "Events related to menu interactions" });
      
      // Create a container for the master toggle with special styling
      const menuMasterContainer = contentContainer.createDiv({ cls: "master-toggle-container" });
      menuMasterContainer.style.border = "1px solid var(--background-modifier-border)";
      menuMasterContainer.style.borderRadius = "4px";
      menuMasterContainer.style.padding = "8px";
      menuMasterContainer.style.marginBottom = "16px";
      menuMasterContainer.style.backgroundColor = "var(--background-secondary)";
      
      new Setting(menuMasterContainer)
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
      
      // Create a container for individual toggles with indentation
      const menuTogglesContainer = contentContainer.createDiv({ cls: "individual-toggles-container" });
      menuTogglesContainer.style.paddingLeft = "16px";
      
      const menuEvents = [
        { 
          key: "trackMenuHide" as const, 
          label: "Track Menu Hide",
          desc: "Called after a menu is hidden. Parameters: none"
        },
      ];
      this.addToggleSettings(menuTogglesContainer, menuEvents);
      
      // Add parameter configuration UI
      this.addParameterConfigUI(contentContainer, "menu", [
        "trackMenuHide"
      ]);
    });
  }

  private createCollapsibleSection(containerEl: HTMLElement, sectionId: string, title: string, contentFn: (contentContainer: HTMLElement) => void) {
    // Create section header with toggle button
    const sectionHeader = containerEl.createDiv({ cls: "section-header" });
    sectionHeader.style.display = "flex";
    sectionHeader.style.alignItems = "center";
    sectionHeader.style.cursor = "pointer";
    sectionHeader.style.padding = "8px 0";
    sectionHeader.style.marginTop = "16px";
    
    // Create toggle icon
    const toggleIcon = sectionHeader.createDiv({ cls: "section-toggle" });
    toggleIcon.style.marginRight = "8px";
    toggleIcon.style.width = "16px";
    toggleIcon.style.height = "16px";
    toggleIcon.style.display = "flex";
    toggleIcon.style.alignItems = "center";
    toggleIcon.style.justifyContent = "center";
    toggleIcon.innerHTML = this.expandedSections[sectionId] ? "▼" : "▶";
    
    // Create section title
    const sectionTitle = sectionHeader.createEl("h3", { text: title });
    sectionTitle.style.margin = "0";
    
    // Create content container
    const contentContainer = containerEl.createDiv({ cls: "section-content" });
    contentContainer.style.display = this.expandedSections[sectionId] ? "block" : "none";
    
    // Add click handler to toggle section
    sectionHeader.addEventListener("click", () => {
      this.expandedSections[sectionId] = !this.expandedSections[sectionId];
      toggleIcon.innerHTML = this.expandedSections[sectionId] ? "▼" : "▶";
      contentContainer.style.display = this.expandedSections[sectionId] ? "block" : "none";
    });
    
    // Add content to the container
    contentFn(contentContainer);
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

  private addParameterConfigUI(containerEl: HTMLElement, sectionId: string, eventKeys: string[]) {
    // Create a container for parameter configuration
    const paramConfigContainer = containerEl.createDiv({ cls: "parameter-config-container" });
    paramConfigContainer.style.marginTop = "16px";
    paramConfigContainer.style.padding = "8px";
    paramConfigContainer.style.border = "1px solid var(--background-modifier-border)";
    paramConfigContainer.style.borderRadius = "4px";
    
    // Create a header for parameter configuration
    const paramConfigHeader = paramConfigContainer.createDiv({ cls: "parameter-config-header" });
    paramConfigHeader.style.display = "flex";
    paramConfigHeader.style.alignItems = "center";
    paramConfigHeader.style.cursor = "pointer";
    paramConfigHeader.style.padding = "8px 0";
    
    // Create toggle icon
    const toggleIcon = paramConfigHeader.createDiv({ cls: "parameter-toggle" });
    toggleIcon.style.marginRight = "8px";
    toggleIcon.style.width = "16px";
    toggleIcon.style.height = "16px";
    toggleIcon.style.display = "flex";
    toggleIcon.style.alignItems = "center";
    toggleIcon.style.justifyContent = "center";
    toggleIcon.innerHTML = this.expandedParameterSections[sectionId] ? "▼" : "▶";
    
    // Create section title
    const sectionTitle = paramConfigHeader.createEl("h4", { text: "Parameter Configuration" });
    sectionTitle.style.margin = "0";
    
    // Create content container
    const paramContentContainer = paramConfigContainer.createDiv({ cls: "parameter-content" });
    paramContentContainer.style.display = this.expandedParameterSections[sectionId] ? "block" : "none";
    
    // Add click handler to toggle section
    paramConfigHeader.addEventListener("click", () => {
      this.expandedParameterSections[sectionId] = !this.expandedParameterSections[sectionId];
      toggleIcon.innerHTML = this.expandedParameterSections[sectionId] ? "▼" : "▶";
      paramContentContainer.style.display = this.expandedParameterSections[sectionId] ? "block" : "none";
    });
    
    // Add parameter configuration for each event
    eventKeys.forEach(eventKey => {
      const eventConfig = this.plugin.settings.parameterConfigs[eventKey] || {};
      const eventContainer = paramContentContainer.createDiv({ cls: "event-param-container" });
      eventContainer.style.marginBottom = "16px";
      eventContainer.style.padding = "8px";
      eventContainer.style.backgroundColor = "var(--background-secondary)";
      eventContainer.style.borderRadius = "4px";
      
      // Event title
      eventContainer.createEl("h5", { text: this.formatEventName(eventKey) });
      
      // Parameter toggles
      const paramKeys = Object.keys(eventConfig) as (keyof EventParameterConfig)[];
      if (paramKeys.length === 0) {
        eventContainer.createEl("p", { text: "No parameters available for this event." });
      } else {
        paramKeys.forEach(paramKey => {
          const paramConfig = eventConfig[paramKey] || { enabled: false };
          const paramContainer = eventContainer.createDiv({ cls: "param-toggle-container" });
          paramContainer.style.marginLeft = "16px";
          paramContainer.style.marginBottom = "8px";
          
          // Parameter toggle
          new Setting(paramContainer)
            .setName(this.formatParamName(paramKey))
            .setDesc(`Enable/disable logging of the ${this.formatParamName(paramKey)} parameter`)
            .addToggle((tog) => {
              tog.setValue(paramConfig.enabled).onChange(async (value) => {
                if (!this.plugin.settings.parameterConfigs) {
                  this.plugin.settings.parameterConfigs = {};
                }
                if (!this.plugin.settings.parameterConfigs[eventKey]) {
                  this.plugin.settings.parameterConfigs[eventKey] = {};
                }
                if (!this.plugin.settings.parameterConfigs[eventKey][paramKey]) {
                  this.plugin.settings.parameterConfigs[eventKey][paramKey] = { enabled: false };
                }
                // Now we can safely access the nested properties
                const config = this.plugin.settings.parameterConfigs[eventKey][paramKey];
                if (config) {
                  config.enabled = value;
                }
                await this.plugin.saveSettings();
              });
            });
          
          // Include type toggle (only if parameter is enabled)
          if (paramConfig.enabled) {
            const typeContainer = eventContainer.createDiv({ cls: "param-type-container" });
            typeContainer.style.marginLeft = "32px";
            typeContainer.style.marginBottom = "8px";
            
            new Setting(typeContainer)
              .setName("Include Type")
              .setDesc(`Include the type information for ${this.formatParamName(paramKey)} in logs`)
              .addToggle((tog) => {
                tog.setValue(paramConfig.includeType || false).onChange(async (value) => {
                  if (!this.plugin.settings.parameterConfigs) {
                    this.plugin.settings.parameterConfigs = {};
                  }
                  if (!this.plugin.settings.parameterConfigs[eventKey]) {
                    this.plugin.settings.parameterConfigs[eventKey] = {};
                  }
                  if (!this.plugin.settings.parameterConfigs[eventKey][paramKey]) {
                    this.plugin.settings.parameterConfigs[eventKey][paramKey] = { enabled: true };
                  }
                  // Now we can safely access the nested properties
                  const config = this.plugin.settings.parameterConfigs[eventKey][paramKey];
                  if (config) {
                    config.includeType = value;
                  }
                  await this.plugin.saveSettings();
                });
              });
          }
        });
      }
    });
  }

  private formatEventName(eventKey: string): string {
    // Convert camelCase to Title Case with spaces
    return eventKey
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/track/i, '') // Remove "track" prefix
      .trim();
  }

  private formatParamName(paramKey: string): string {
    // Convert camelCase to Title Case with spaces
    return paramKey
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
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