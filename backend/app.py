from flask import Flask, render_template, jsonify
from flask_cors import CORS
import RPi.GPIO as GPIO

app = Flask(__name__)
CORS(app)

# GPIO Setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)
GPIO.setup(27, GPIO.OUT)

# Sofort AUS setzen (LOW = AUS bei High-Trigger)
GPIO.output(17, GPIO.LOW)
GPIO.output(27, GPIO.LOW)

# Status
status = {
    "scheinwerfer1": False,
    "scheinwerfer2": False
}


def lichter_an():
    GPIO.output(17, GPIO.HIGH)
    GPIO.output(27, GPIO.HIGH)
    status["scheinwerfer1"] = True
    status["scheinwerfer2"] = True


def lichter_aus():
    GPIO.output(17, GPIO.LOW)
    GPIO.output(27, GPIO.LOW)
    status["scheinwerfer1"] = False
    status["scheinwerfer2"] = False


@app.route("/")
def index():
    return render_template("index.html", status=status)


@app.route("/status")
def get_status():
    return jsonify(status)


@app.route("/toggle/<int:kanal>")
def toggle(kanal):
    if kanal == 1:
        status["scheinwerfer1"] = not status["scheinwerfer1"]
        GPIO.output(17, GPIO.HIGH if status["scheinwerfer1"] else GPIO.LOW)
    elif kanal == 2:
        status["scheinwerfer2"] = not status["scheinwerfer2"]
        GPIO.output(27, GPIO.HIGH if status["scheinwerfer2"] else GPIO.LOW)
    return jsonify(status)


@app.route("/alle-an")
def alle_an():
    lichter_an()
    return jsonify(status)


@app.route("/alle-aus")
def alle_aus():
    lichter_aus()
    return jsonify(status)


# --- Wecker-Integration ---
# Wird vom React-Frontend aufgerufen, wenn ein Alarm klingelt, gestoppt
# oder gesnoozed wird (siehe notifyPi() in AlarmCard.jsx).

@app.route("/alarm/trigger", methods=["POST"])
def alarm_trigger():
    lichter_an()
    return jsonify(status)


@app.route("/alarm/stop", methods=["POST"])
def alarm_stop():
    lichter_aus()
    return jsonify(status)


@app.route("/alarm/snooze", methods=["POST"])
def alarm_snooze():
    # Licht bleibt an - nur "Stopp" schaltet die Lichtleisten aus.
    return jsonify(status)


if __name__ == "__main__":
    try:
        app.run(host="0.0.0.0", port=5000, debug=False)
    finally:
        GPIO.cleanup()
