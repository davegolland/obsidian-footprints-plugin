# Obsidian Footprints Plugin

A configurable Obsidian plugin that records activity on your notes — open, close, create, and save — to a log file in the format **you** choose.

---

## What It Does

`Obsidian Footprints` listens for key note‑related events inside Obsidian and writes a structured line to a log file for each event:

|Field|Example|
|---|---|
|Timestamp|`2025‑04‑05T14:23:11.456Z`|
|Event|`open`|
|File|`Projects/Ideas.md`|

The log file can be **plain‑text**, **CSV**, **JSON Lines**, or a **Custom** template, and can rotate daily (e.g. `log‑2025‑04‑05.txt`).

---

## Why It’s Useful

- **Productivity analytics** – Measure how often you return to a note or how long you spend editing.
    
- **Research audit trail** – Keep an immutable record of when you created or modified sources.
    
- **Debugging** – Trace mysterious changes or file deletions.
    

---

## Installation

1. **Manual**
    
    1. Clone/download this repo into your vault’s `.obsidian/plugins` folder.
        
    2. Run `npm install && npm run build`.
        
    3. Enable _Note Activity Logger_ in **Settings → Community plugins**.
        
2. **Community Plugins Browser** _(pending)_ _Search for “Obsidian Footprints”, install, then enable._
    

---

## Usage

1. Open **Settings → Obsidian Footprints**.
    
2. Toggle which events you want to record.
    
3. Choose your **Log format** and **Log location**.
    
4. Start working — the plugin writes a new entry each time an enabled event fires.
    

### Log Formats

**Supported formats**

- **Plain text** (`.txt`)
    
    - Fixed template: `<timestamp> | <event> | <file>`
        
- **CSV** (`.csv`)
    
    - Columns: `timestamp,event,file`
        
    - Each value wrapped in double quotes; internal quotes are doubled.
        
- **JSON Lines** (`.jsonl`)
    
    - One JSON object per line with keys `ts`, `event`, `file`.
        
- **Custom (printf‑style)** (`.txt`)
    
    - Define any template in **Settings → Custom Format String**.
        
    - Placeholders: `%t` = timestamp, `%e` = event, `%f` = file, `%%` = literal `%`.
        

**Examples**

```text
Plain  : 2025‑04‑05T14:23:11.456Z | open | Projects/Ideas.md
CSV    : "2025‑04‑05T14:23:11.456Z","open","Projects/Ideas.md"
JSONL  : {"ts":"2025‑04‑05T14:23:11.456Z","event":"open","file":"Projects/Ideas.md"}
Custom : [open] Projects/Ideas.md @ 2025‑04‑05T14:23:11.456Z   (template: "[%e] %f @ %t")
```

---

## Configuration Options

|Setting|Description|Default|
|---|---|---|
|**Log Path**|Relative or absolute folder where log files are written.|`Logs/` (vault‑relative)|
|**Derive file name from date**|If enabled, file name becomes `log‑YYYY‑MM‑DD.ext`.|`true`|
|**Log Format**|`Plain`, `CSV`, `JSON`, `Custom`.|`Plain`|
|**Custom Format String**|Active only when **Log Format** = `Custom`. Supports `%t`, `%e`, `%f`.|`%t|
|**Track Open**|Record when a note is opened.|`true`|
|**Track Close**|Record when a note is closed.|`true`|
|**Track Create**|Record when a new note is created.|`true`|
|**Track Save**|Record when a note is written/saved.|`true`|
