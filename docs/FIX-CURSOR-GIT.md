# Fix "No Providers Registered" in Cursor Source Control

If Cursor shows "no providers registered" in Source Control, here's how to fix it:

## Quick Fixes

### Fix 1: Reload Cursor Window

1. Press `Ctrl+Shift+P` (Command Palette)
2. Type: `Reload Window`
3. Select "Developer: Reload Window"
4. Try Source Control again (`Ctrl+Shift+G`)

### Fix 2: Check Git Installation

Make sure Git is installed and in PATH:

**Windows:**
```cmd
git --version
```

If not found, install Git:
- Download: https://git-scm.com/download/win
- Or use: `winget install Git.Git`

**Verify in Cursor:**
1. Press `Ctrl+Shift+P`
2. Type: `Git: Show Git Output`
3. Check for errors

### Fix 3: Enable Git in Cursor Settings

1. Press `Ctrl+,` (Open Settings)
2. Search for: `git.enabled`
3. Make sure it's checked ✅
4. Search for: `git.path`
5. If Git is in a non-standard location, set the path:
   - Example: `C:\Program Files\Git\bin\git.exe`

### Fix 4: Check Repository

Make sure you're in a Git repository:

```cmd
cd E:\stem-kiosk
git status
```

If it says "not a git repository", initialize it:
```cmd
git init
```

### Fix 5: Restart Cursor

Sometimes a simple restart fixes it:
1. Close Cursor completely
2. Reopen Cursor
3. Open your project folder
4. Try Source Control again

## Step-by-Step Setup

### Step 1: Verify Git Works

Open terminal in Cursor (`Ctrl+``) and run:
```cmd
git --version
git status
```

Both should work without errors.

### Step 2: Check Cursor Git Settings

1. Press `Ctrl+Shift+P`
2. Type: `Preferences: Open Settings (JSON)`
3. Add these settings if missing:

```json
{
  "git.enabled": true,
  "git.path": null,
  "git.autofetch": true,
  "git.confirmSync": false
}
```

### Step 3: Reload Window

1. Press `Ctrl+Shift+P`
2. Type: `Reload Window`
3. Press Enter

### Step 4: Open Source Control

Press `Ctrl+Shift+G` - it should work now!

## Alternative: Use Git Command Line

If Cursor's Git still doesn't work, you can use the terminal:

```cmd
# Stage files
git add .

# Commit
git commit -m "Your message"

# Push
git push origin feature_update
```

## Check Git Output in Cursor

To see what Cursor's Git extension is doing:

1. Press `Ctrl+Shift+P`
2. Type: `Git: Show Git Output`
3. Look for errors or warnings

## Common Issues

### Issue: Git not found
**Solution:** Install Git or set `git.path` in settings

### Issue: Not a repository
**Solution:** Make sure you're in the project folder with `.git` directory

### Issue: Permission denied
**Solution:** Check file permissions, make sure you can write to the folder

### Issue: Extension disabled
**Solution:** Check Extensions, make sure Git extension is enabled

## Still Not Working?

1. **Check Cursor version** - Make sure it's up to date
2. **Check Git extension** - Go to Extensions, search "Git", make sure it's installed
3. **Try VS Code** - Cursor is based on VS Code, same Git extension should work
4. **Use terminal** - Git command line always works as fallback

## Verify It's Working

After fixing, you should see:
- Source Control panel shows your branch name
- Changes list shows modified files
- Can stage, commit, and push

If you see "no providers registered" after all this, the Git extension might be disabled or corrupted. Try reinstalling Cursor or the Git extension.



