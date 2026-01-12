# Fix Desktop Icon Without Reboot

If the desktop icon didn't get fixed before rebooting, here's how to fix it immediately:

## Quick Fix (No Reboot Needed)

Run this script on your Raspberry Pi:

```bash
cd /home/pi/stem-kiosk
chmod +x setup/pi/fix-desktop-icon-now.sh
./setup/pi/fix-desktop-icon-now.sh
```

Or use the update script:

```bash
cd /home/pi/stem-kiosk
chmod +x setup/pi/update-desktop-icon.sh
./setup/pi/update-desktop-icon.sh
```

## Manual Fix (If Scripts Don't Work)

### Step 1: Remove Old Desktop Files

```bash
rm -f ~/Desktop/STEM\ Discovery\ Kiosk.desktop
rm -f ~/Desktop/stem-kiosk.desktop
rm -f ~/Desktop/restart_kiosk.desktop
rm -f ~/.config/autostart/stem-kiosk.desktop
rm -f ~/.config/autostart/restart_kiosk.desktop
```

### Step 2: Create New Desktop File

```bash
cat > ~/Desktop/STEM\ Discovery\ Kiosk.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=STEM Discovery Kiosk
Comment=Launch the STEM Discovery Kiosk
Exec=/home/pi/stem-kiosk/setup/restart_kiosk.sh
Icon=/usr/share/icons/Adwaita/32x32/actions/system-run.png
Terminal=false
Categories=Utility;
X-GNOME-Autostart-enabled=true
EOF

chmod +x ~/Desktop/STEM\ Discovery\ Kiosk.desktop
```

### Step 3: Refresh Desktop

**Method 1: Right-click desktop → Refresh** (or press F5)

**Method 2: Command line**
```bash
xdg-desktop-menu forceupdate
```

**Method 3: Log out and log back in** (no full reboot needed)

**Method 4: Restart file manager**
```bash
# For LXDE (Raspberry Pi OS)
killall pcmanfm && pcmanfm --desktop &

# For GNOME
killall nautilus && nautilus --desktop &
```

## Verify It Works

1. **Check if file exists:**
   ```bash
   ls -la ~/Desktop/STEM\ Discovery\ Kiosk.desktop
   ```

2. **Check file contents:**
   ```bash
   cat ~/Desktop/STEM\ Discovery\ Kiosk.desktop
   ```
   
   Should show:
   ```
   Exec=/home/pi/stem-kiosk/setup/restart_kiosk.sh
   ```

3. **Check if script exists:**
   ```bash
   ls -la /home/pi/stem-kiosk/setup/restart_kiosk.sh
   ```

4. **Test the script directly:**
   ```bash
   /home/pi/stem-kiosk/setup/restart_kiosk.sh
   ```

## If Icon Still Doesn't Appear

1. **Check desktop directory:**
   ```bash
   ls -la ~/Desktop/
   ```

2. **Check file permissions:**
   ```bash
   chmod +x ~/Desktop/STEM\ Discovery\ Kiosk.desktop
   ```

3. **Check if desktop environment is running:**
   ```bash
   echo $XDG_CURRENT_DESKTOP
   ```

4. **Try creating in different location:**
   ```bash
   # Also create in autostart
   mkdir -p ~/.config/autostart
   cp ~/Desktop/STEM\ Discovery\ Kiosk.desktop ~/.config/autostart/stem-kiosk.desktop
   ```

## Troubleshooting

### Icon Shows But Doesn't Work

Check the Exec path in the desktop file:
```bash
grep "^Exec=" ~/Desktop/STEM\ Discovery\ Kiosk.desktop
```

Should be: `Exec=/home/pi/stem-kiosk/setup/restart_kiosk.sh`

If it's different, edit it:
```bash
nano ~/Desktop/STEM\ Discovery\ Kiosk.desktop
```

### Permission Denied

Fix permissions:
```bash
chmod +x ~/Desktop/STEM\ Discovery\ Kiosk.desktop
chmod +x /home/pi/stem-kiosk/setup/restart_kiosk.sh
```

### Script Not Found

Verify project structure:
```bash
ls -la /home/pi/stem-kiosk/setup/restart_kiosk.sh
ls -la /home/pi/stem-kiosk/backend/server.py
```

If files don't exist, check your project directory path.

## After Fixing

1. **Refresh desktop** (right-click → Refresh or F5)
2. **Look for the icon** - it should appear immediately
3. **Test it** - double-click to launch the kiosk
4. **No reboot needed** - should work right away!

If you still have issues after trying these steps, run the comprehensive fix script:
```bash
sudo ./setup/pi/fix-raspberry-pi.sh
```

