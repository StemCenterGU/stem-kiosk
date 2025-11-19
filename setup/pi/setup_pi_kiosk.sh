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
PYTHON_BIN="$(command -v python3)"
CHROMIUM_BIN="$(command -v chromium-browser || true)"

if [[ -z "${PYTHON_BIN}" ]]; then
  echo "python3 is not installed. Installing base packages..."
fi

echo "Installing required packages (python3, chromium-browser, curl)..."
apt-get update
apt-get install -y python3 chromium-browser curl

PYTHON_BIN="$(command -v python3)"
if [[ -z "${CHROMIUM_BIN}" ]]; then
  CHROMIUM_BIN="$(command -v chromium-browser || true)"
fi

if [[ -z "${CHROMIUM_BIN}" ]]; then
  echo "chromium-browser could not be found after installation."
  exit 1
fi
if [[ -z "${PYTHON_BIN}" ]]; then
  echo "python3 could not be found after installation."
  exit 1
fi

echo "Ensuring restart_kiosk.sh is executable..."
chmod +x "${PROJECT_DIR}/setup/restart_kiosk.sh"
chown "${PI_USER}":"${PI_USER}" "${PROJECT_DIR}/setup/restart_kiosk.sh"

START_SERVER="${PROJECT_DIR}/start-server.sh"
if [[ ! -f "${START_SERVER}" ]]; then
  echo "Creating ${START_SERVER}..."
fi
echo "Syncing start-server.sh..."
cat <<EOF > "${START_SERVER}"
#!/usr/bin/env bash
# Launch the kiosk Python server
PROJECT_DIR="${PROJECT_DIR}"
PYTHON_BIN="${PYTHON_BIN}"
cd "\${PROJECT_DIR}"
exec "\${PYTHON_BIN}" "\${PROJECT_DIR}/backend/server.py"
EOF
chmod +x "${START_SERVER}"
chown "${PI_USER}":"${PI_USER}" "${START_SERVER}"

SERVICE_FILE="/etc/systemd/system/stem-kiosk.service"
echo "Writing systemd service to ${SERVICE_FILE}..."
cat <<EOF > "${SERVICE_FILE}"
[Unit]
Description=STEM Kiosk Web Server
After=network.target

[Service]
Type=simple
ExecStart=${START_SERVER}
WorkingDirectory=${PROJECT_DIR}
Restart=always
RestartSec=10
User=${PI_USER}
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now stem-kiosk.service

AUTOSTART_DIR="${PI_HOME}/.config/autostart"
AUTOSTART_FILE="${AUTOSTART_DIR}/stem-kiosk.desktop"
echo "Configuring desktop autostart at ${AUTOSTART_FILE}..."
mkdir -p "${AUTOSTART_DIR}"
cat <<EOF > "${AUTOSTART_FILE}"
[Desktop Entry]
Type=Application
Name=STEM Discovery Kiosk
Comment=Launch the STEM Discovery Kiosk
Exec=${PROJECT_DIR}/setup/restart_kiosk.sh
Icon=/usr/share/icons/Adwaita/32x32/actions/system-run.png
Terminal=false
Categories=Utility;
EOF
chown "${PI_USER}":"${PI_USER}" "${AUTOSTART_FILE}"

DESKTOP_DIR="${PI_HOME}/Desktop"
if [[ -d "${DESKTOP_DIR}" ]]; then
  DESKTOP_SHORTCUT="${DESKTOP_DIR}/STEM Discovery Kiosk.desktop"
  cp "${AUTOSTART_FILE}" "${DESKTOP_SHORTCUT}"
  chmod +x "${DESKTOP_SHORTCUT}"
  chown "${PI_USER}":"${PI_USER}" "${DESKTOP_SHORTCUT}"
  echo "Desktop shortcut created at ${DESKTOP_SHORTCUT}"
else
  echo "Desktop folder not found at ${DESKTOP_DIR}; skipping shortcut copy."
fi

echo "Setup complete. Reboot the Raspberry Pi to launch the kiosk automatically."
