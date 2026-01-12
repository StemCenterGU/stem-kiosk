# Using Cursor's Built-in Git

## Quick Start

### 1. Open Source Control Panel

**Method 1:** Click the Git icon in the left sidebar (looks like a branch/fork icon)

**Method 2:** Press `Ctrl+Shift+G` (Windows/Linux) or `Cmd+Shift+G` (Mac)

**Method 3:** View → Source Control

### 2. Understanding the Interface

The Source Control panel shows:
- **Source Control** section at the top
- **Changes** section showing modified files
- **Staged Changes** section (after staging)
- Commit message box at the top
- Action buttons (✓ Commit, ... menu)

### 3. Stage Files

**To stage individual files:**
- Click the `+` icon next to a file name
- Or right-click file → "Stage Changes"

**To stage all files:**
- Click the `+` icon next to "Changes"
- Or use the "..." menu → "Stage All Changes"

**To unstage:**
- Click the `-` icon next to a staged file
- Or right-click → "Unstage Changes"

### 4. Write Commit Message

In the text box at the top of Source Control panel, type your commit message:

```
Fix Raspberry Pi issues: desktop icon and browser cache
```

You can also add a description below:
```
- Fix desktop icon paths for new project structure
- Add automatic browser cache clearing
- Update cache-busting version numbers
```

### 5. Commit

**Method 1:** Click the checkmark (✓) button at the top

**Method 2:** Press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

**Method 3:** Use the "..." menu → "Commit"

### 6. Push to GitHub

After committing:

1. Click the "..." menu (three dots) at the top of Source Control
2. Select "Push" or "Push to..."
3. Choose your remote (usually "origin")
4. Select branch (usually "feature_update" or "main")

**Or use the sync button:**
- Look for the sync icon (circular arrows) in the status bar
- Click it to push/pull

## Visual Guide

```
┌─────────────────────────────────────┐
│ Source Control                      │
├─────────────────────────────────────┤
│ [Commit message box]                │
│                                     │
│ Changes (3)                         │
│   + README.md                       │
│   + setup/restart_kiosk.sh          │
│   + frontend/index.html             │
│                                     │
│ Staged Changes (2)                  │
│   - docs/FIX-STEPS.md               │
│   - setup/pi/fix-everything.sh      │
│                                     │
│ [✓ Commit]  [...]                   │
└─────────────────────────────────────┘
```

## Keyboard Shortcuts

- `Ctrl+Shift+G` - Open Source Control
- `Ctrl+Enter` - Commit staged changes
- `Ctrl+K Ctrl+Enter` - Commit without staging
- `Ctrl+Shift+P` → "Git: Push" - Push to remote

## Viewing Changes

**To see what changed in a file:**
- Click on the file in the Changes list
- The diff view will open showing:
  - Green: Added lines
  - Red: Removed lines
  - Yellow: Modified lines

**To compare with previous version:**
- Right-click file → "Open Changes"
- Or click the file to see inline diff

## Branch Management

**To switch branches:**
- Click the branch name in the status bar (bottom left)
- Or use `Ctrl+Shift+P` → "Git: Checkout to..."

**To create new branch:**
- `Ctrl+Shift+P` → "Git: Create Branch..."
- Or click branch name → "Create new branch"

## Status Bar Indicators

Look at the bottom status bar:
- **Branch name** (left side) - Shows current branch
- **Sync icon** - Click to push/pull
- **Git icon** - Shows number of changes

## Common Workflows

### Daily Workflow

1. Make changes to files
2. Open Source Control (`Ctrl+Shift+G`)
3. Stage files (click `+`)
4. Write commit message
5. Commit (click `✓` or `Ctrl+Enter`)
6. Push (click `...` → "Push")

### Review Before Committing

1. Click each file to see changes
2. Review the diff
3. Stage only files you want
4. Commit with descriptive message

### Undo Changes

**Unstage:**
- Click `-` next to staged file

**Discard changes:**
- Right-click file → "Discard Changes"
- ⚠️ This permanently removes your changes!

## Tips

1. **Always review changes** before committing
2. **Write clear commit messages** - describe what and why
3. **Commit often** - small, focused commits are better
4. **Use branches** for features - don't commit directly to main
5. **Pull before push** if working with others

## Troubleshooting

### Can't see Source Control panel?
- Press `Ctrl+Shift+G`
- Or View → Source Control

### Files not showing?
- Make sure you're in a Git repository
- Check: `git status` in terminal

### Can't push?
- Make sure you have a remote configured
- Check: `git remote -v` in terminal
- You may need to set up GitHub first

### Merge conflicts?
- Cursor will highlight conflicts
- Use "Accept Current Change", "Accept Incoming", or edit manually

## Next Steps

1. Open Source Control: `Ctrl+Shift+G`
2. Stage your changes
3. Write commit message
4. Commit
5. Push to GitHub

Happy committing! 🚀



