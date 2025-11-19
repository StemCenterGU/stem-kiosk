#!/bin/bash
# Launch Chromium in kiosk mode to display the STEM Discovery Kiosk

# Get project directory (one level up from setup/)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PI_USER="${SUDO_USER:-$(whoami)}"
PI_HOME="$(eval echo "~${PI_USER}")"

# Ensure server is running
if ! curl -fsS --max-time 2 "http://localhost:8000" >/dev/null 2>&1; then
    echo "Server not running. Starting server..."
    cd "${PROJECT_DIR}"
    nohup "${PROJECT_DIR}/start-server.sh" > /tmp/stem-kiosk-server.log 2>&1 &
    sleep 3
fi

CHROMIUM_BIN="$(command -v chromium-browser || command -v chromium || command -v chromium-browser-stable)"
if [[ -z "${CHROMIUM_BIN}" ]]; then
  echo "Chromium is not installed or not in PATH."
  exit 1
fi

# Kill any existing Chromium processes to prevent conflicts
echo "Stopping any existing Chromium processes..."
pkill -f chromium 2>/dev/null || true
sleep 2

# Clear Chromium cache to ensure fresh load
echo "Clearing Chromium cache..."
CHROMIUM_CACHE_DIR="${PI_HOME}/.cache/chromium"
if [[ -d "${CHROMIUM_CACHE_DIR}" ]]; then
    rm -rf "${CHROMIUM_CACHE_DIR}/Default/Cache" 2>/dev/null || true
    rm -rf "${CHROMIUM_CACHE_DIR}/Default/Code Cache" 2>/dev/null || true
    rm -rf "${CHROMIUM_CACHE_DIR}/ShaderCache" 2>/dev/null || true
    echo "✅ Cache cleared"
fi

# Reduced delay for faster startup
START_DELAY="${KIOSK_START_DELAY:-10}"
if [[ "${START_DELAY}" =~ ^[0-9]+$ && "${START_DELAY}" -gt 0 ]]; then
  echo "Delaying Chromium launch by ${START_DELAY}s..."
  sleep "${START_DELAY}"
fi

# Add cache-busting timestamp to URL
TIMESTAMP=$(date +%s)
BASE_URL="http://localhost:8000"
SERVER_URL="${BASE_URL}/?v=${TIMESTAMP}&nocache=1"

if command -v curl >/dev/null 2>&1; then
  MAX_WAIT=15
  WAITED=0
  echo "Checking if server is ready..."
  until curl -fsS --max-time 2 "${BASE_URL}" >/dev/null; do
    sleep 1
    WAITED=$((WAITED + 1))
    if [[ ${WAITED} -ge ${MAX_WAIT} ]]; then
      echo "Warning: kiosk server not responding at ${SERVER_URL} after ${MAX_WAIT}s; launching Chromium anyway."
      break
    fi
  done
  echo "Server is ready!"
else
  echo "curl not found; skipping preflight server check."
fi

echo "Launching Chromium in kiosk mode with cache disabled..."
"${CHROMIUM_BIN}" \
  --app="${SERVER_URL}" \
  --kiosk \
  --start-fullscreen \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --password-store=basic \
  --noerrdialogs \
  --disable-infobars \
  --disable-web-security \
  --memory-pressure-off \
  --disable-application-cache \
  --aggressive-cache-discard \
  --disable-background-networking \
  --disable-background-timer-throttling \
  --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding
