#!/bin/bash
# Clean up all STEM Kiosk processes to prevent conflicts
echo "🧹 Cleaning up STEM Kiosk processes..."

# Stop the systemd service
echo "Stopping systemd service..."
sudo systemctl stop stem-kiosk 2>/dev/null || true

# Kill all Chromium processes
echo "Killing Chromium processes..."
pkill -f chromium 2>/dev/null || true
pkill -f chromium-browser 2>/dev/null || true

# Kill Python server processes
echo "Killing Python server processes..."
pkill -f "python.*server.py" 2>/dev/null || true
pkill -f "python3.*server.py" 2>/dev/null || true

# Kill any processes using port 8000
echo "Freeing port 8000..."
sudo lsof -ti:8000 | xargs sudo kill -9 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 3

echo "✅ Cleanup complete!"
echo "You can now safely restart the kiosk."
