export type EventType = 
  // MetadataCache events
  | "metadata-changed" 
  | "metadata-deleted" 
  | "metadata-resolve" 
  | "metadata-resolved"
  // Vault events
  | "vault-create" 
  | "vault-modify" 
  | "vault-delete" 
  | "vault-rename"
  // Workspace events
  | "workspace-quick-preview" 
  | "workspace-resize" 
  | "workspace-active-leaf-change" 
  | "workspace-file-open" 
  | "workspace-layout-change" 
  | "workspace-window-open" 
  | "workspace-window-close" 
  | "workspace-css-change" 
  | "workspace-file-menu" 
  | "workspace-files-menu" 
  | "workspace-url-menu" 
  | "workspace-editor-menu" 
  | "workspace-editor-change" 
  | "workspace-editor-paste" 
  | "workspace-editor-drop" 
  | "workspace-quit"
  // WorkspaceLeaf events
  | "leaf-pinned-change" 
  | "leaf-group-change"
  // Publish events
  | "publish-navigated"
  // Menu events
  | "menu-hide"
  // Legacy events (for backward compatibility)
  | "open"
  | "close"
  | "create"
  | "save";

export interface NoteActivity {
  ts: string;       // ISO timestamp
  event: EventType;
  file: string;     // path within vault
  details?: string; // additional event details
}

export type LogFormat = "plain" | "csv" | "json" | "custom";

export interface PluginSettings {
  logPath: string;
  deriveNameFromDate: boolean;
  format: LogFormat;
  customFormat: string; // printf‑style template when format === "custom"
  
  // MetadataCache events
  trackMetadataChanged: boolean;
  trackMetadataDeleted: boolean;
  trackMetadataResolve: boolean;
  trackMetadataResolved: boolean;
  
  // Vault events
  trackVaultCreate: boolean;
  trackVaultModify: boolean;
  trackVaultDelete: boolean;
  trackVaultRename: boolean;
  
  // Workspace events
  trackWorkspaceQuickPreview: boolean;
  trackWorkspaceResize: boolean;
  trackWorkspaceActiveLeafChange: boolean;
  trackWorkspaceFileOpen: boolean;
  trackWorkspaceLayoutChange: boolean;
  trackWorkspaceWindowOpen: boolean;
  trackWorkspaceWindowClose: boolean;
  trackWorkspaceCssChange: boolean;
  trackWorkspaceFileMenu: boolean;
  trackWorkspaceFilesMenu: boolean;
  trackWorkspaceUrlMenu: boolean;
  trackWorkspaceEditorMenu: boolean;
  trackWorkspaceEditorChange: boolean;
  trackWorkspaceEditorPaste: boolean;
  trackWorkspaceEditorDrop: boolean;
  trackWorkspaceQuit: boolean;
  
  // WorkspaceLeaf events
  trackLeafPinnedChange: boolean;
  trackLeafGroupChange: boolean;
  
  // Publish events
  trackPublishNavigated: boolean;
  
  // Menu events
  trackMenuHide: boolean;
  
  // Legacy settings (for backward compatibility)
  trackOpen: boolean;
  trackClose: boolean;
  trackCreate: boolean;
  trackSave: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  logPath: "Logs",
  deriveNameFromDate: true,
  format: "plain",
  customFormat: "%t | %e | %f | %d",
  
  // MetadataCache events
  trackMetadataChanged: true,
  trackMetadataDeleted: true,
  trackMetadataResolve: true,
  trackMetadataResolved: true,
  
  // Vault events
  trackVaultCreate: true,
  trackVaultModify: true,
  trackVaultDelete: true,
  trackVaultRename: true,
  
  // Workspace events
  trackWorkspaceQuickPreview: true,
  trackWorkspaceResize: true,
  trackWorkspaceActiveLeafChange: true,
  trackWorkspaceFileOpen: true,
  trackWorkspaceLayoutChange: true,
  trackWorkspaceWindowOpen: true,
  trackWorkspaceWindowClose: true,
  trackWorkspaceCssChange: true,
  trackWorkspaceFileMenu: true,
  trackWorkspaceFilesMenu: true,
  trackWorkspaceUrlMenu: true,
  trackWorkspaceEditorMenu: true,
  trackWorkspaceEditorChange: true,
  trackWorkspaceEditorPaste: true,
  trackWorkspaceEditorDrop: true,
  trackWorkspaceQuit: true,
  
  // WorkspaceLeaf events
  trackLeafPinnedChange: true,
  trackLeafGroupChange: true,
  
  // Publish events
  trackPublishNavigated: true,
  
  // Menu events
  trackMenuHide: true,
  
  // Legacy settings (for backward compatibility)
  trackOpen: true,
  trackClose: true,
  trackCreate: true,
  trackSave: true,
}; 