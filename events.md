# Obsidian Events Reference

## MetadataCache Events

### `changed`
- **Parameters**: `(file: TFile, data: string, cache: CachedMetadata) => any`
- **Description**: Called when a file has been indexed, and its (updated) cache is now available. This event provides access to the file, its raw content, and the parsed metadata cache.
- **Registration**: `app.metadataCache.on('changed', (file, data, cache) => { ... })`

### `deleted`
- **Parameters**: `(file: TFile, prevCache: CachedMetadata | null) => any`
- **Description**: Called when a file has been deleted. Provides the file and a best-effort previous version of the cached metadata, which might be null if the file wasn't successfully cached previously.
- **Registration**: `app.metadataCache.on('deleted', (file, prev) => { ... })`

### `resolve`
- **Parameters**: `(file: TFile) => any`
- **Description**: Called when a file has been resolved for `resolvedLinks` and `unresolvedLinks`. This happens sometime after a file has been indexed.
- **Registration**: `app.metadataCache.on('resolve', file => { ... })`

### `resolved`
- **Parameters**: `() => any`
- **Description**: Called when all files have been resolved. This fires each time files get modified after the initial load.
- **Registration**: `app.metadataCache.on('resolved', () => { ... })`

## Vault Events

### `create`
- **Parameters**: `(file: TAbstractFile) => any`
- **Description**: Called when a file is created. This is also called for each existing file when the vault is first loaded. Register this event inside `Workspace.onLayoutReady` to avoid initial load events.
- **Registration**: `app.vault.on('create', file => { ... })`

### `modify`
- **Parameters**: `(file: TAbstractFile) => any`
- **Description**: Called when a file is modified.
- **Registration**: `app.vault.on('modify', file => { ... })`

### `delete`
- **Parameters**: `(file: TAbstractFile) => any`
- **Description**: Called when a file is deleted.
- **Registration**: `app.vault.on('delete', file => { ... })`

### `rename`
- **Parameters**: `(file: TAbstractFile, oldPath: string) => any`
- **Description**: Called when a file is renamed, providing both the file object and the previous path.
- **Registration**: `app.vault.on('rename', (file, oldPath) => { ... })`

## Workspace Events

### `quick-preview`
- **Parameters**: `(file: TFile, data: string) => any`
- **Description**: Triggered when the active Markdown file is modified. Allows reacting to file changes before they're saved to disk.
- **Registration**: `app.workspace.on('quick-preview', (file, data) => { ... })`

### `resize`
- **Parameters**: `() => any`
- **Description**: Triggered when a `WorkspaceItem` is resized or the workspace layout has changed.
- **Registration**: `app.workspace.on('resize', () => { ... })`

### `active-leaf-change`
- **Parameters**: `(leaf: WorkspaceLeaf | null) => any`
- **Description**: Triggered when the active leaf (tab or pane) changes.
- **Registration**: `app.workspace.on('active-leaf-change', leaf => { ... })`

### `file-open`
- **Parameters**: `(file: TFile | null) => any`
- **Description**: Triggered when the active file changes. The file could be in a new leaf, an existing leaf, or an embed.
- **Registration**: `app.workspace.on('file-open', file => { ... })`

### `layout-change`
- **Parameters**: `() => any`
- **Description**: Triggered when the workspace layout changes.
- **Registration**: `app.workspace.on('layout-change', () => { ... })`

### `window-open`
- **Parameters**: `(win: WorkspaceWindow, window: Window) => any`
- **Description**: Triggered when a new popout window is created.
- **Registration**: `app.workspace.on('window-open', (win, w) => { ... })`

### `window-close`
- **Parameters**: `(win: WorkspaceWindow, window: Window) => any`
- **Description**: Triggered when a popout window is closed.
- **Registration**: `app.workspace.on('window-close', (win, w) => { ... })`

### `css-change`
- **Parameters**: `() => any`
- **Description**: Triggered when the CSS of the app has changed.
- **Registration**: `app.workspace.on('css-change', () => { ... })`

