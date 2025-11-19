#!/bin/bash
# Quick fix for desktop icon - no reboot needed
# Run this script to immediately fix the desktop icon

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PI_USER="${SUDO_USER:-$(whoami)}"
PI_HOME="$(eval echo "~${PI_USER}")"

echo "========================================"
echo "  Quick Desktop Icon Fix"
echo "========================================"
echo ""

# Step 1: Remove ALL old desktop files
echo "[1/4] Removing old desktop files..."
rm -f "${PI_HOME}/Desktop/STEM Discovery Kiosk.desktop"
rm -f "${PI_HOME}/Desktop/stem-kiosk.desktop"
rm -f "${PI_HOME}/Desktop/restart_kiosk.desktop"
rm -f "${PI_HOME}/.config/autostart/stem-kiosk.desktop"
rm -f "${PI_HOME}/.config/autostart/restart_kiosk.desktop"
rm -f "${PI_HOME}/Desktop/"*.desktop 2>/dev/null | grep -i kiosk || true
echo "✅ Old files removed"

# Step 2: Create new autostart file
echo "[2/4] Creating new autostart file..."
AUTOSTART_DIR="${PI_HOME}/.config/autostart"
mkdir -p "${AUTOSTART_DIR}"
AUTOSTART_FILE="${AUTOSTART_DIR}/stem-kiosk.desktop"

cat > "${AUTOSTART_FILE}" <<EOF
[Desktop Entry]
Type=Application
Name=STEM Discovery Kiosk
Comment=Launch the STEM Discovery Kiosk
Exec=${PROJECT_DIR}/setup/restart_kiosk.sh
Icon=/usr/share/icons/Adwaita/32x32/actions/system-run.png
Terminal=false
Categories=Utility;
X-GNOME-Autostart-enabled=true
EOF

chmod +x "${AUTOSTART_FILE}"
chown "${PI_USER}":"${PI_USER}" "${AUTOSTART_FILE}" 2>/dev/null || sudo chown "${PI_USER}":"${PI_USER}" "${AUTOSTART_FILE}"
echo "✅ Autostart file created: ${AUTOSTART_FILE}"

# Step 3: Create desktop shortcut
echo "[3/4] Creating desktop shortcut..."
DESKTOP_DIR="${PI_HOME}/Desktop"
if [[ -d "${DESKTOP_DIR}" ]]; then
    DESKTOP_SHORTCUT="${DESKTOP_DIR}/STEM Discovery Kiosk.desktop"
    
    # Copy from autostart file
    cp "${AUTOSTART_FILE}" "${DESKTOP_SHORTCUT}"
    chmod +x "${DESKTOP_SHORTCUT}"
    chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}" 2>/dev/null || sudo chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}"
    
    echo "✅ Desktop shortcut created: ${DESKTOP_SHORTCUT}"
    
    # Verify the file content
    echo ""
    echo "Desktop file contents:"
    cat "${DESKTOP_SHORTCUT}"
    echo ""
else
    echo "⚠️  Desktop folder not found at ${DESKTOP_DIR}"
    echo "Creating it..."
    mkdir -p "${DESKTOP_DIR}"
    DESKTOP_SHORTCUT="${DESKTOP_DIR}/STEM Discovery Kiosk.desktop"
    cp "${AUTOSTART_FILE}" "${DESKTOP_SHORTCUT}"
    chmod +x "${DESKTOP_SHORTCUT}"
    chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}" 2>/dev/null || sudo chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}"
    echo "✅ Desktop folder and shortcut created"
fi

# Step 4: Refresh desktop (multiple methods)
echo "[4/4] Refreshing desktop..."
if command -v xdg-desktop-menu >/dev/null 2>&1; then
    xdg-desktop-menu forceupdate 2>/dev/null || true
    echo "✅ Desktop menu refreshed"
fi

# Try to refresh desktop using other methods
if command -v dbus-send >/dev/null 2>&1; then
    dbus-send --session --dest=org.freedesktop.FileManager1 --type=method_call \
        /org/freedesktop/FileManager1 org.freedesktop.FileManager1.Refresh 2>/dev/null || true
fi

# Kill and restart file manager if possible (gentle way)
if pgrep -x "pcmanfm" > /dev/null; then
    killall -HUP pcmanfm 2>/dev/null || true
elif pgrep -x "nautilus" > /dev/null; then
    killall -HUP nautilus 2>/dev/null || true
fi

echo "✅ Desktop refresh attempted"

# Verify the icon exists and is executable
echo ""
echo "========================================"
echo "         VERIFICATION"
echo "========================================"
if [[ -f "${DESKTOP_SHORTCUT}" ]]; then
    echo "✅ Desktop file exists: ${DESKTOP_SHORTCUT}"
    if [[ -x "${DESKTOP_SHORTCUT}" ]]; then
        echo "✅ Desktop file is executable"
    else
        echo "⚠️  Desktop file is NOT executable, fixing..."
        chmod +x "${DESKTOP_SHORTCUT}"
    fi
    
    # Check the Exec path
    EXEC_PATH=$(grep "^Exec=" "${DESKTOP_SHORTCUT}" | cut -d'=' -f2)
    echo "✅ Exec path: ${EXEC_PATH}"
    
    # Verify the script exists
    if [[ -f "${EXEC_PATH}" ]]; then
        echo "✅ Script file exists"
        if [[ -x "${EXEC_PATH}" ]]; then
            echo "✅ Script is executable"
        else
            echo "⚠️  Script is NOT executable, fixing..."
            chmod +x "${EXEC_PATH}"
        fi
    else
        echo "❌ Script file NOT found: ${EXEC_PATH}"
        echo "   Please check your project directory path"
    fi
else
    echo "❌ Desktop file NOT found!"
fi

echo ""
echo "========================================"
echo "         FIX COMPLETE!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Look for 'STEM Discovery Kiosk' icon on your desktop"
echo "2. If you don't see it, try:"
echo "   - Right-click desktop → Refresh"
echo "   - Log out and log back in"
echo "   - Or run: xdg-desktop-menu forceupdate"
echo ""
echo "3. To test the icon:"
echo "   - Double-click it"
echo "   - Or right-click → Open"
echo ""
echo "4. If it still doesn't work, check:"
echo "   cat ${DESKTOP_SHORTCUT}"
echo "   ls -la ${EXEC_PATH}"
echo ""

