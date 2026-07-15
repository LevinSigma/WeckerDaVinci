import RPi.GPIO as GPIO
import time

BEACON = 22

GPIO.setmode(GPIO.BCM)
GPIO.setup(BEACON, GPIO.OUT)

print("Beacon AN...")
GPIO.output(BEACON, GPIO.HIGH)   # falls falsch herum: LOW nehmen
time.sleep(5)

print("Beacon AUS...")
GPIO.output(BEACON, GPIO.LOW)

GPIO.cleanup()
print("Fertig!")