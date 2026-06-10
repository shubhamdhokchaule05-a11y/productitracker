import time
import sys
import os
import ctypes
import subprocess
import requests

API_URL = "http://127.0.0.1:8000/app-usage/"
INTERVAL = 10  # seconds

def safe_print(message):
    """
    Safely prints messages to standard output, preventing crashes on Windows 
    consoles due to Unicode/character encoding mismatches (like Emojis or Non-ASCII text).
    """
    try:
        print(message)
    except UnicodeEncodeError:
        try:
            # Try to encode using stdout encoding and replace unmappable chars
            encoded = message.encode(sys.stdout.encoding or 'utf-8', errors='replace')
            print(encoded.decode(sys.stdout.encoding or 'utf-8'))
        except Exception:
            try:
                # absolute fallback: ignore non-ascii completely
                print(message.encode('ascii', errors='ignore').decode('ascii'))
            except Exception:
                pass

def get_active_window_details():
    """
    Returns (process_name, window_title) of the active foreground window.
    """
    try:
        # Standard Win32 API to get active foreground window HWND
        hwnd = ctypes.windll.user32.GetForegroundWindow()
        if not hwnd:
            return "Idle", "No Active Window"
            
        pid = ctypes.c_ulong()
        ctypes.windll.user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        
        # Get process name natively via PowerShell
        proc = subprocess.Popen(
            ["powershell", "-Command", f"(Get-Process -Id {pid.value}).ProcessName"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
        )
        stdout, _ = proc.communicate()
        proc_name = stdout.decode('utf-8', errors='ignore').strip()
        
        # Get window title text
        length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
        buf = ctypes.create_unicode_buffer(length + 1)
        ctypes.windll.user32.GetWindowTextW(hwnd, buf, length + 1)
        window_title = buf.value
        
        if not proc_name:
            proc_name = "Unknown"
        else:
            # Map standard process names to friendly display names
            name_map = {
                "chrome": "Google Chrome",
                "code": "VS Code",
                "msedge": "Microsoft Edge",
                "explorer": "Windows Explorer",
                "slack": "Slack",
                "teams": "Microsoft Teams",
                "discord": "Discord",
                "spotify": "Spotify",
                "pycharm64": "PyCharm",
                "idea64": "IntelliJ IDEA",
                "cmd": "Command Prompt",
                "powershell": "PowerShell",
                "terminal": "Windows Terminal"
            }
            proc_name = name_map.get(proc_name.lower(), proc_name)
            
        return proc_name, window_title
    except Exception as e:
        return "Unknown", f"Error: {str(e)}"

def main():
    safe_print("=" * 60)
    safe_print("           PRODUCTITRACK DESKTOP ACTIVE TRACKING AGENT")
    safe_print("=" * 60)
    
    # Get user_id from CLI args or default to 1
    user_id = 1
    if len(sys.argv) > 1:
        try:
            user_id = int(sys.argv[1])
        except ValueError:
            pass
            
    safe_print(f"[*] Starting tracking for Employee ID: {user_id}")
    safe_print(f"[*] Posting usage summaries to: {API_URL}")
    safe_print(f"[*] Active window check interval: {INTERVAL} seconds")
    safe_print("[*] Press Ctrl+C to stop tracking.")
    safe_print("-" * 60)
    
    try:
        while True:
            time.sleep(INTERVAL)
            
            app_name, window_title = get_active_window_details()
            
            # Skip sending if computer is locked or idle
            if app_name == "Idle" or not window_title:
                safe_print("[~] System appears idle. Skipping log.")
                continue
                
            payload = {
                "user_id": user_id,
                "app_name": app_name,
                "window_title": window_title[:200],  # Truncate to prevent payload size bloat
                "active_duration": INTERVAL,
                "is_productive": True  # Backend will automatically override this if unproductive app detected
            }
            
            try:
                r = requests.post(API_URL, json=payload, timeout=3)
                if r.status_code == 200:
                    data = r.json()
                    status_lbl = "[Productive]" if data.get("is_productive") else "[Distracting]"
                    duration_mins = round(data.get("active_duration", 0) / 60, 1)
                    safe_print(f"[+] Logged: {app_name} | {window_title[:40]}... ({duration_mins}m total) | {status_lbl}")
                else:
                    safe_print(f"[!] Server returned status {r.status_code}: {r.text}")
            except requests.exceptions.RequestException as e:
                safe_print(f"[!] Connection failed: Server offline or unreachable. ({str(e)})")
                
    except KeyboardInterrupt:
        safe_print("\n[*] Tracking agent stopped. Goodbye!")
        sys.exit(0)

if __name__ == "__main__":
    if sys.platform != "win32":
        safe_print("[!] Warning: This agent is optimized for Windows active window detection.")
    main()
