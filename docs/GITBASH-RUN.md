# Running STEM Kiosk in Git Bash

## Quick Start for Git Bash

### Method 1: Direct Python Command (Easiest)

In Git Bash, navigate to the project and run:

```bash
cd /e/stem-kiosk
python server.py
```

**Note**: In Git Bash, Windows paths use forward slashes. `E:\stem-kiosk` becomes `/e/stem-kiosk`

### Method 2: Using the Script

1. Make the script executable (first time only):
   ```bash
   chmod +x start-server-gitbash.sh
   ```

2. Run the script:
   ```bash
   ./start-server-gitbash.sh
   ```

### Method 3: If Python Command Doesn't Work

If `python` doesn't work, try:
```bash
python3 server.py
```

Or use the full path:
```bash
/c/Users/YourUsername/AppData/Local/Programs/Python/Python313/python.exe server.py
```

## Common Issues in Git Bash

### Issue: "python: command not found"

**Solution 1**: Add Python to PATH in Git Bash
```bash
export PATH="/c/Users/YourUsername/AppData/Local/Programs/Python/Python313:$PATH"
```

**Solution 2**: Use Windows Python directly
```bash
/c/Python313/python.exe server.py
```

**Solution 3**: Find your Python installation
```bash
# In Git Bash, try:
where python
# or
which python
```

### Issue: "Permission denied" on script

Make it executable:
```bash
chmod +x start-server-gitbash.sh
```

### Issue: Port already in use

Change the port:
```bash
export KIOSK_PORT=8080
python server.py
```

## Opening in Browser

Once the server starts, you'll see:
```
Serving kiosk content from E:\stem-kiosk on port 8000
```

Then open in your browser:
- **Windows path**: `http://localhost:8000`
- Or click: http://localhost:8000

## For Kiosk Mode (Fullscreen)

After opening in browser, press `F11` for fullscreen.

Or open directly in kiosk mode:
```bash
# For Chrome
"/c/Program Files/Google/Chrome/Application/chrome.exe" --kiosk --app=http://localhost:8000

# For Edge
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --kiosk --app=http://localhost:8000
```

## Stopping the Server

Press `Ctrl+C` in the Git Bash terminal.

## Alternative: Use Windows Command Prompt

If Git Bash continues to have issues, you can always use Windows Command Prompt or PowerShell:
```cmd
cd E:\stem-kiosk
python server.py
```

