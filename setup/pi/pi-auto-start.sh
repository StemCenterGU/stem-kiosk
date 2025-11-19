#!/bin/bash
# Auto-start STEM Kiosk when Pi connects to PC
# This script monitors for USB connection and starts kiosk automatically

echo "========================================"
echo "    STEM Kiosk Auto-Start Monitor"
echo "========================================"
echo

# Function to start kiosk
start_kiosk() {
    echo "Starting STEM Kiosk..."
    cd /home/stemcenter/stemkiosk
    
    # Stop any existing service
    sudo systemctl stop stem-kiosk 2>/dev/null
    
    # Start the kiosk service
    sudo systemctl start stem-kiosk
    
    # Check if it's running
    if sudo systemctl is-active --quiet stem-kiosk; then
        echo "✅ Kiosk started successfully!"
        echo "Access at: http://localhost:8000"
        echo "Or from PC: http://<PI_IP>:8000"
    else
        echo "❌ Failed to start kiosk"
        echo "Run: sudo systemctl status stem-kiosk"
    fi
}

# Function to stop kiosk
stop_kiosk() {
    echo "Stopping STEM Kiosk..."
    sudo systemctl stop stem-kiosk
    echo "✅ Kiosk stopped"
}

# Function to check USB connection
check_usb_connection() {
    # Check if USB storage is mounted
    if mount | grep -q "/media/.*usb"; then
        return 0  # USB connected
    else
        return 1  # USB not connected
    fi
}

# Function to monitor USB connection
monitor_usb() {
    echo "Monitoring USB connection..."
    echo "Connect USB drive to start kiosk"
    echo "Press Ctrl+C to exit"
    echo
    
    local usb_connected=false
    
    while true; do
        if check_usb_connection; then
            if [ "$usb_connected" = false ]; then
                echo "🔌 USB detected! Starting kiosk..."
                start_kiosk
                usb_connected=true
            fi
        else
            if [ "$usb_connected" = true ]; then
                echo "🔌 USB disconnected! Stopping kiosk..."
                stop_kiosk
                usb_connected=false
            fi
        fi
        sleep 2
    done
}

# Main menu
echo "Choose an option:"
echo "1. Start kiosk now"
echo "2. Monitor USB connection (auto-start)"
echo "3. Stop kiosk"
echo "4. Check kiosk status"
echo "5. Exit"
echo

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        start_kiosk
        ;;
    2)
        monitor_usb
        ;;
    3)
        stop_kiosk
        ;;
    4)
        echo "Kiosk status:"
        sudo systemctl status stem-kiosk --no-pager
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice!"
        exit 1
        ;;
esac
