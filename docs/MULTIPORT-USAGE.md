# Multi-Port Server Usage

The kiosk server now supports running on multiple ports simultaneously!

## Quick Start

### Single Port (Default)
```cmd
python server.py
```
Runs on port 8000: `http://localhost:8000`

### Multiple Ports

**Option 1: Environment Variable (Recommended)**
```cmd
set KIOSK_PORTS=8000,8080,8888
python server.py
```

**Option 2: Using KIOSK_PORT (single port, backwards compatible)**
```cmd
set KIOSK_PORT=8080
python server.py
```

## Examples

### Run on 3 ports simultaneously:
```cmd
set KIOSK_PORTS=8000,8080,9000
python server.py
```

Then access via:
- http://localhost:8000
- http://localhost:8080
- http://localhost:9000

### Run on specific ports:
```cmd
set KIOSK_PORTS=3000,5000,8000
python server.py
```

## Use Cases

1. **Multiple Devices**: Different devices can connect to different ports
2. **Network Flexibility**: If one port is blocked, others are available
3. **Testing**: Test different configurations simultaneously
4. **Load Distribution**: Spread connections across ports

## Features

- ✅ All ports serve the same content
- ✅ All ports support the same API endpoints
- ✅ Thread-safe - handles multiple connections per port
- ✅ Automatic port reuse handling
- ✅ Graceful error handling for occupied ports

## Stopping

Press `Ctrl+C` to stop all servers on all ports.

## Troubleshooting

### Port Already in Use
If a port is already in use, the server will:
- Skip that port
- Continue starting on other ports
- Show a message: `✗ Port XXXX is already in use, skipping...`

### Check What's Using a Port
```powershell
Get-NetTCPConnection -LocalPort 8000
```

### Kill Process on Port
```powershell
Get-NetTCPConnection -LocalPort 8000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

