#!/bin/bash
# Create systemd service for auto-starting kiosk when USB is connected

echo "Creating auto-start service..."

# Create the service file
sudo tee /etc/systemd/system/stem-kiosk-auto.service > /dev/null <<EOF
[Unit]
Description=STEM Kiosk Auto-Start Service
After=multi-user.target

[Service]
Type=simple
User=stemcenter
Group=stemcenter
WorkingDirectory=/home/stemcenter/stemkiosk
ExecStart=/home/stemcenter/stemkiosk/pi-auto-start.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable stem-kiosk-auto.service

echo "✅ Auto-start service created and enabled!"
echo "The kiosk will now start automatically when Pi boots up."
echo
echo "To start monitoring USB connections:"
echo "sudo systemctl start stem-kiosk-auto.service"
echo
echo "To check status:"
echo "sudo systemctl status stem-kiosk-auto.service"
