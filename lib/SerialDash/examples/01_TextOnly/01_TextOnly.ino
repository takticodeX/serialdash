/*
  01_TextOnly

  Purpose: shows that SerialDash's console works with an ordinary sketch that
  never uses the library at all — any line NOT starting with "@{" is shown as
  plain text (SPEC.md PRT-03), exactly like the Arduino IDE's Serial Monitor.
  This is the sketch to load first, before installing anything new, just to
  confirm the app replaces your existing serial monitor workflow.

  Hardware: none required.

  Expected in the dashboard: connect, open the console (no dashboard widgets
  appear — nothing here ever sends a widget declaration) and watch "tick N"
  printed once a second.
*/

unsigned long lastTick = 0;
unsigned int count = 0;

void setup() { Serial.begin(115200); }

void loop() {
  if (millis() - lastTick >= 1000) {
    lastTick = millis();
    Serial.print(F("tick "));
    Serial.println(count++);
  }
}
