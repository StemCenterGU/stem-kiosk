#!/bin/bash
# Auto-Update STEM Kiosk Script (for Pi)
# Run this script on Pi to quickly restart with latest files

echo "========================================"
echo "    STEM Kiosk Quick Restart Script"
echo "========================================"
echo

# Clean up all processes first
echo "[0/5] Cleaning up existing processes..."
sudo systemctl stop stem-kiosk 2>/dev/null || true
pkill -f chromium 2>/dev/null || true
pkill -f "python.*server.py" 2>/dev/null || true
sudo lsof -ti:8000 | xargs sudo kill -9 2>/dev/null || true
sleep 2

# Stop the service
echo "[1/5] Stopping kiosk service..."
sudo systemctl stop stem-kiosk

# Remove old files
echo "[2/5] Removing old files..."
sudo rm -rf /home/stemcenter/stemkiosk

# Create directory
echo "[3/5] Creating directory..."
mkdir -p /home/stemcenter/stemkiosk

# Wait for files to be transferred (you'll copy files manually)
echo "[4/5] Waiting for files..."
echo "Please copy your updated files to /home/stemcenter/stemkiosk/"
echo "Then press Enter to continue..."
read

# Set permissions and run setup
echo "[5/5] Setting up kiosk..."
cd /home/stemcenter/stemkiosk
chmod +x *.sh
sudo ./setup_pi_kiosk.sh

# Start kiosk
echo "Starting kiosk..."
sudo systemctl start stem-kiosk

echo
echo "========================================"
echo "           UPDATE COMPLETE!"
echo "========================================"
echo
echo "Your STEM Kiosk is now running at:"
echo "http://localhost:8000"
echo
echo "To access from other devices:"
echo "http://<PI_IP>:8000"
echo
