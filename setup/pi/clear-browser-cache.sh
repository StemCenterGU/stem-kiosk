#!/bin/bash
# Clear Chromium browser cache to force fresh load
# Run this if you see old cached version of the kiosk

PI_USER="${SUDO_USER:-$(whoami)}"
PI_HOME="$(eval echo "~${PI_USER}")"

echo "========================================"
echo "  Clearing Chromium Browser Cache"
echo "========================================"
echo ""

# Kill Chromium first
echo "[1/3] Stopping Chromium..."
pkill -f chromium 2>/dev/null || true
sleep 2

# Clear cache directories
echo "[2/3] Clearing cache directories..."
CHROMIUM_CACHE_DIR="${PI_HOME}/.cache/chromium"
if [[ -d "${CHROMIUM_CACHE_DIR}" ]]; then
    echo "Clearing: ${CHROMIUM_CACHE_DIR}/Default/Cache"
    rm -rf "${CHROMIUM_CACHE_DIR}/Default/Cache" 2>/dev/null || true
    
    echo "Clearing: ${CHROMIUM_CACHE_DIR}/Default/Code Cache"
    rm -rf "${CHROMIUM_CACHE_DIR}/Default/Code Cache" 2>/dev/null || true
    
    echo "Clearing: ${CHROMIUM_CACHE_DIR}/ShaderCache"
    rm -rf "${CHROMIUM_CACHE_DIR}/ShaderCache" 2>/dev/null || true
    
    echo "Clearing: ${CHROMIUM_CACHE_DIR}/Default/GPUCache"
    rm -rf "${CHROMIUM_CACHE_DIR}/Default/GPUCache" 2>/dev/null || true
    
    echo "✅ Cache cleared"
else
    echo "⚠️  Chromium cache directory not found: ${CHROMIUM_CACHE_DIR}"
fi

# Clear service worker cache
echo "[3/3] Clearing service workers..."
if [[ -d "${CHROMIUM_CACHE_DIR}/Default/Service Worker" ]]; then
    rm -rf "${CHROMIUM_CACHE_DIR}/Default/Service Worker" 2>/dev/null || true
    echo "✅ Service workers cleared"
fi

echo ""
echo "========================================"
echo "         CACHE CLEARED!"
echo "========================================"
echo ""
echo "Next time you launch the kiosk, it will load fresh files."
echo ""
echo "To launch now:"
echo "  /home/pi/stem-kiosk/setup/restart_kiosk.sh"
echo ""

