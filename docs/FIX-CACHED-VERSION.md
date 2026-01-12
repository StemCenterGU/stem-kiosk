# Fix Cached Version Issue

If the kiosk is showing the old version with Circuit Memory Lab, the browser cache needs to be cleared.

## Quick Fix

### Option 1: Clear Cache Script (Recommended)

```bash
cd /home/pi/stem-kiosk
chmod +x setup/pi/clear-browser-cache.sh
./setup/pi/clear-browser-cache.sh
```

Then restart the kiosk:
```bash
./setup/restart_kiosk.sh
```

### Option 2: Manual Cache Clear

```bash
# Stop Chromium
pkill -f chromium

# Clear cache
rm -rf ~/.cache/chromium/Default/Cache
rm -rf ~/.cache/chromium/Default/Code\ Cache
rm -rf ~/.cache/chromium/ShaderCache

# Restart kiosk
/home/pi/stem-kiosk/setup/restart_kiosk.sh
```

## What Was Fixed

The `restart_kiosk.sh` script now:
- ✅ Automatically clears Chromium cache before launching
- ✅ Adds cache-busting timestamp to URL
- ✅ Uses Chromium flags to disable caching
- ✅ Forces fresh load every time

## Version Numbers Updated

Cache-busting version numbers have been updated:
- CSS: `v=3` → `v=4`
- JavaScript: `v=12` → `v=13`

## After Updating Files on Pi

If you've updated the files on your Pi:

1. **Clear cache:**
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

The new version will load automatically.

## Verify New Version

After clearing cache, you should see:
- ✅ Only 3 activities (no Circuit Memory Lab)
- ✅ Updated version numbers in HTML
- ✅ Fresh load without cache

## Prevention

The updated `restart_kiosk.sh` script now:
- Clears cache automatically on each launch
- Uses cache-busting URLs
- Disables browser caching

This ensures you always get the latest version!

