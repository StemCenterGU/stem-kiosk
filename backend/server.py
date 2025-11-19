#!/usr/bin/env python3
"""
Lightweight kiosk web server with control endpoints.

Serves the project directory and provides a limited control API so the
front-end can request actions such as shutting down Chromium.
"""

import http.server
import json
import os
import subprocess
import threading
from pathlib import Path
from urllib.parse import parse_qs, urlparse

# Serve from frontend directory (one level up from backend)
BASE_DIR = Path(__file__).resolve().parent.parent / "frontend"


class KioskRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def log_message(self, format, *args):  # noqa: A003 - intent to override
        syslog = f"{self.log_date_time_string()} - {self.address_string()} - {format % args}"
        print(syslog)

    def do_GET(self):  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/__screensaver":
            return self.handle_screensaver_request()
        return super().do_GET()

    def do_OPTIONS(self):  # noqa: N802
        if self.path.startswith("/__control"):
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            return
        return super().do_OPTIONS()

    def do_POST(self):  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/__control":
            return super().do_POST()

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b""
        payload = {}
        if body:
            try:
                payload = json.loads(body.decode("utf-8"))
            except json.JSONDecodeError:
                payload = parse_qs(body.decode("utf-8"))

        params = parse_qs(parsed.query)
        action = (
            payload.get("action")
            or params.get("action")
            or payload.get("task")
            or params.get("task")
        )
        if isinstance(action, list):
            action = action[0]

        if action not in {"exit"}:
            self.send_json({"status": "error", "message": "Unsupported control action"}, status=400)
            return

        if action == "exit":
            self.send_json({"status": "ok"})
            threading.Thread(target=terminate_chromium, daemon=True).start()
            return

    def send_json(self, payload, status=200):
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def handle_screensaver_request(self):
        images_dir = BASE_DIR / "images"
        if not images_dir.exists():
            return self.send_json({"images": []})
        extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
        files = [
            f"images/{name}"
            for name in sorted(os.listdir(images_dir))
            if Path(name).suffix.lower() in extensions
        ]
        return self.send_json({"images": files})


def terminate_chromium():
    candidates = [
        "chromium-browser",
        "chromium",
        "chromium-browser-stable",
    ]
    for name in candidates:
        subprocess.run(["pkill", "-f", name], check=False)


def start_server_on_port(port):
    """Start a server instance on a specific port."""
    from socketserver import ThreadingTCPServer
    
    address = ("0.0.0.0", port)
    try:
        httpd = ThreadingTCPServer(address, KioskRequestHandler)
        httpd.allow_reuse_address = True  # Allow port reuse
        print(f"✓ Server started on port {port} - http://localhost:{port}")
        httpd.serve_forever()
    except OSError as e:
        error_msg = str(e).lower()
        is_port_in_use = (
            (hasattr(e, 'winerror') and e.winerror == 10048) or
            "address already in use" in error_msg or
            "only one usage" in error_msg or
            "10048" in error_msg
        )
        if is_port_in_use:
            print(f"✗ Port {port} is already in use, skipping...")
        else:
            print(f"✗ Error starting server on port {port}: {e}")
    except KeyboardInterrupt:
        print(f"Shutting down server on port {port}...")


def main():
    # Support multiple ports via environment variable (comma-separated)
    ports_env = os.environ.get("KIOSK_PORTS", os.environ.get("KIOSK_PORT", "8000"))
    
    # Parse ports (support comma-separated list or single port)
    if "," in ports_env:
        ports = [int(p.strip()) for p in ports_env.split(",") if p.strip()]
    else:
        ports = [int(ports_env)]
    
    if len(ports) == 1:
        # Single port - use original simple approach
        port = ports[0]
        address = ("0.0.0.0", port)
        from socketserver import ThreadingTCPServer
        with ThreadingTCPServer(address, KioskRequestHandler) as httpd:
            httpd.allow_reuse_address = True
            print(f"Serving kiosk content from {BASE_DIR}")
            print(f"✓ Server started on port {port} - http://localhost:{port}")
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("Shutting down kiosk server.")
    else:
        # Multiple ports - start each in a separate thread
        print(f"Serving kiosk content from {BASE_DIR}")
        print(f"Starting servers on {len(ports)} port(s): {', '.join(map(str, ports))}")
        
        threads = []
        for port in ports:
            thread = threading.Thread(
                target=start_server_on_port,
                args=(port,),
                daemon=True,
                name=f"Server-Port-{port}"
            )
            thread.start()
            threads.append(thread)
        
        # Keep main thread alive
        try:
            while True:
                # Check if all threads are still alive
                alive = [t for t in threads if t.is_alive()]
                if not alive:
                    print("All server threads have stopped.")
                    break
                threading.Event().wait(1)
        except KeyboardInterrupt:
            print("\nShutting down all kiosk servers...")
            # Threads are daemon, so they'll exit when main exits


if __name__ == "__main__":
    main()
