#!/usr/bin/env python3
"""
OS Guardian - Main Entry Point
Starts FastAPI server and opens desktop window with pywebview
"""
import threading
import time
import uvicorn
from app.main import app


def start_server():
    """Start FastAPI server in background thread"""
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")


def start_desktop():
    """Open dashboard in desktop window"""
    try:
        import webview
        # Wait for server to start
        time.sleep(2)
        window = webview.create_window(
            '🛡 OS Guardian',
            'http://127.0.0.1:8000',
            width=1400,
            height=900,
            resizable=True,
            text_select=True
        )
        webview.start()
    except ImportError:
        print("pywebview not installed. Opening in browser instead...")
        import webbrowser
        time.sleep(2)
        webbrowser.open('http://127.0.0.1:8000')
        # Keep running
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    print("=" * 50)
    print("  🛡  OS GUARDIAN")
    print("  Real-time Process Monitoring &")
    print("  Deadlock Detection System")
    print("=" * 50)
    print()
    print("  Starting server on http://127.0.0.1:8000")
    print()

    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Start desktop window
    start_desktop()
