#!/usr/bin/env python3
import json
import os
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8001"))
ALARM_GPIO_PIN = int(os.getenv("ALARM_GPIO_PIN", "18"))

GPIO = None
GPIO_AVAILABLE = False


def init_gpio():
    global GPIO, GPIO_AVAILABLE
    if GPIO_AVAILABLE:
        return
    try:
        import RPi.GPIO as rpi_gpio
    except Exception as exc:  # pragma: no cover - hardware-specific
        print(f"RPi.GPIO not available: {exc}")
        print("Running in simulation mode. The service will still answer HTTP requests.")
        return

    GPIO = rpi_gpio
    GPIO_AVAILABLE = True
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(ALARM_GPIO_PIN, GPIO.OUT, initial=GPIO.LOW)
    print(f"GPIO initialized on pin {ALARM_GPIO_PIN}")


def set_alarm_state(turn_on: bool) -> None:
    init_gpio()
    if not GPIO_AVAILABLE:
        print("Simulating relay/LED switch", turn_on)
        return

    GPIO.output(ALARM_GPIO_PIN, GPIO.HIGH if turn_on else GPIO.LOW)
    print(f"GPIO pin {ALARM_GPIO_PIN} -> {'ON' if turn_on else 'OFF'}")


class AlarmRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/", "/health"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            payload = self.rfile.read(content_length).decode("utf-8") if content_length else "{}"
            body = json.loads(payload) if payload else {}
        except json.JSONDecodeError:
            body = {}

        if parsed.path == "/alarm/trigger":
            set_alarm_state(True)
            response = {"ok": True, "action": "trigger", "payload": body}
        elif parsed.path == "/alarm/stop":
            set_alarm_state(False)
            response = {"ok": True, "action": "stop", "payload": body}
        elif parsed.path == "/alarm/snooze":
            set_alarm_state(False)
            response = {"ok": True, "action": "snooze", "payload": body}
        else:
            self.send_response(404)
            self.end_headers()
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response).encode("utf-8"))

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")


def main() -> None:
    init_gpio()
    server = ThreadingHTTPServer((HOST, PORT), AlarmRequestHandler)
    print(f"Alarm service listening on http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down alarm service")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
