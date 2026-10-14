#!/usr/bin/env python3
"""Launch Django and Vite together, with dev/prod behavior based on DEBUG.

This script is designed for local development and a simple production-style check:
- DEBUG=True -> run Vite in dev mode and Django's runserver
- DEBUG=False -> run a Vite production build, then run Django's runserver

It also:
- warns if Django or Vite are already running on their standard local ports
- shuts down all managed child processes when the user exits the script
- prints streaming stdout/stderr from both servers so the user sees useful runtime info
- handles cases where either process exits early or crashes before the script ends
"""

from __future__ import annotations

"""This script was vibe coded, so if you run into any issues, let me (Logan) know and I can manually rewrite or fix it.
If this were something more likely to break and have negative implications I would have written this manually,
but this is simple enough and has an easy workaround if it breaks so I am comfortable with it.
This script was made to avoid having to run multiple terminals for Django and Vite,
but if it isn't working, you can always run them separately:

For development (DEBUG=True):
- In one terminal, run `python manage.py runserver` to start Django.
- In another terminal, run `npm run dev` to start Vite.

For production (DEBUG=False):
- In one terminal, run `npm run build` to build the frontend assets.
- In another terminal, run `python manage.py runserver` to start Django.
"""

import argparse
import os
import re
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path
from typing import Optional


REPO_ROOT = Path(__file__).resolve().parent
CONFIG_DIR = REPO_ROOT / "config"
FRONTEND_DIR = CONFIG_DIR / "frontend"
MANAGE_PY = CONFIG_DIR / "manage.py"
SETTINGS_PATH = CONFIG_DIR / "config" / "settings.py"

DJANGO_PORT = 8000
VITE_PORT = 5173


def print_banner(title: str) -> None:
    print()
    print("=" * 80)
    print(title)
    print("=" * 80)


def is_port_in_use(port: int) -> bool:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            return sock.connect_ex(("127.0.0.1", port)) == 0
    except OSError:
        return False


def find_python_executable() -> str:
    return sys.executable or shutil.which("python") or shutil.which("python3") or "python"


def find_npm_executable() -> str:
    if os.name == "nt":
        candidates = ["npm.cmd", "npm.exe", "npm"]
    else:
        candidates = ["npm"]

    for candidate in candidates:
        resolved = shutil.which(candidate)
        if resolved:
            return resolved
    raise FileNotFoundError("npm was not found in PATH. Install Node.js/npm and try again.")


def read_debug_flag(explicit_value: Optional[bool] = None) -> bool:
    if explicit_value is not None:
        return explicit_value

    try:
        text = SETTINGS_PATH.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise FileNotFoundError(f"Could not find Django settings file: {SETTINGS_PATH}")

    match = re.search(r"^\s*DEBUG\s*=\s*(True|False)\s*$", text, re.MULTILINE)
    if not match:
        raise ValueError(f"Could not determine DEBUG value from {SETTINGS_PATH}.")

    return match.group(1) == "True"


def start_stream_reader(stream, label: str) -> threading.Thread:
    def _reader() -> None:
        try:
            for raw_line in iter(stream.readline, ""):
                line = raw_line.rstrip()
                if line:
                    print(f"[{label}] {line}")
        except Exception as exc:
            print(f"[{label}] stream error: {exc}")
        finally:
            try:
                stream.close()
            except Exception:
                pass

    thread = threading.Thread(target=_reader, daemon=True)
    thread.start()
    return thread


def terminate_process(proc: subprocess.Popen, label: str) -> None:
    if proc is None or proc.poll() is not None:
        return

    print(f"Stopping {label}...")
    try:
        proc.terminate()
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        print(f"{label} did not exit cleanly; forcing shutdown.")
        proc.kill()
        proc.wait(timeout=5)


def ensure_not_running() -> None:
    django_running = is_port_in_use(DJANGO_PORT)
    vite_running = is_port_in_use(VITE_PORT)

    if django_running:
        print(f"WARNING: Django appears to already be running on http://127.0.0.1:{DJANGO_PORT}")
    if vite_running:
        print(f"WARNING: Vite appears to already be running on http://127.0.0.1:{VITE_PORT}")

    if django_running or vite_running:
        print("The script will skip starting any already-running local services.")


