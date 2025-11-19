#!/bin/bash
# Launch Chromium in kiosk mode to display the STEM Discovery Kiosk
CHROMIUM_BIN="$(command -v chromium-browser || command -v chromium || command -v chromium-browser-stable)"
if [[ -z "${CHROMIUM_BIN}" ]]; then
  echo "Chromium is not installed or not in PATH."
  exit 1
fi

# Kill any existing Chromium processes to prevent conflicts
echo "Stopping any existing Chromium processes..."
pkill -f chromium 2>/dev/null || true
sleep 2

# Reduced delay for faster startup
START_DELAY="${KIOSK_START_DELAY:-10}"
if [[ "${START_DELAY}" =~ ^[0-9]+$ && "${START_DELAY}" -gt 0 ]]; then
  echo "Delaying Chromium launch by ${START_DELAY}s..."
  sleep "${START_DELAY}"
fi

SERVER_URL="http://localhost:8000"
if command -v curl >/dev/null 2>&1; then
  MAX_WAIT=15
  WAITED=0
  echo "Checking if server is ready..."
  until curl -fsS --max-time 2 "${SERVER_URL}" >/dev/null; do
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

echo "Launching Chromium in kiosk mode..."
"${CHROMIUM_BIN}" \
  --app=http://localhost:8000 \
  --kiosk \
  --start-fullscreen \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --password-store=basic \
  --noerrdialogs \
  --disable-infobars \
  --disable-web-security \
  --memory-pressure-off
