# Install genz On Windows

## PowerShell

```powershell
irm https://raw.githubusercontent.com/jasonelguapo/genz/main/install.ps1 | iex
```

Local clone:

```powershell
node .\bin\install.js
```

Dry run:

```powershell
node .\bin\install.js --dry-run --list
```

## Claude Code

```powershell
node .\bin\install.js --only claude --with-hooks
```

The installer writes Gen Z hook files into `%USERPROFILE%\.claude\hooks` unless
`CLAUDE_CONFIG_DIR` points elsewhere.

## Commands

| Command | What |
|---|---|
| `/genz` | activate default mode |
| `/genz lite` | restrained style |
| `/genz full` | noticeably slangy default Gen Z style |
| `/genz max` | very heavy slang |
| `/genz off` | deactivate |
| `/genz-stats` | token usage and estimated savings |

## Uninstall

```powershell
node .\bin\install.js --uninstall
```
