#!/bin/bash
# Update desktop icon for STEM Discovery Kiosk
# Run this script to update old desktop files with new paths

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PI_USER="${SUDO_USER:-$(whoami)}"
PI_HOME="$(eval echo "~${PI_USER}")"

echo "========================================"
echo "  Updating STEM Kiosk Desktop Icon"
echo "========================================"
echo ""

# Remove old desktop files
echo "[1/4] Removing old desktop files..."
rm -f "${PI_HOME}/Desktop/STEM Discovery Kiosk.desktop"
rm -f "${PI_HOME}/Desktop/stem-kiosk.desktop"
rm -f "${PI_HOME}/Desktop/restart_kiosk.desktop"
rm -f "${PI_HOME}/.config/autostart/stem-kiosk.desktop"
rm -f "${PI_HOME}/.config/autostart/restart_kiosk.desktop"
echo "Old files removed."

# Create new autostart file
echo "[2/4] Creating new autostart file..."
AUTOSTART_DIR="${PI_HOME}/.config/autostart"
mkdir -p "${AUTOSTART_DIR}"
AUTOSTART_FILE="${AUTOSTART_DIR}/stem-kiosk.desktop"
cat <<EOF > "${AUTOSTART_FILE}"
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
chown "${PI_USER}":"${PI_USER}" "${AUTOSTART_FILE}"
echo "Autostart file created: ${AUTOSTART_FILE}"

# Create desktop shortcut
echo "[3/4] Creating desktop shortcut..."
DESKTOP_DIR="${PI_HOME}/Desktop"
if [[ -d "${DESKTOP_DIR}" ]]; then
    DESKTOP_SHORTCUT="${DESKTOP_DIR}/STEM Discovery Kiosk.desktop"
    cp "${AUTOSTART_FILE}" "${DESKTOP_SHORTCUT}"
    chmod +x "${DESKTOP_SHORTCUT}"
    chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}"
    echo "Desktop shortcut created: ${DESKTOP_SHORTCUT}"
else
    echo "Desktop folder not found, skipping desktop shortcut."
fi

# Refresh desktop (multiple methods)
echo "[4/4] Refreshing desktop..."
if command -v xdg-desktop-menu >/dev/null 2>&1; then
    xdg-desktop-menu forceupdate 2>/dev/null || true
    echo "✅ Desktop menu refreshed"
fi

# Try additional refresh methods
if command -v dbus-send >/dev/null 2>&1; then
    dbus-send --session --dest=org.freedesktop.FileManager1 --type=method_call \
        /org/freedesktop/FileManager1 org.freedesktop.FileManager1.Refresh 2>/dev/null || true
fi

# Gently refresh file manager
if pgrep -x "pcmanfm" > /dev/null; then
    killall -HUP pcmanfm 2>/dev/null || true
elif pgrep -x "nautilus" > /dev/null; then
    killall -HUP nautilus 2>/dev/null || true
fi

# Verify the icon
echo ""
echo "Verifying desktop icon..."
if [[ -f "${DESKTOP_SHORTCUT}" ]]; then
    echo "✅ Desktop file exists: ${DESKTOP_SHORTCUT}"
    if [[ -x "${DESKTOP_SHORTCUT}" ]]; then
        echo "✅ Desktop file is executable"
    else
        echo "⚠️  Fixing permissions..."
        chmod +x "${DESKTOP_SHORTCUT}"
    fi
    
    # Check Exec path
    EXEC_PATH=$(grep "^Exec=" "${DESKTOP_SHORTCUT}" | cut -d'=' -f2)
    echo "✅ Exec path: ${EXEC_PATH}"
    
    if [[ -f "${EXEC_PATH}" ]]; then
        echo "✅ Script exists and is ready"
        if [[ ! -x "${EXEC_PATH}" ]]; then
            chmod +x "${EXEC_PATH}"
            echo "✅ Script permissions fixed"
        fi
    else
        echo "❌ Script NOT found: ${EXEC_PATH}"
    fi
else
    echo "❌ Desktop file NOT created!"
fi

echo ""
echo "========================================"
echo "         UPDATE COMPLETE!"
echo "========================================"
echo ""
echo "Desktop icon has been updated with new paths."
echo ""
echo "If you don't see the icon:"
echo "1. Right-click desktop → Refresh (or press F5)"
echo "2. Or run: xdg-desktop-menu forceupdate"
echo "3. Or log out and log back in (no full reboot needed)"
echo ""
echo "To test: Double-click 'STEM Discovery Kiosk' on your desktop"
echo ""

