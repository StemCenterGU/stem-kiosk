#!/bin/bash
# Comprehensive fix script for Raspberry Pi kiosk issues
# Run this script to diagnose and fix common issues

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PI_USER="${SUDO_USER:-$(whoami)}"
PI_HOME="$(eval echo "~${PI_USER}")"

echo "========================================"
echo "  STEM Kiosk Raspberry Pi Fix Script"
echo "========================================"
echo ""
echo "Project directory: ${PROJECT_DIR}"
echo "User: ${PI_USER}"
echo "Home: ${PI_HOME}"
echo ""

# Check if running as root for systemd operations
NEED_SUDO=false
if [[ $(id -u) -ne 0 ]]; then
    echo "⚠️  Not running as root. Some operations may require sudo."
    NEED_SUDO=true
fi

# Step 1: Check Python
echo "[1/8] Checking Python installation..."
PYTHON_BIN="$(command -v python3 || command -v python)"
if [[ -z "${PYTHON_BIN}" ]]; then
    echo "❌ Python not found! Installing..."
    if [[ "$NEED_SUDO" == "true" ]]; then
        sudo apt-get update
        sudo apt-get install -y python3
    else
        apt-get update
        apt-get install -y python3
    fi
    PYTHON_BIN="$(command -v python3)"
else
    echo "✅ Python found: ${PYTHON_BIN}"
    ${PYTHON_BIN} --version
fi

# Step 2: Check Chromium
echo ""
echo "[2/8] Checking Chromium installation..."
CHROMIUM_BIN="$(command -v chromium-browser || command -v chromium || command -v chromium-browser-stable)"
if [[ -z "${CHROMIUM_BIN}" ]]; then
    echo "❌ Chromium not found! Installing..."
    if [[ "$NEED_SUDO" == "true" ]]; then
        sudo apt-get install -y chromium-browser
    else
        apt-get install -y chromium-browser
    fi
    CHROMIUM_BIN="$(command -v chromium-browser)"
else
    echo "✅ Chromium found: ${CHROMIUM_BIN}"
fi

# Step 3: Verify project structure
echo ""
echo "[3/8] Verifying project structure..."
REQUIRED_FILES=(
    "backend/server.py"
    "frontend/index.html"
    "setup/restart_kiosk.sh"
    "start-server.sh"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "${PROJECT_DIR}/${file}" ]]; then
        MISSING_FILES+=("${file}")
        echo "❌ Missing: ${file}"
    else
        echo "✅ Found: ${file}"
    fi
done

if [[ ${#MISSING_FILES[@]} -gt 0 ]]; then
    echo "❌ Missing required files! Please check your project structure."
    exit 1
fi

# Step 4: Fix permissions
echo ""
echo "[4/8] Fixing file permissions..."
chmod +x "${PROJECT_DIR}/start-server.sh" 2>/dev/null || sudo chmod +x "${PROJECT_DIR}/start-server.sh"
chmod +x "${PROJECT_DIR}/setup/restart_kiosk.sh" 2>/dev/null || sudo chmod +x "${PROJECT_DIR}/setup/restart_kiosk.sh"
chmod +x "${PROJECT_DIR}/backend/server.py" 2>/dev/null || sudo chmod +x "${PROJECT_DIR}/backend/server.py"
echo "✅ Permissions fixed"

# Step 5: Update start-server.sh with correct Python path
echo ""
echo "[5/8] Updating start-server.sh..."
cat > "${PROJECT_DIR}/start-server.sh" <<EOF
#!/usr/bin/env bash
# Launch the kiosk Python server
cd "${PROJECT_DIR}"
exec ${PYTHON_BIN} "${PROJECT_DIR}/backend/server.py"
EOF
chmod +x "${PROJECT_DIR}/start-server.sh"
chown "${PI_USER}":"${PI_USER}" "${PROJECT_DIR}/start-server.sh" 2>/dev/null || sudo chown "${PI_USER}":"${PI_USER}" "${PROJECT_DIR}/start-server.sh"
echo "✅ start-server.sh updated"

# Step 6: Fix systemd service
echo ""
echo "[6/8] Updating systemd service..."
SERVICE_FILE="/etc/systemd/system/stem-kiosk.service"
if [[ "$NEED_SUDO" == "true" ]]; then
    sudo tee "${SERVICE_FILE}" > /dev/null <<EOF
[Unit]
Description=STEM Kiosk Web Server
After=network.target

[Service]
Type=simple
ExecStart=${PROJECT_DIR}/start-server.sh
WorkingDirectory=${PROJECT_DIR}
Restart=always
RestartSec=10
User=${PI_USER}
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    sudo systemctl enable stem-kiosk.service
    echo "✅ Systemd service updated"
else
    tee "${SERVICE_FILE}" > /dev/null <<EOF
[Unit]
Description=STEM Kiosk Web Server
After=network.target

[Service]
Type=simple
ExecStart=${PROJECT_DIR}/start-server.sh
WorkingDirectory=${PROJECT_DIR}
Restart=always
RestartSec=10
User=${PI_USER}
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable stem-kiosk.service
    echo "✅ Systemd service updated"
fi

# Step 7: Fix desktop files
echo ""
echo "[7/8] Fixing desktop application files..."
AUTOSTART_DIR="${PI_HOME}/.config/autostart"
mkdir -p "${AUTOSTART_DIR}"

# Remove old desktop files
rm -f "${PI_HOME}/Desktop/STEM Discovery Kiosk.desktop"
rm -f "${PI_HOME}/Desktop/stem-kiosk.desktop"
rm -f "${PI_HOME}/Desktop/restart_kiosk.desktop"
rm -f "${AUTOSTART_DIR}/stem-kiosk.desktop"
rm -f "${AUTOSTART_DIR}/restart_kiosk.desktop"

# Create new autostart file
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

# Create desktop shortcut
DESKTOP_DIR="${PI_HOME}/Desktop"
if [[ -d "${DESKTOP_DIR}" ]]; then
    DESKTOP_SHORTCUT="${DESKTOP_DIR}/STEM Discovery Kiosk.desktop"
    cp "${AUTOSTART_FILE}" "${DESKTOP_SHORTCUT}"
    chmod +x "${DESKTOP_SHORTCUT}"
    chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}" 2>/dev/null || sudo chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}"
    echo "✅ Desktop shortcut created: ${DESKTOP_SHORTCUT}"
else
    echo "⚠️  Desktop folder not found, skipping desktop shortcut"
fi
echo "✅ Desktop files fixed"

# Step 8: Test server
echo ""
echo "[8/8] Testing server startup..."
if [[ "$NEED_SUDO" == "true" ]]; then
    sudo systemctl restart stem-kiosk.service
    sleep 3
    sudo systemctl status stem-kiosk.service --no-pager -l || true
else
    systemctl restart stem-kiosk.service
    sleep 3
    systemctl status stem-kiosk.service --no-pager -l || true
fi

# Check if server is responding
if curl -fsS --max-time 2 "http://localhost:8000" >/dev/null 2>&1; then
    echo "✅ Server is running and responding!"
else
    echo "⚠️  Server may not be responding yet. Check logs with:"
    echo "   sudo journalctl -u stem-kiosk.service -f"
fi

echo ""
echo "========================================"
echo "         FIX COMPLETE!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Check server status: sudo systemctl status stem-kiosk.service"
echo "2. Check server logs: sudo journalctl -u stem-kiosk.service -f"
echo "3. Test desktop icon: Double-click 'STEM Discovery Kiosk' on desktop"
echo "4. Reboot if needed: sudo reboot"
echo ""

