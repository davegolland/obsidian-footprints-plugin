import { App, WorkspaceLeaf, TFile, EventRef, Menu, Editor, EditorPosition, EditorSuggestContext, MarkdownView, MenuItem, TAbstractFile, CachedMetadata, WorkspaceWindow, MarkdownFileInfo } from "obsidian";
import { EventType, NoteActivity, PluginSettings, EventParameterConfig } from "./types";
import { Logger } from "./logger";

export class EventListeners {
  private app: App;
  private settings: PluginSettings;
  private logger: Logger;
  private plugin: any;

  constructor(app: App, settings: PluginSettings, logger: Logger, plugin: any) {
    this.app = app;
    this.settings = settings;
    this.logger = logger;
    this.plugin = plugin;
  }

  start() {
    this.setupMetadataCacheEvents();
    this.setupVaultEvents();
    this.setupWorkspaceEvents();
    this.setupLeafEvents();
    this.setupPublishEvents();
    this.setupMenuEvents();
  }

  private setupMetadataCacheEvents() {
    if (this.settings.trackMetadataChanged) {
      this.plugin.registerEvent(
        this.app.metadataCache.on("changed", (file: TFile, data: string, cache: CachedMetadata) => {
          this.logEvent("metadata-changed", { file, data, cache });
        })
      );
    }

    if (this.settings.trackMetadataDeleted) {
      this.plugin.registerEvent(
        this.app.metadataCache.on("deleted", (file: TFile, prevCache: CachedMetadata | null) => {
          this.logEvent("metadata-deleted", { file, prevCache });
        })
      );
    }

    if (this.settings.trackMetadataResolve) {
      this.plugin.registerEvent(
        this.app.metadataCache.on("resolve", (file: TFile) => {
          this.logEvent("metadata-resolve", { file });
        })
      );
    }

    if (this.settings.trackMetadataResolved) {
      this.plugin.registerEvent(
        this.app.metadataCache.on("resolved", () => {
          this.logEvent("metadata-resolved");
        })
      );
    }
  }

  private setupVaultEvents() {
    if (this.settings.trackVaultCreate) {
      this.plugin.registerEvent(
        this.app.vault.on("create", (file: TAbstractFile) => {
          this.logEvent("vault-create", { file });
        })
      );
    }

    if (this.settings.trackVaultModify) {
      this.plugin.registerEvent(
        this.app.vault.on("modify", (file: TAbstractFile) => {
          this.logEvent("vault-modify", { file });
        })
      );
    }

    if (this.settings.trackVaultDelete) {
      this.plugin.registerEvent(
        this.app.vault.on("delete", (file: TAbstractFile) => {
          this.logEvent("vault-delete", { file });
        })
      );
    }

    if (this.settings.trackVaultRename) {
      this.plugin.registerEvent(
        this.app.vault.on("rename", (file: TAbstractFile, oldPath: string) => {
          this.logEvent("vault-rename", { file, oldPath });
        })
      );
    }
  }