### `file-menu`
- **Parameters**: `(menu: Menu, file: TAbstractFile, source: string, leaf?: WorkspaceLeaf) => any`
- **Description**: Triggered when the user opens the context menu on a file.
- **Registration**: `app.workspace.on('file-menu', (m, f, src, leaf) => { ... })`

### `files-menu`
- **Parameters**: `(menu: Menu, files: TAbstractFile[], source: string, leaf?: WorkspaceLeaf) => any`
- **Description**: Triggered when the user opens the context menu with multiple files selected in the File Explorer.
- **Registration**: `app.workspace.on('files-menu', (m, arr, src, leaf) => { ... })`

### `url-menu`
- **Parameters**: `(menu: Menu, url: string) => any`
- **Description**: Triggered when the user opens the context menu on an external URL.
- **Registration**: `app.workspace.on('url-menu', (m, url) => { ... })`

### `editor-menu`
- **Parameters**: `(menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any`
- **Description**: Triggered when the user opens the context menu on an editor.
- **Registration**: `app.workspace.on('editor-menu', (m, ed, info) => { ... })`

### `editor-change`
- **Parameters**: `(editor: Editor, info: MarkdownView | MarkdownFileInfo) => any`
- **Description**: Triggered when changes to an editor have been applied, either programmatically or from a user event.
- **Registration**: `app.workspace.on('editor-change', (ed, info) => { ... })`

### `editor-paste`
- **Parameters**: `(evt: ClipboardEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any`
- **Description**: Triggered when the editor receives a paste event. Check `evt.defaultPrevented` before handling and use `evt.preventDefault()` to indicate you've handled it.
- **Registration**: `app.workspace.on('editor-paste', (evt, ed, info) => { ... })`

### `editor-drop`
- **Parameters**: `(evt: DragEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any`
- **Description**: Triggered when the editor receives a drop event. Check `evt.defaultPrevented` before handling and use `evt.preventDefault()` to indicate you've handled it.
- **Registration**: `app.workspace.on('editor-drop', (evt, ed, info) => { ... })`

### `quit`
- **Parameters**: `(tasks: Tasks) => any`
- **Description**: Triggered when the app is about to quit. Not guaranteed to actually run, so perform best-effort cleanup here.
- **Registration**: `app.workspace.on('quit', tasks => { ... })`

## WorkspaceLeaf Events

### `pinned-change`
- **Parameters**: `(pinned: boolean) => any`
- **Description**: Triggered when a workspace leaf (tab) is pinned or unpinned.
- **Registration**: `leaf.on('pinned-change', pinned => { ... })`

### `group-change`
- **Parameters**: `(group: string) => any`
- **Description**: Triggered when a workspace leaf's group changes.
- **Registration**: `leaf.on('group-change', grp => { ... })`

## Publish Events (for Obsidian Publish)

### `navigated`
- **Parameters**: `() => any`
- **Description**: Triggered when navigation occurs in Publish.
- **Registration**: `publish.on('navigated', () => { ... })`

## Menu Events

### `hide` (via onHide)
- **Parameters**: `() => any`
- **Description**: Called after a menu is hidden.
- **Registration**: `menu.onHide(() => { ... })`

## Plugin Events

### `onExternalSettingsChange`
- **Parameters**: none
- **Description**: Called when the `data.json` file is modified on disk externally from Obsidian. Use this to reload plugin settings when they've changed externally.

### `onUserEnable`  
- **Parameters**: none
- **Description**: Called when a user explicitly interacts with the plugin. Safe to engage with the user here. If your plugin registers a custom view, you can open it here.

> **Important Tip:** Always wrap your event registrations in `this.registerEvent()` inside your plugin to ensure proper cleanup when your plugin is unloaded:
> ```javascript
> this.registerEvent(app.workspace.on('file-open', file => { ... }));
> ```

This approach automatically detaches event handlers when your plugin is disabled or unloaded, preventing memory leaks and unexpected behaviors.