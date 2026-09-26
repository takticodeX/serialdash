/*
  04_Controls

  Purpose: the bidirectional half of SerialDash (SPEC.md §3.6, §6.3, §6.5) —
  a switch bound to the built-in LED, a slider that clamps its requested
  value and reports back what was actually applied, and a button that
  demonstrates rejection while a guard condition holds (mirrors §6.5's own
  worked example: refusing a "reboot" while "the motor" is running).

  Hardware: none required — PIN_LED is LED_BUILTIN where the board defines
  one, or a sensible fallback GPIO otherwise (some ESP32 dev boards don't
  define LED_BUILTIN at all, since which pin — if any — has one varies by
  board); the "motor" is simulated by the switch's own state, not a real
  motor.

  Expected in the dashboard: toggling the switch lights/dims the board's
  built-in LED; dragging the slider past 200 snaps back to 200 (the device
  clamps and echoes the real value, not the one you dragged to); pressing
  the button while the switch is on shows a rejection with a reason; with
  the switch off, pressing it (after confirming the dialog) succeeds.
*/

#include <SerialDash.h>

// Not every board defines LED_BUILTIN (several generic ESP32 dev board
// definitions don't, since which pin — if any — has one varies by board).
#ifndef LED_BUILTIN
#define LED_BUILTIN 2
#endif
const int PIN_LED = LED_BUILTIN;

SerialDash dash(Serial);
bool motorRunning = false;

bool onFan(DashValue& v) {
  motorRunning = v.toBool();
  digitalWrite(PIN_LED, motorRunning ? HIGH : LOW);
  return true;  // ack ok:true, library sends the echo d automatically (LIB-CTL-04)
}

bool onPwm(DashValue& v) {
  int requested = v.toInt();
  int applied = constrain(requested, 0, 200);  // pretend 200 is this device's real safe limit
  v.set(applied);                              // echo carries what was really applied, not requested
  return true;
}

bool onReboot(DashValue& v) {
  if (motorRunning) return v.reject(F("Turn the fan off first"));
  dash.info(F("Rebooting (simulated)"));
  return true;
}

void onDeclare() {
  dash.toggle("fan", F("Fan")).value(motorRunning);
  dash.slider("pwm", F("Power")).range(0, 255).value(0);
  dash.button("reboot", F("Reboot")).confirm(F("Are you sure?"));
}

void setup() {
  pinMode(PIN_LED, OUTPUT);
  Serial.begin(115200);
  dash.begin(F("Controls"), F("1.0.0"));
  dash.onControl("fan", onFan);
  dash.onControl("pwm", onPwm);
  dash.onControl("reboot", onReboot);
  dash.onDeclare(onDeclare);
}

void loop() {
  dash.loop();  // required — reads and dispatches c/ping/hi from the app
}
