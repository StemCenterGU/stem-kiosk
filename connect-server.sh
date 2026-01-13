#!/bin/bash
# Connect to STEM Kiosk server using sshpass via WSL

SERVER="172.16.74.22"
USER="stemcenter"
PASSWORD="pi@314159"

# Use WSL to run sshpass
wsl sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" "$@"
