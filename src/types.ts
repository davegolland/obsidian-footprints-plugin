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

// Parameter configuration types
export interface ParameterConfig {
  enabled: boolean;
  name?: string; // Custom name for the parameter in logs
  includeType?: boolean; // Whether to include the type in the log
}

export interface EventParameterConfig {
  // File-related
  file?: ParameterConfig;
  files?: ParameterConfig;
  oldPath?: ParameterConfig;
  
  // Content/Data
  data?: ParameterConfig;
  cache?: ParameterConfig;
  prevCache?: ParameterConfig;
  
  // UI Components
  leaf?: ParameterConfig;
  menu?: ParameterConfig;
  editor?: ParameterConfig;
  info?: ParameterConfig;
  
  // Window-related
  win?: ParameterConfig;
  window?: ParameterConfig;
  
  // DOM Events
  event?: ParameterConfig;
  
  // Other contexts
  source?: ParameterConfig;
  url?: ParameterConfig;
  tasks?: ParameterConfig;
  
  // State values
  pinned?: ParameterConfig;
  group?: ParameterConfig;
}

// Default parameter configurations for each event type
export const DEFAULT_PARAMETER_CONFIGS: Record<string, EventParameterConfig> = {
  // MetadataCache events
  trackMetadataChanged: {
    file: { enabled: true, includeType: true },
    data: { enabled: false },
    cache: { enabled: true, includeType: true }
  },
  trackMetadataDeleted: {
    file: { enabled: true, includeType: true },
    prevCache: { enabled: true, includeType: true }
  },
  trackMetadataResolve: {
    file: { enabled: true, includeType: true }
  },
  trackMetadataResolved: {},
  
  // Vault events
  trackVaultCreate: {
    file: { enabled: true, includeType: true }
  },
  trackVaultModify: {
    file: { enabled: true, includeType: true }
  },
  trackVaultDelete: {
    file: { enabled: true, includeType: true }
  },
  trackVaultRename: {
    file: { enabled: true, includeType: true },
    oldPath: { enabled: true }
  },
  
  // Workspace events
  trackWorkspaceQuickPreview: {
    file: { enabled: true, includeType: true },
    data: { enabled: false }
  },
  trackWorkspaceResize: {},
  trackWorkspaceActiveLeafChange: {
    leaf: { enabled: true, includeType: true }
  },
  trackWorkspaceFileOpen: {
    file: { enabled: true, includeType: true }
  },
  trackWorkspaceLayoutChange: {},
  trackWorkspaceWindowOpen: {
    win: { enabled: true, includeType: true },
    window: { enabled: true, includeType: true }
  },
  trackWorkspaceWindowClose: {
    win: { enabled: true, includeType: true },
    window: { enabled: true, includeType: true }
  },
  trackWorkspaceCssChange: {},
  trackWorkspaceFileMenu: {
    menu: { enabled: true, includeType: true },
    file: { enabled: true, includeType: true },
    source: { enabled: true },
    leaf: { enabled: true, includeType: true }
  },
  trackWorkspaceFilesMenu: {
    menu: { enabled: true, includeType: true },
    files: { enabled: true, includeType: true },
    source: { enabled: true },
    leaf: { enabled: true, includeType: true }
  },
  trackWorkspaceUrlMenu: {
    menu: { enabled: true, includeType: true },
    url: { enabled: true }
  },
  trackWorkspaceEditorMenu: {
    menu: { enabled: true, includeType: true },
    editor: { enabled: true, includeType: true },
    info: { enabled: true, includeType: true }
  },
  trackWorkspaceEditorChange: {
    editor: { enabled: true, includeType: true },
    info: { enabled: true, includeType: true }
  },
  trackWorkspaceEditorPaste: {
    event: { enabled: true, includeType: true },
    editor: { enabled: true, includeType: true },
    info: { enabled: true, includeType: true }
  },
  trackWorkspaceEditorDrop: {
    event: { enabled: true, includeType: true },
    editor: { enabled: true, includeType: true },
    info: { enabled: true, includeType: true }
  },
  trackWorkspaceQuit: {
    tasks: { enabled: true, includeType: true }
  },
  
  // WorkspaceLeaf events
  trackLeafPinnedChange: {
    pinned: { enabled: true }
  },
  trackLeafGroupChange: {
    group: { enabled: true }
  },
  
  // Publish events
  trackPublishNavigated: {},
  
  // Menu events
  trackMenuHide: {}
};

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
  
  // Parameter configurations
  parameterConfigs: Record<string, EventParameterConfig>;
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
  
  // Parameter configurations
  parameterConfigs: DEFAULT_PARAMETER_CONFIGS,
}; 