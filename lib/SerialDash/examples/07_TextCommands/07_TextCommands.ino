/*
  07_TextCommands

  Purpose: shows that plain text output and SerialDash protocol lines
  happily coexist on the same Stream (SPEC.md PRT-03) — useful if a sketch
  already prints human-readable status lines and you don't want to give
  that up when adding a dashboard.

  NOTE (M3 scope, SPEC.md §11): this example only covers the *sending* half.
  The full picture also lets the app send text commands back to the sketch
  via `onText()` — that needs the receive-side parser (§6.3), which lands in
  M4. This sketch will grow an `onText()` handler then.

  Hardware: none required.

  Expected in the dashboard: a single LED widget toggling, AND — in the
  console, with protocol lines hidden — a plain "status: ok" line once a
  second, exactly as if the library weren't there at all.
*/

#include <SerialDash.h>

SerialDash dash(Serial);

void onDeclare() { dash.led("state", F("State")).on("#2ecc71").off("#888888"); }

void setup() {
  Serial.begin(115200);
  dash.begin(F("TextCommands"), F("1.0.0"));
  dash.onDeclare(onDeclare);
}

void loop() {
  dash.loop();

  static unsigned long last = 0;
  if (millis() - last >= 1000) {
    last = millis();
    bool on = (millis() / 1000) % 2 == 0;
    dash.send("state", on);
    Serial.println(F("status: ok"));  // plain text line, ignored by the protocol parser
  }
}
