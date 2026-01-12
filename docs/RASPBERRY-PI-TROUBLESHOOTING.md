# Raspberry Pi Troubleshooting Guide

If the kiosk is not starting on Raspberry Pi, follow these steps:

## Quick Fix

Run the comprehensive fix script:

```bash
cd /home/pi/stem-kiosk
chmod +x setup/pi/fix-raspberry-pi.sh
sudo ./setup/pi/fix-raspberry-pi.sh
```

This script will:
- ✅ Check and install Python/Chromium if needed
- ✅ Verify project structure
- ✅ Fix file permissions
- ✅ Update systemd service
- ✅ Fix desktop application files
- ✅ Test server startup

## Common Issues

### Issue 1: Server Not Starting

**Symptoms:**
- Desktop icon doesn't work
- Browser shows "connection refused"
- No response on http://localhost:8000

**Fix:**
```bash
# Check server status
sudo systemctl status stem-kiosk.service

# Check server logs
sudo journalctl -u stem-kiosk.service -f

# Restart server
sudo systemctl restart stem-kiosk.service

# Start server manually to see errors
cd /home/pi/stem-kiosk
./start-server.sh
```

### Issue 2: Desktop Icon Not Working

**Symptoms:**
- Double-clicking icon does nothing
- Icon shows error when clicked

**Fix:**
```bash
# Update desktop icon
cd /home/pi/stem-kiosk
./setup/pi/update-desktop-icon.sh

# Or manually check the desktop file
cat ~/Desktop/STEM\ Discovery\ Kiosk.desktop

# Make sure it points to: /home/pi/stem-kiosk/setup/restart_kiosk.sh
```

### Issue 3: Wrong Paths in Scripts

**Symptoms:**
- "File not found" errors
- Scripts can't find server.py or other files

**Fix:**
```bash
# Verify project structure
ls -la /home/pi/stem-kiosk/backend/server.py
ls -la /home/pi/stem-kiosk/setup/restart_kiosk.sh
ls -la /home/pi/stem-kiosk/start-server.sh

# All should exist. If not, check your project structure.
```

### Issue 4: Permission Denied

**Symptoms:**
- "Permission denied" when running scripts
- Can't start server

**Fix:**
```bash
# Fix permissions
cd /home/pi/stem-kiosk
chmod +x start-server.sh
chmod +x setup/restart_kiosk.sh
chmod +x backend/server.py
chmod +x setup/pi/*.sh
```

### Issue 5: Python Not Found

**Symptoms:**
- "python3: command not found"
- Server won't start

**Fix:**
```bash
# Install Python
sudo apt-get update
sudo apt-get install -y python3

# Verify installation
python3 --version
which python3
```

### Issue 6: Chromium Not Found

**Symptoms:**
- Browser won't launch
- "chromium-browser: command not found"

**Fix:**
```bash
# Install Chromium
sudo apt-get update
sudo apt-get install -y chromium-browser

# Verify installation
which chromium-browser
```

## Manual Testing

### Test 1: Start Server Manually

```bash
cd /home/pi/stem-kiosk
./start-server.sh
```

You should see:
```
Serving kiosk content from /home/pi/stem-kiosk/frontend on port 8000
```

### Test 2: Test in Browser

Open a browser and go to: `http://localhost:8000`

You should see the kiosk home screen.

### Test 3: Test Desktop Icon

1. Double-click "STEM Discovery Kiosk" on desktop
2. Chromium should launch in kiosk mode
3. Kiosk should display

### Test 4: Check Systemd Service

```bash
# Check if service is running
sudo systemctl is-active stem-kiosk.service

# Should output: active

# Check service logs
sudo journalctl -u stem-kiosk.service --no-pager -n 50
```

## Complete Reinstall

If nothing works, do a complete reinstall:

```bash
# Stop everything
sudo systemctl stop stem-kiosk.service
pkill -f chromium
pkill -f "python.*server.py"

# Remove old files
rm -f ~/.config/autostart/stem-kiosk.desktop
rm -f ~/Desktop/STEM\ Discovery\ Kiosk.desktop

# Run full setup
cd /home/pi/stem-kiosk
sudo ./setup/pi/setup_pi_kiosk.sh

# Or run fix script
sudo ./setup/pi/fix-raspberry-pi.sh

# Reboot
sudo reboot
```

## Checking Logs

### Server Logs
```bash
sudo journalctl -u stem-kiosk.service -f
```

### System Logs
```bash
sudo journalctl -xe
```

### Check What's Using Port 8000
```bash
sudo lsof -i :8000
# or
sudo netstat -tulpn | grep 8000
```

## After Fixing

1. **Reboot the Pi:**
   ```bash
   sudo reboot
   ```

2. **Verify on boot:**
   - Server should start automatically
   - Desktop icon should appear
   - Kiosk should launch after ~10 seconds

3. **If still not working:**
   - Check logs: `sudo journalctl -u stem-kiosk.service -f`
   - Test manually: `./start-server.sh`
   - Verify paths in all scripts

## Getting Help

If issues persist:
1. Run the fix script: `sudo ./setup/pi/fix-raspberry-pi.sh`
2. Check all logs
3. Verify project structure matches expected layout
4. Make sure all paths are correct for your installation

