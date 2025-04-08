import { App, WorkspaceLeaf, TFile, EventRef, Menu, Editor, EditorPosition, EditorSuggestContext, MarkdownView, MenuItem, TAbstractFile } from "obsidian";
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
    // MetadataCache events
    if (this.settings.trackMetadataChanged) {
      const off = this.app.metadataCache.on('changed', (file, data, cache) => {
        this.record("metadata-changed", file, `data: ${JSON.stringify(data)}`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackMetadataDeleted) {
      const off = this.app.metadataCache.on('deleted', (file, prevCache) => {
        this.record("metadata-deleted", file, `prevCache: ${JSON.stringify(prevCache)}`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackMetadataResolve) {
      const off = this.app.metadataCache.on('resolve', (file) => {
        this.record("metadata-resolve", file);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackMetadataResolved) {
      const off = this.app.metadataCache.on('resolved', () => {
        this.record("metadata-resolved", null, "All files resolved");
      });
      this.detachFns.push(off);
    }

    // Vault events
    if (this.settings.trackVaultCreate) {
      const off = this.app.vault.on('create', (file) => {
        this.record("vault-create", file);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackVaultModify) {
      const off = this.app.vault.on('modify', (file) => {
        this.record("vault-modify", file);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackVaultDelete) {
      const off = this.app.vault.on('delete', (file) => {
        this.record("vault-delete", file);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackVaultRename) {
      const off = this.app.vault.on('rename', (file, oldPath) => {
        this.record("vault-rename", file, `oldPath: ${oldPath}`);
      });
      this.detachFns.push(off);
    }

    // Workspace events
    if (this.settings.trackWorkspaceQuickPreview) {
      const off = this.app.workspace.on('quick-preview', (file, newContents) => {
        this.record("workspace-quick-preview", file, `newContents: ${newContents.substring(0, 100)}...`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceResize) {
      const off = this.app.workspace.on('resize', () => {
        this.record("workspace-resize", null, "Workspace resized");
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceActiveLeafChange) {
      const off = this.app.workspace.on('active-leaf-change', (leaf) => {
        const file = leaf?.view?.getState()?.file as TFile | null;
        this.record("workspace-active-leaf-change", file, `leaf: ${leaf ? 'active' : 'null'}`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceFileOpen) {
      const off = this.app.workspace.on('file-open', (file) => {
        this.record("workspace-file-open", file);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceLayoutChange) {
      const off = this.app.workspace.on('layout-change', () => {
        this.record("workspace-layout-change", null, "Layout changed");
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceWindowOpen) {
      const off = this.app.workspace.on('window-open', (win, windowObj) => {
        this.record("workspace-window-open", null, `Window opened`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceWindowClose) {
      const off = this.app.workspace.on('window-close', (win, windowObj) => {
        this.record("workspace-window-close", null, `Window closed`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceCssChange) {
      const off = this.app.workspace.on('css-change', () => {
        this.record("workspace-css-change", null, "CSS changed");
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceFileMenu) {
      const off = this.app.workspace.on('file-menu', (menu, file, source, leaf) => {
        this.record("workspace-file-menu", file, `source: ${source}, leaf: ${leaf ? 'active' : 'null'}`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceFilesMenu) {
      const off = this.app.workspace.on('files-menu', (menu, files, source, leaf) => {
        const filePaths = files.map(f => f.path).join(', ');
        this.record("workspace-files-menu", files[0], `files: ${filePaths}, source: ${source}, leaf: ${leaf ? 'active' : 'null'}`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceUrlMenu) {
      const off = this.app.workspace.on('url-menu', (menu, url) => {
        this.record("workspace-url-menu", null, `url: ${url}`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceEditorMenu) {
      const off = this.app.workspace.on('editor-menu', (menu, editor, info) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        const file = view?.file;
        this.record("workspace-editor-menu", file, `info: ${JSON.stringify(info)}`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceEditorChange) {
      const off = this.app.workspace.on('editor-change', (editor, info) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        const file = view?.file;
        this.record("workspace-editor-change", file, `info: ${JSON.stringify(info)}`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceEditorPaste) {
      const off = this.app.workspace.on('editor-paste', (evt, editor, info) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        const file = view?.file;
        this.record("workspace-editor-paste", file, `info: ${JSON.stringify(info)}`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceEditorDrop) {
      const off = this.app.workspace.on('editor-drop', (evt, editor, info) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        const file = view?.file;
        this.record("workspace-editor-drop", file, `info: ${JSON.stringify(info)}`);
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackWorkspaceQuit) {
      const off = this.app.workspace.on('quit', (tasks) => {
        this.record("workspace-quit", null, `tasks: ${JSON.stringify(tasks)}`);
      });
      this.detachFns.push(off);
    }

    // WorkspaceLeaf events
    if (this.settings.trackLeafPinnedChange) {
      const off = this.app.workspace.on('active-leaf-change', (leaf) => {
        if (leaf) {
          const pinnedOff = leaf.on('pinned-change', (pinned) => {
            const file = leaf.view?.getState()?.file as TFile | null;
            this.record("leaf-pinned-change", file, `pinned: ${pinned}`);
          });
          this.detachFns.push(pinnedOff);
        }
      });
      this.detachFns.push(off);
    }

    if (this.settings.trackLeafGroupChange) {
      const off = this.app.workspace.on('active-leaf-change', (leaf) => {
        if (leaf) {
          const groupOff = leaf.on('group-change', (groupId) => {
            const file = leaf.view?.getState()?.file as TFile | null;
            this.record("leaf-group-change", file, `groupId: ${groupId}`);
          });
          this.detachFns.push(groupOff);
        }
      });
      this.detachFns.push(off);
    }

    // Publish events
    if (this.settings.trackPublishNavigated) {
      // Note: This is a placeholder as the publish API might not be directly accessible
      // You might need to implement this differently based on the actual API
      console.log("Publish events are not directly accessible in the current API");
    }

    // Menu events
    if (this.settings.trackMenuHide) {
      // Note: This is a placeholder as the menu API might not be directly accessible
      // You might need to implement this differently based on the actual API
      console.log("Menu events are not directly accessible in the current API");
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

  private record(type: EventType, file: TFile | TAbstractFile | null | undefined, details?: string) {
    // Skip logging if the file is the current log file
    if (file && 'path' in file) {
      const currentLogPath = this.logger.getCurrentLogFilePath();
      if (file.path === currentLogPath) {
        return;
      }
    }
    
    const entry: NoteActivity = {
      ts: new Date().toISOString(),
      event: type,
      file: file && 'path' in file ? file.path : "system",
      details: details
    };
    this.logger.log(entry);
  }
} 