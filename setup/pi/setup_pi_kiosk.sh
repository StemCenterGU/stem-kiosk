#!/usr/bin/env bash
# Automated setup for STEM Discovery Kiosk on Raspberry Pi
set -euo pipefail

if [[ $(id -u) -ne 0 ]]; then
  echo "Please run this script with sudo: sudo ./setup_pi_kiosk.sh"
  exit 1
fi

# Get project root (two levels up from setup/pi/)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PI_USER="${SUDO_USER:-$(id -un)}"
PI_HOME="$(eval echo "~${PI_USER}")"
PYTHON_BIN="$(command -v python3 || true)"
CHROMIUM_BIN="$(command -v chromium-browser || true)"

echo "==================================="
echo "STEM Kiosk Setup for Raspberry Pi"
echo "==================================="
echo ""

# Install packages
echo "[1/6] Installing required packages..."
apt-get update
apt-get install -y python3 chromium-browser curl unclutter xdotool

PYTHON_BIN="$(command -v python3)"
CHROMIUM_BIN="$(command -v chromium-browser || command -v chromium || true)"

if [[ -z "${CHROMIUM_BIN}" ]]; then
  echo "ERROR: chromium-browser could not be found."
  exit 1
fi
if [[ -z "${PYTHON_BIN}" ]]; then
  echo "ERROR: python3 could not be found."
  exit 1
fi

# Disable screen blanking
echo "[2/6] Disabling screen blanking..."
mkdir -p /etc/X11/xorg.conf.d/
cat > /etc/X11/xorg.conf.d/10-blanking.conf << 'XORGEOF'
Section "ServerFlags"
    Option "BlankTime" "0"
    Option "StandbyTime" "0"
    Option "SuspendTime" "0"
    Option "OffTime" "0"
EndSection
XORGEOF

# Disable system updates/notifications
echo "[3/6] Disabling automatic updates..."
systemctl disable apt-daily.service 2>/dev/null || true
systemctl disable apt-daily-upgrade.service 2>/dev/null || true
systemctl disable apt-daily.timer 2>/dev/null || true
systemctl disable apt-daily-upgrade.timer 2>/dev/null || true

# Setup scripts
echo "[4/6] Setting up scripts..."
chmod +x "${PROJECT_DIR}/setup/restart_kiosk.sh"
chown "${PI_USER}":"${PI_USER}" "${PROJECT_DIR}/setup/restart_kiosk.sh"

START_SERVER="${PROJECT_DIR}/start-server.sh"
cat <<EOF > "${START_SERVER}"
#!/usr/bin/env bash
cd "${PROJECT_DIR}"
exec ${PYTHON_BIN} ${PROJECT_DIR}/backend/server.py
EOF
chmod +x "${START_SERVER}"
chown "${PI_USER}":"${PI_USER}" "${START_SERVER}"

# Systemd service for web server
echo "[5/6] Creating systemd service..."
SERVICE_FILE="/etc/systemd/system/stem-kiosk.service"
cat <<EOF > "${SERVICE_FILE}"
[Unit]
Description=STEM Kiosk Web Server
After=network.target

[Service]
Type=simple
ExecStart=${START_SERVER}
WorkingDirectory=${PROJECT_DIR}
Restart=always
RestartSec=5
User=${PI_USER}
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now stem-kiosk.service

# Desktop autostart
echo "[6/6] Configuring autostart..."
AUTOSTART_DIR="${PI_HOME}/.config/autostart"
AUTOSTART_FILE="${AUTOSTART_DIR}/stem-kiosk.desktop"
mkdir -p "${AUTOSTART_DIR}"
cat <<EOF > "${AUTOSTART_FILE}"
[Desktop Entry]
Type=Application
Name=STEM Discovery Kiosk
Comment=Launch the STEM Discovery Kiosk
Exec=${PROJECT_DIR}/setup/restart_kiosk.sh
Terminal=false
Categories=Utility;
EOF
chown -R "${PI_USER}":"${PI_USER}" "${AUTOSTART_DIR}"

# Desktop shortcut
DESKTOP_DIR="${PI_HOME}/Desktop"
if [[ -d "${DESKTOP_DIR}" ]]; then
  DESKTOP_SHORTCUT="${DESKTOP_DIR}/STEM Kiosk.desktop"
  cp "${AUTOSTART_FILE}" "${DESKTOP_SHORTCUT}"
  chmod +x "${DESKTOP_SHORTCUT}"
  chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}"
fi

echo ""
echo "==================================="
echo "Setup complete!"
echo "==================================="
echo ""
echo "Reboot to start the kiosk automatically."
echo "Or run: ${PROJECT_DIR}/setup/restart_kiosk.sh"
