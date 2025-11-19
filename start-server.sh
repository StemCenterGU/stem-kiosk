#!/usr/bin/env bash
# Launch the kiosk Python server (serves static files and control API)
# This script is at the root for convenience

# Get project directory
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Find Python (try python3 first, then python)
PYTHON_BIN="$(command -v python3 || command -v python)"
if [[ -z "${PYTHON_BIN}" ]]; then
    echo "Error: Python not found. Please install Python 3."
    exit 1
fi

# Change to project directory and run server
cd "${PROJECT_DIR}"
exec "${PYTHON_BIN}" "${PROJECT_DIR}/backend/server.py"

