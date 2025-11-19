#!/usr/bin/env bash
# Launch the kiosk Python server (serves static files and control API)
# This script is in setup/ folder, go up one level to project root
cd "$(dirname "$0")/.."
exec /usr/bin/env python3 backend/server.py
