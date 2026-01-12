# Final Steps: Fix Desktop Icon + Cache Issue

## Quick Fix (All-in-One Script)

Run this single script to fix both issues:

```bash
cd /home/pi/stem-kiosk
chmod +x setup/pi/fix-everything.sh
./setup/pi/fix-everything.sh
```

This script will:
- ✅ Fix desktop icon
- ✅ Clear browser cache
- ✅ Verify everything is correct

## Manual Steps (If You Prefer)

### Step 1: Fix Desktop Icon

```bash
cd /home/pi/stem-kiosk
chmod +x setup/pi/update-desktop-icon.sh
./setup/pi/update-desktop-icon.sh
```

### Step 2: Clear Browser Cache

```bash
cd /home/pi/stem-kiosk
chmod +x setup/pi/clear-browser-cache.sh
./setup/pi/clear-browser-cache.sh
```

### Step 3: Refresh Desktop

Right-click on desktop → **Refresh** (or press **F5**)

Or run:
```bash
xdg-desktop-menu forceupdate
```

### Step 4: Test

Double-click the **"STEM Discovery Kiosk"** icon on your desktop.

You should see:
- ✅ Only 3 activities (no Circuit Memory Lab)
- ✅ Fresh version loaded
- ✅ No cached old version

## After Running the Fix

1. **Desktop Icon:**
   - Should appear as "STEM Discovery Kiosk"
   - Should be on your desktop
   - Should work when double-clicked

2. **Cache:**
   - Old cached version cleared
   - New version will load automatically
   - Future launches will auto-clear cache

3. **Verification:**
   - Check desktop for the icon
   - Launch it and verify only 3 activities show
   - No Circuit Memory Lab should appear

## If Icon Doesn't Appear

1. **Refresh desktop:**
   ```bash
   xdg-desktop-menu forceupdate
   ```

2. **Or log out and log back in** (no full reboot needed)

3. **Or check manually:**
   ```bash
   ls -la ~/Desktop/STEM\ Discovery\ Kiosk.desktop
   cat ~/Desktop/STEM\ Discovery\ Kiosk.desktop
   ```

## If Still Seeing Old Version

1. **Clear cache again:**
   ```bash
   ./setup/pi/clear-browser-cache.sh
   ```

2. **Restart kiosk:**
   ```bash
   ./setup/restart_kiosk.sh
   ```

3. **Or reboot:**
   ```bash
   sudo reboot
   ```

## Summary

**One command to fix everything:**
```bash
cd /home/pi/stem-kiosk && chmod +x setup/pi/fix-everything.sh && ./setup/pi/fix-everything.sh
```

Then refresh desktop (F5) and test the icon!