  private setupWorkspaceEvents() {
    if (this.settings.trackWorkspaceQuickPreview) {
      this.plugin.registerEvent(
        this.app.workspace.on("quick-preview", (file: TFile, data: string) => {
          this.logEvent("workspace-quick-preview", { file, data });
        })
      );
    }

    if (this.settings.trackWorkspaceResize) {
      this.plugin.registerEvent(
        this.app.workspace.on("resize", () => {
          this.logEvent("workspace-resize");
        })
      );
    }

    if (this.settings.trackWorkspaceActiveLeafChange) {
      this.plugin.registerEvent(
        this.app.workspace.on("active-leaf-change", (leaf: WorkspaceLeaf | null) => {
          this.logEvent("workspace-active-leaf-change", { leaf });
        })
      );
    }

    if (this.settings.trackWorkspaceFileOpen) {
      this.plugin.registerEvent(
        this.app.workspace.on("file-open", (file: TFile | null) => {
          this.logEvent("workspace-file-open", { file });
        })
      );
    }

    if (this.settings.trackWorkspaceLayoutChange) {
      this.plugin.registerEvent(
        this.app.workspace.on("layout-change", () => {
          this.logEvent("workspace-layout-change");
        })
      );
    }

    if (this.settings.trackWorkspaceWindowOpen) {
      this.plugin.registerEvent(
        this.app.workspace.on("window-open", (win: WorkspaceWindow, window: Window) => {
          this.logEvent("workspace-window-open", { win, window });
        })
      );
    }

    if (this.settings.trackWorkspaceWindowClose) {
      this.plugin.registerEvent(
        this.app.workspace.on("window-close", (win: WorkspaceWindow, window: Window) => {
          this.logEvent("workspace-window-close", { win, window });
        })
      );
    }

    if (this.settings.trackWorkspaceCssChange) {
      this.plugin.registerEvent(
        this.app.workspace.on("css-change", () => {
          this.logEvent("workspace-css-change");
        })
      );
    }

    if (this.settings.trackWorkspaceFileMenu) {
      this.plugin.registerEvent(
        this.app.workspace.on("file-menu", (menu: Menu, file: TAbstractFile, source: string, leaf?: WorkspaceLeaf) => {
          this.logEvent("workspace-file-menu", { menu, file, source, leaf });
        })
      );
    }

    if (this.settings.trackWorkspaceFilesMenu) {
      this.plugin.registerEvent(
        this.app.workspace.on("files-menu", (menu: Menu, files: TAbstractFile[], source: string, leaf?: WorkspaceLeaf) => {
          this.logEvent("workspace-files-menu", { menu, files, source, leaf });
        })
      );
    }

    if (this.settings.trackWorkspaceUrlMenu) {
      this.plugin.registerEvent(
        this.app.workspace.on("url-menu", (menu: Menu, url: string) => {
          this.logEvent("workspace-url-menu", { menu, url });
        })
      );
    }

    if (this.settings.trackWorkspaceEditorMenu) {
      this.plugin.registerEvent(
        this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
          this.logEvent("workspace-editor-menu", { menu, editor, info });
        })
      );
    }

    if (this.settings.trackWorkspaceEditorChange) {
      this.plugin.registerEvent(
        this.app.workspace.on("editor-change", (editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
          this.logEvent("workspace-editor-change", { editor, info });
        })
      );
    }

    if (this.settings.trackWorkspaceEditorPaste) {
      this.plugin.registerEvent(
        this.app.workspace.on("editor-paste", (evt: ClipboardEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
          this.logEvent("workspace-editor-paste", { event: evt, editor, info });
        })
      );
    }

    if (this.settings.trackWorkspaceEditorDrop) {
      this.plugin.registerEvent(
        this.app.workspace.on("editor-drop", (evt: DragEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
          this.logEvent("workspace-editor-drop", { event: evt, editor, info });
        })
      );
    }

    if (this.settings.trackWorkspaceQuit) {
      this.plugin.registerEvent(
        this.app.workspace.on("quit", (tasks: any) => {
          this.logEvent("workspace-quit", { tasks });
        })
      );
    }
  }

  private setupLeafEvents() {
    if (this.settings.trackLeafPinnedChange) {
      const leaves = this.app.workspace.getLeavesOfType("markdown");
      leaves.forEach((leaf) => {
        this.plugin.registerEvent(
          leaf.on("pinned-change", (pinned: boolean) => {
            this.logEvent("leaf-pinned-change", { leaf, pinned });
          })
        );
      });
    }

    if (this.settings.trackLeafGroupChange) {
      const leaves = this.app.workspace.getLeavesOfType("markdown");
      leaves.forEach((leaf) => {
        this.plugin.registerEvent(
          leaf.on("group-change", (group: string) => {
            this.logEvent("leaf-group-change", { leaf, group });
          })
        );
      });
    }
  }

  private setupPublishEvents() {
    if (this.settings.trackPublishNavigated) {
      // Note: Publish events are not part of the public API
      // We'll need to find another way to track these events
      console.log("Publish events are not currently supported");
    }
  }

  private setupMenuEvents() {
    if (this.settings.trackMenuHide) {
      // Note: Menu events are not part of the public API
      // We'll need to find another way to track these events
      console.log("Menu events are not currently supported");
    }
  }

  private logEvent(event: EventType, params?: Record<string, any>) {
    // Log the event with parameters
    console.log(`Event: ${event}`, params);
  }

  stop() {
    // No need to manually unregister events - the plugin class handles cleanup
  }
} 