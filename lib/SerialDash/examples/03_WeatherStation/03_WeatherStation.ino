/*
  03_WeatherStation

  Purpose: a small but complete dashboard using every P0 display widget
  (SPEC.md §4.1) with simulated sensor values — this is the sketch M3's
  acceptance criterion asks to be verified on real Uno and ESP32 hardware.

  Hardware: none required — all values are simulated with sin()/millis().

  Expected in the dashboard: a temperature/humidity line chart, a humidity
  gauge, a numeric value card for pressure, a "Pump" status LED that
  alternates, and an event log that gets a warning every ~7s.
*/

#include <SerialDash.h>

SerialDash dash(Serial);

void onDeclare() {
  dash.line("temp", F("Temperature")).ch("tin", "tout").labels(F("Indoor"), F("Outdoor"))
      .unit(F("C")).range(-10, 45).window(30);
  dash.gauge("hum", F("Humidity")).ch("h").range(0, 100).zone(0, 30, "#e67e22")
      .zone(30, 70, "#2ecc71").zone(70, 100, "#3498db");
  dash.value("pres", F("Pressure")).ch("p").unit(F("hPa")).decimals(0);
  dash.led("pump", F("Pump")).ch("pumpOn").on("#2ecc71").off("#888888");
}

void setup() {
  Serial.begin(115200);
  dash.begin(F("Weather Station"), F("1.0.0"));
  dash.onDeclare(onDeclare);
}

void loop() {
  dash.loop();

  double t = millis() / 1000.0;
  dash.data()
      .add("tin", 22.0 + sin(t / 5.0) * 2.0, 1)
      .add("tout", 17.0 + sin(t / 7.0) * 5.0, 1)
      .add("h", 50.0 + sin(t / 11.0) * 20.0, 0)
      .add("p", 1013.0 + sin(t / 30.0) * 8.0)
      .add("pumpOn", sin(t / 13.0) > 0);

  static unsigned long lastWarn = 0;
  if (millis() - lastWarn >= 7000) {
    lastWarn = millis();
    dash.warn(F("Humidity above threshold"), "h");
  }

  delay(200);
}
