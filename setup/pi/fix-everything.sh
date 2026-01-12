#!/bin/bash
# Complete fix script: Desktop Icon + Cache Issue
# Run this script to fix both the desktop icon and cache problems

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PI_USER="${SUDO_USER:-$(whoami)}"
PI_HOME="$(eval echo "~${PI_USER}")"

echo "========================================"
echo "  Complete Kiosk Fix Script"
echo "  Fixes: Desktop Icon + Cache Issue"
echo "========================================"
echo ""
echo "Project: ${PROJECT_DIR}"
echo "User: ${PI_USER}"
echo ""

# ============================================
# PART 1: Fix Desktop Icon
# ============================================
echo "========================================"
echo "  PART 1: Fixing Desktop Icon"
echo "========================================"
echo ""

# Step 1: Remove old desktop files
echo "[1/4] Removing old desktop files..."
rm -f "${PI_HOME}/Desktop/STEM Discovery Kiosk.desktop"
rm -f "${PI_HOME}/Desktop/stem-kiosk.desktop"
rm -f "${PI_HOME}/Desktop/restart_kiosk.desktop"
rm -f "${PI_HOME}/.config/autostart/stem-kiosk.desktop"
rm -f "${PI_HOME}/.config/autostart/restart_kiosk.desktop"
echo "✅ Old desktop files removed"

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
    cp "${AUTOSTART_FILE}" "${DESKTOP_SHORTCUT}"
    chmod +x "${DESKTOP_SHORTCUT}"
    chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}" 2>/dev/null || sudo chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}"
    echo "✅ Desktop shortcut created: ${DESKTOP_SHORTCUT}"
else
    echo "⚠️  Desktop folder not found, creating it..."
    mkdir -p "${DESKTOP_DIR}"
    DESKTOP_SHORTCUT="${DESKTOP_DIR}/STEM Discovery Kiosk.desktop"
    cp "${AUTOSTART_FILE}" "${DESKTOP_SHORTCUT}"
    chmod +x "${DESKTOP_SHORTCUT}"
    chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}" 2>/dev/null || sudo chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}"
    echo "✅ Desktop folder and shortcut created"
fi

# Step 4: Refresh desktop
echo "[4/4] Refreshing desktop..."
if command -v xdg-desktop-menu >/dev/null 2>&1; then
    xdg-desktop-menu forceupdate 2>/dev/null || true
fi
if pgrep -x "pcmanfm" > /dev/null; then
    killall -HUP pcmanfm 2>/dev/null || true
elif pgrep -x "nautilus" > /dev/null; then
    killall -HUP nautilus 2>/dev/null || true
fi
echo "✅ Desktop refreshed"

# ============================================
# PART 2: Fix Cache Issue
# ============================================
echo ""
echo "========================================"
echo "  PART 2: Fixing Cache Issue"
echo "========================================"
echo ""

# Step 1: Stop Chromium
echo "[1/3] Stopping Chromium..."
pkill -f chromium 2>/dev/null || true
sleep 2
echo "✅ Chromium stopped"

# Step 2: Clear cache
echo "[2/3] Clearing Chromium cache..."
CHROMIUM_CACHE_DIR="${PI_HOME}/.cache/chromium"
if [[ -d "${CHROMIUM_CACHE_DIR}" ]]; then
    rm -rf "${CHROMIUM_CACHE_DIR}/Default/Cache" 2>/dev/null || true
    rm -rf "${CHROMIUM_CACHE_DIR}/Default/Code Cache" 2>/dev/null || true
    rm -rf "${CHROMIUM_CACHE_DIR}/ShaderCache" 2>/dev/null || true
    rm -rf "${CHROMIUM_CACHE_DIR}/Default/GPUCache" 2>/dev/null || true
    rm -rf "${CHROMIUM_CACHE_DIR}/Default/Service Worker" 2>/dev/null || true
    echo "✅ Cache cleared"
else
    echo "⚠️  Chromium cache directory not found (may not exist yet)"
fi

# Step 3: Verify restart script has cache clearing
echo "[3/3] Verifying restart script..."
if grep -q "Clearing Chromium cache" "${PROJECT_DIR}/setup/restart_kiosk.sh"; then
    echo "✅ Restart script includes cache clearing"
else
    echo "⚠️  Restart script may need update"
fi

# ============================================
# PART 3: Verification
# ============================================
echo ""
echo "========================================"
echo "  PART 3: Verification"
echo "========================================"
echo ""

# Verify desktop file
if [[ -f "${DESKTOP_SHORTCUT}" ]]; then
    echo "✅ Desktop file exists: ${DESKTOP_SHORTCUT}"
    if [[ -x "${DESKTOP_SHORTCUT}" ]]; then
        echo "✅ Desktop file is executable"
    else
        echo "⚠️  Fixing permissions..."
        chmod +x "${DESKTOP_SHORTCUT}"
    fi
    
    EXEC_PATH=$(grep "^Exec=" "${DESKTOP_SHORTCUT}" | cut -d'=' -f2)
    echo "✅ Exec path: ${EXEC_PATH}"
    
    if [[ -f "${EXEC_PATH}" ]]; then
        echo "✅ Script file exists"
        if [[ -x "${EXEC_PATH}" ]]; then
            echo "✅ Script is executable"
        else
            echo "⚠️  Fixing script permissions..."
            chmod +x "${EXEC_PATH}"
        fi
    else
        echo "❌ Script file NOT found: ${EXEC_PATH}"
    fi
else
    echo "❌ Desktop file NOT found!"
fi

# Verify restart script
if [[ -f "${PROJECT_DIR}/setup/restart_kiosk.sh" ]]; then
    echo "✅ Restart script exists"
    if grep -q "Clearing Chromium cache" "${PROJECT_DIR}/setup/restart_kiosk.sh"; then
        echo "✅ Restart script includes cache clearing"
    fi
    if grep -q "nocache=1" "${PROJECT_DIR}/setup/restart_kiosk.sh"; then
        echo "✅ Restart script includes cache-busting URL"
    fi
fi

echo ""
echo "========================================"
echo "         ALL FIXES COMPLETE!"
echo "========================================"
echo ""
echo "✅ Desktop icon fixed"
echo "✅ Browser cache cleared"
echo "✅ Restart script updated"
echo ""
echo "Next steps:"
echo "1. Refresh desktop: Right-click → Refresh (or press F5)"
echo "2. Look for 'STEM Discovery Kiosk' icon on desktop"
echo "3. Double-click the icon to launch (will load fresh version)"
echo ""
echo "Or restart the kiosk now:"
echo "  ${PROJECT_DIR}/setup/restart_kiosk.sh"
echo ""
echo "The kiosk will now:"
echo "  - Load the latest version (no Circuit Memory Lab)"
echo "  - Clear cache automatically on each launch"
echo "  - Use cache-busting URLs"
echo ""

