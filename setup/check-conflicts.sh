#!/bin/bash
# Check and kill conflicting processes on Pi
echo "🔍 Checking for conflicting processes..."

# Check for processes using port 8000
PORT_PROCESSES=$(sudo lsof -ti:8000 2>/dev/null)
if [ ! -z "$PORT_PROCESSES" ]; then
    echo "⚠️  Found processes using port 8000:"
    sudo lsof -i:8000
    echo "Killing these processes..."
    echo $PORT_PROCESSES | xargs sudo kill -9
else
    echo "✅ Port 8000 is free"
fi

# Check for Chromium processes
CHROMIUM_PROCESSES=$(pgrep -f chromium 2>/dev/null)
if [ ! -z "$CHROMIUM_PROCESSES" ]; then
    echo "⚠️  Found Chromium processes:"
    ps aux | grep chromium
    echo "Killing Chromium processes..."
    pkill -f chromium
else
    echo "✅ No Chromium processes running"
fi

# Check for Python server processes
PYTHON_PROCESSES=$(pgrep -f "python.*server.py" 2>/dev/null)
if [ ! -z "$PYTHON_PROCESSES" ]; then
    echo "⚠️  Found Python server processes:"
    ps aux | grep "python.*server.py"
    echo "Killing Python server processes..."
    pkill -f "python.*server.py"
else
    echo "✅ No Python server processes running"
fi

echo "✅ Process cleanup complete!"
