# How to Run the STEM Kiosk

## Quick Start (Windows)

### Option 1: Using the Python Server (Recommended)

1. **Open a terminal/command prompt** in the project directory:
   ```cmd
   cd E:\stem-kiosk
   ```

2. **Start the server**:
   ```cmd
   python server.py
   ```
   
   Or if you have Python 3 specifically:
   ```cmd
   python3 server.py
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

4. **For Kiosk Mode** (fullscreen, no browser UI):
   - Chrome/Edge: Press `F11` for fullscreen
   - Or use command line:
     ```cmd
     start chrome.exe --kiosk --app=http://localhost:8000
     ```
   - Or for Edge:
     ```cmd
     start msedge.exe --kiosk --app=http://localhost:8000
     ```

### Option 2: Using Python's Built-in HTTP Server

If the custom server doesn't work, you can use Python's simple HTTP server:

```cmd
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Using Node.js (if installed)

```cmd
npx serve .
```

Then open the URL shown in the terminal (usually `http://localhost:3000`).

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, you can change it:
```cmd
set KIOSK_PORT=8080
python server.py
```
Then open `http://localhost:8080`

### Python Not Found
Make sure Python 3 is installed:
- Download from https://www.python.org/downloads/
- Or use Windows Store: `python` or `python3`

### Browser Issues
- Make sure JavaScript is enabled
- Try a different browser (Chrome, Edge, Firefox)
- Check browser console (F12) for any errors

## Features to Test

Once running, you can test:
- ✅ **Home Screen**: Rotating banner slideshow
- ✅ **Activity Grid**: Click tiles to launch games
- ✅ **Fusion 2048**: Number puzzle game
- ✅ **Mission Control Quiz**: STEM trivia
- ✅ **MS Teams Instructions**: PDF viewer
- ✅ **Screensaver**: Activates after 3 minutes of inactivity
- ✅ **Controls**: Home, Sound toggle, Restart, Exit buttons

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the server.