def start_django() -> Optional[subprocess.Popen]:
    if is_port_in_use(DJANGO_PORT):
        print(f"Django already running on port {DJANGO_PORT}; skipping Django launch.")
        return None

    python_exe = find_python_executable()
    cmd = [python_exe, str(MANAGE_PY), "runserver", f"0.0.0.0:{DJANGO_PORT}"]
    print(f"Starting Django: {' '.join(cmd)}")
    proc = subprocess.Popen(
        cmd,
        cwd=str(CONFIG_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    start_stream_reader(proc.stdout, "Django")
    print(f"Django will be available at http://127.0.0.1:{DJANGO_PORT}")
    return proc


def run_vite_build() -> Optional[subprocess.Popen]:
    npm_exe = find_npm_executable()
    cmd = [npm_exe, "run", "build"]
    print(f"Running Vite production build: {' '.join(cmd)}")
    proc = subprocess.Popen(
        cmd,
        cwd=str(FRONTEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    start_stream_reader(proc.stdout, "Vite build")
    return proc


def start_vite_dev() -> Optional[subprocess.Popen]:
    if is_port_in_use(VITE_PORT):
        print(f"Vite already running on port {VITE_PORT}; skipping Vite dev server launch.")
        return None

    npm_exe = find_npm_executable()
    cmd = [npm_exe, "run", "dev", "--", "--host", "0.0.0.0", "--port", str(VITE_PORT)]
    print(f"Starting Vite dev server: {' '.join(cmd)}")
    proc = subprocess.Popen(
        cmd,
        cwd=str(FRONTEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    start_stream_reader(proc.stdout, "Vite")
    print(f"Vite dev server should be available at http://127.0.0.1:{VITE_PORT}")
    return proc


def wait_for_processes(django_proc: Optional[subprocess.Popen], vite_proc: Optional[subprocess.Popen]) -> int:
    """Block until user interruption or a managed process exits unexpectedly."""
    try:
        while True:
            if django_proc and django_proc.poll() is not None:
                print(f"Django exited unexpectedly with code {django_proc.returncode}.")
                if vite_proc and vite_proc.poll() is None:
                    print("Stopping the remaining Vite process because Django is no longer running.")
                    terminate_process(vite_proc, "Vite")
                return 1

            if vite_proc and vite_proc.poll() is not None:
                print(f"Vite exited unexpectedly with code {vite_proc.returncode}.")
                if django_proc and django_proc.poll() is None:
                    print("Stopping the remaining Django process because Vite is no longer running.")
                    terminate_process(django_proc, "Django")
                return 1

            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nStopping managed servers due to Ctrl+C / user exit...")
        if django_proc:
            terminate_process(django_proc, "Django")
        if vite_proc:
            terminate_process(vite_proc, "Vite")
        return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Launch Django and Vite for BlockBot.")
    parser.add_argument("--debug", dest="debug", action="store_true", help="Force debug mode on.")
    parser.add_argument("--no-debug", dest="debug", action="store_false", help="Force debug mode off.")
    parser.set_defaults(debug=None)
    args, _ = parser.parse_known_args()

    try:
        using_debug = read_debug_flag(args.debug)
    except Exception as exc:
        print(f"ERROR: {exc}")
        return 1

    print_banner(f"BlockBot server launcher (DEBUG={using_debug})")
    ensure_not_running()

    django_proc: Optional[subprocess.Popen] = None
    vite_proc: Optional[subprocess.Popen] = None

    try:
        if using_debug:
            print("Running in DEBUG mode: Vite dev server + Django runserver")
            django_proc = start_django()
            vite_proc = start_vite_dev()
        else:
            print("Running in non-debug mode: Vite production build + Django runserver")
            vite_build_proc = run_vite_build()
            if vite_build_proc is not None:
                build_rc = vite_build_proc.wait()
                if build_rc != 0:
                    print(f"Vite build failed with exit code {build_rc}.")
                    return build_rc
                print("Vite build completed successfully.")
            django_proc = start_django()

        if django_proc is None and vite_proc is None:
            print("Neither Django nor Vite was started because both were already running.")
            return 0

        return wait_for_processes(django_proc, vite_proc)

    except FileNotFoundError as exc:
        print(f"ERROR: {exc}")
        return 1
    except KeyboardInterrupt:
        print("\nInterrupted by user. Shutting down all managed processes.")
        if django_proc:
            terminate_process(django_proc, "Django")
        if vite_proc:
            terminate_process(vite_proc, "Vite")
        return 0
    except Exception as exc:
        print(f"ERROR: unexpected failure: {exc}")
        if django_proc:
            terminate_process(django_proc, "Django")
        if vite_proc:
            terminate_process(vite_proc, "Vite")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
