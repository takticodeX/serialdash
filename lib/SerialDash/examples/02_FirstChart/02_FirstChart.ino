/*
  02_FirstChart

  Purpose: the "hello world" of SerialDash — one line chart fed by a
  simulated sine wave. This is also the sketch the CI size report (SPEC.md
  §9.3) compiles for Uno with and without the library, to measure
  SerialDash's flash/RAM overhead against the LIB-GEN-07 budget.

  Hardware: none required.

  Expected in the dashboard: connect, click "Sine" tab if grouped, and watch
  a smooth sine wave scroll across a single line chart titled "Sine wave".
*/

#include <SerialDash.h>

SerialDash dash(Serial);

void onDeclare() {
  dash.line("sine", F("Sine wave")).ch("v").unit(F("V")).range(-1.2, 1.2).window(20);
}

void setup() {
  Serial.begin(115200);
  dash.begin(F("FirstChart"), F("1.0.0"));
  dash.onDeclare(onDeclare);
}

void loop() {
  dash.loop();
  dash.send("v", sin(millis() / 1000.0), 3);
  delay(50);
}
