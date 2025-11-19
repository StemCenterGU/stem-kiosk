# Updating Raspberry Pi Desktop Icon

If you have an old desktop icon on your Raspberry Pi that doesn't work after the project restructure, follow these steps:

## Quick Update (Recommended)

Run the update script from your project directory:

```bash
cd /home/pi/stem-kiosk
chmod +x setup/pi/update-desktop-icon.sh
./setup/pi/update-desktop-icon.sh
```

This script will:
- ✅ Remove old desktop files with incorrect paths
- ✅ Create new autostart file with correct paths
- ✅ Create new desktop shortcut
- ✅ Refresh the desktop

## Manual Update

If you prefer to update manually:

### Step 1: Remove Old Desktop Files

```bash
rm ~/Desktop/STEM\ Discovery\ Kiosk.desktop
rm ~/Desktop/stem-kiosk.desktop
rm ~/Desktop/restart_kiosk.desktop
rm ~/.config/autostart/stem-kiosk.desktop
rm ~/.config/autostart/restart_kiosk.desktop
```

### Step 2: Run Full Setup (Recommended)

The easiest way is to run the full setup script again:

```bash
cd /home/pi/stem-kiosk
sudo ./setup/pi/setup_pi_kiosk.sh
```

This will:
- Update all paths
- Create new desktop files
- Update systemd service
- Ensure everything is configured correctly

### Step 3: Verify

After running the setup, you should see:
- New desktop icon: `~/Desktop/STEM Discovery Kiosk.desktop`
- Autostart file: `~/.config/autostart/stem-kiosk.desktop`

Both should point to: `/home/pi/stem-kiosk/setup/restart_kiosk.sh`

## What Changed

**Old paths (incorrect):**
- `/home/pi/stem-kiosk/restart_kiosk.sh`
- `/home/pi/stem-kiosk/server.py`

**New paths (correct):**
- `/home/pi/stem-kiosk/setup/restart_kiosk.sh`
- `/home/pi/stem-kiosk/backend/server.py`

## Troubleshooting

### Icon Still Doesn't Work

1. Check the desktop file path:
   ```bash
   cat ~/Desktop/STEM\ Discovery\ Kiosk.desktop
   ```
   The `Exec=` line should be: `Exec=/home/pi/stem-kiosk/setup/restart_kiosk.sh`

2. Make sure the script is executable:
   ```bash
   chmod +x /home/pi/stem-kiosk/setup/restart_kiosk.sh
   ```

3. Test the script directly:
   ```bash
   /home/pi/stem-kiosk/setup/restart_kiosk.sh
   ```

### Icon Not Appearing

1. Refresh the desktop:
   ```bash
   xdg-desktop-menu forceupdate
   ```

2. Or log out and log back in

3. Or restart the Pi:
   ```bash
   sudo reboot
   ```

## After Update

Once updated, the desktop icon will:
- ✅ Launch the kiosk correctly
- ✅ Use the new project structure
- ✅ Work with autostart on boot

