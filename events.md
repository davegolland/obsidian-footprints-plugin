# Obsidian Events

| Source           | Event Name         | Payload / When It Fires                                   | How to Register                                                                                   |
|------------------|--------------------|-----------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| **MetadataCache**| changed            | After a file is (re)indexed – `(file, data, cache)`       | `app.metadataCache.on('changed', (file, data, cache) => { … });`                                  |
|                  | deleted            | When a file is deleted – `(file, prevCache)`              | `app.metadataCache.on('deleted', (file, prev) => { … });`                                         |
|                  | resolve            | When a file’s links are (re)resolved – `(file)`           | `app.metadataCache.on('resolve', file => { … });`                                                 |
|                  | resolved           | After *all* files’ links have been resolved               | `app.metadataCache.on('resolved', () => { … });`                                                  |
| **Vault**        | create             | When any file/folder is created – `(abstractFile)`        | `app.vault.on('create', file => { … });`                                                          |
|                  | modify             | When a file’s contents change – `(abstractFile)`          | `app.vault.on('modify', file => { … });`                                                          |
|                  | delete             | When a file/folder is deleted – `(abstractFile)`          | `app.vault.on('delete', file => { … });`                                                          |
|                  | rename             | When a file/folder is renamed – `(abstractFile, oldPath)` | `app.vault.on('rename', (file, oldPath) => { … });`                                               |
| **Workspace**    | quick‑preview      | Before saving a Markdown file – `(file, newContents)`     | `app.workspace.on('quick-preview', (file, data) => { … });`                                       |
|                  | resize             | When the workspace layout changes size                    | `app.workspace.on('resize', () => { … });`                                                        |
|                  | active‑leaf‑change | When the focused leaf changes – `(leafOrNull)`            | `app.workspace.on('active-leaf-change', leaf => { … });`                                          |
|                  | file‑open          | When any file is opened – `(fileOrNull)`                  | `app.workspace.on('file-open', file => { … });`                                                   |
|                  | layout‑change      | After the workspace layout is modified                    | `app.workspace.on('layout-change', () => { … });`                                                 |
|                  | window‑open        | When a pop‑out window is created – `(win, windowObj)`     | `app.workspace.on('window-open', (win, w) => { … });`                                             |
|                  | window‑close       | When a pop‑out window closes – `(win, windowObj)`         | `app.workspace.on('window-close', (win, w) => { … });`                                            |
|                  | css‑change         | When the app’s CSS is reloaded                            | `app.workspace.on('css-change', () => { … });`                                                    |
|                  | file‑menu          | On right‑clicking a file – `(menu, file, source, leaf?)`   | `app.workspace.on('file-menu', (m, f, src, leaf) => { … });`                                      |
|                  | files‑menu         | On multi‑select right‑click – `(menu, files[], source, leaf?)` | `app.workspace.on('files-menu', (m, arr, src, leaf) => { … });`                            |
|                  | url‑menu           | On right‑clicking an external link – `(menu, url)`        | `app.workspace.on('url-menu', (m, url) => { … });`                                                |
|                  | editor‑menu        | On right‑click in an editor – `(menu, editor, info)`      | `app.workspace.on('editor-menu', (m, ed, info) => { … });`                                        |
|                  | editor‑change      | After any edit in an editor – `(editor, info)`            | `app.workspace.on('editor-change', (ed, info) => { … });`                                         |
|                  | editor‑paste       | On paste in an editor – `(evt, editor, info)`             | `app.workspace.on('editor-paste', (evt, ed, info) => { … });`                                     |
|                  | editor‑drop        | On drop in an editor – `(evt, editor, info)`              | `app.workspace.on('editor-drop', (evt, ed, info) => { … });`                                      |
|                  | quit               | When the app is quitting – `(tasks)`                      | `app.workspace.on('quit', tasks => { … });`                                                       |
| **WorkspaceLeaf**| pinned‑change      | When a leaf’s pinned state toggles – `(boolean)`          | `leaf.on('pinned-change', pinned => { … });`                                                      |
|                  | group‑change       | When a leaf’s group changes – `(groupId)`                 | `leaf.on('group-change', grp => { … });`                                                          |
| **Publish**      | navigated          | When Publish view navigates – no args                     | `publish.on('navigated', () => { … });`                                                           |
| **Menu**         | hide (onHide)      | After a menu is hidden – no args                          | `menu.onHide(() => { … });`                                                                       |

> **Tip:** wrap your `.on(...)` calls in `this.registerEvent(...)` inside your plugin to auto‑cleanup on unload.