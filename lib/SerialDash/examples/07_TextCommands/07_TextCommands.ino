/*
  07_TextCommands

  Purpose: shows that plain text output/input and SerialDash protocol lines
  happily coexist on the same Stream (SPEC.md PRT-03/PRT-05, LIB-RX-05) —
  useful if a sketch already has its own text command handling and you don't
  want to give that up when adding a dashboard.

  Hardware: none required.

  Expected in the dashboard: a single LED widget toggling, AND — in the
  console, with protocol lines hidden — a plain "status: ok" line once a
  second, exactly as if the library weren't there at all. Type "on" or "off"
  in the console's send field and press Enter: the LED follows, and the
  device echoes what it understood back as plain text too.
*/

#include <SerialDash.h>
#include <string.h>

SerialDash dash(Serial);
bool ledOn = false;

void onDeclare() { dash.led("state", F("State")).on("#2ecc71").off("#888888"); }

void onTextCommand(const char* line) {
  if (strcmp(line, "on") == 0) {
    ledOn = true;
    Serial.println(F("ok: led on"));
  } else if (strcmp(line, "off") == 0) {
    ledOn = false;
    Serial.println(F("ok: led off"));
  } else {
    Serial.print(F("unknown command: "));
    Serial.println(line);
  }
}

void setup() {
  Serial.begin(115200);
  dash.begin(F("TextCommands"), F("1.0.0"));
  dash.onDeclare(onDeclare);
  dash.onText(onTextCommand);
}

void loop() {
  dash.loop();

  static unsigned long last = 0;
  if (millis() - last >= 1000) {
    last = millis();
    dash.send("state", ledOn);
    Serial.println(F("status: ok"));  // plain text line, ignored by the protocol parser
  }
}
