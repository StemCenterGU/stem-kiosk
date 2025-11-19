#!/usr/bin/env bash
# Launch the kiosk Python server for Git Bash on Windows
cd "$(dirname "$0")"

# Try python3 first, fall back to python
if command -v python3 &> /dev/null; then
    exec python3 server.py
elif command -v python &> /dev/null; then
    exec python server.py
else
    echo "Error: Python not found. Please install Python 3."
    exit 1
fi

