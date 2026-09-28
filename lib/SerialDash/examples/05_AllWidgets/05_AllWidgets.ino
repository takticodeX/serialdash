/*
  05_AllWidgets

  Purpose: every widget kind the app currently has a component for (SPEC.md §4), each bound to a
  plausible simulated channel — for exercising the whole widget catalog against real firmware
  instead of only the browser simulator, where hand-adding a widget can't create data the device
  never sends. Not a milestone acceptance test; a standing reference fixture (SPEC.md §6.6 lists
  it as `05_AllWidgets`). Not included: hist/polar/compass/attitude — the library can already
  declare them (SPEC.md §4), but the app has no widget component for them yet.

  Hardware: none required — every value is simulated with sin()/millis(), and the 7 controls just
  hold their state in RAM instead of driving real GPIO (see 04_Controls for a control wired to
  actual hardware, the board's built-in LED).

  Non-AVR only: 18 widgets plus their data don't fit an Uno/Mega's flash — pick an ESP32/ESP8266/
  RP2040/SAMD board. Compiling for AVR fails fast with a clear #error instead of a confusing
  out-of-memory link error.

  Expected in the dashboard: two tabs. "Display" has a line chart, value card, gauge, indicator,
  event log (a message every ~4s), XY plot (a slow circle), bar chart (an 8-bin spectrum), pie
  chart (a simulated power split), level bar (a tank), a status table, and a 4x4 heatmap.
  "Controls" has all 7 control kinds — the status table on the Display tab echoes the switch/
  slider/select state live, so changing a control is visible in two places at once.
*/

#ifdef __AVR__
#error \
    "05_AllWidgets needs more flash than an AVR board provides — pick an ESP32/ESP8266/RP2040/SAMD board instead (SPEC.md §6.6)."
#endif

#include <SerialDash.h>

SerialDash dash(Serial);

bool relayOn = false;
int pwmValue = 0;
float setpointValue = 21.0;
char modeValue[8] = "auto";
char labelValue[25] = "Device";
char colorValue[8] = "#ff0000";

bool onPing(DashValue& v) {
  if (!relayOn) return v.reject(F("Turn the relay on first"));
  dash.info(F("Ping!"), "ping");
  return true;
}

bool onRelay(DashValue& v) {
  relayOn = v.toBool();
  return true;
}

bool onPwm(DashValue& v) {
  pwmValue = constrain(v.toInt(), 0, 255);
  v.set(pwmValue);
  return true;
}

bool onSetpoint(DashValue& v) {
  setpointValue = constrain(v.toFloat(), -10.0f, 50.0f);
  v.set(setpointValue);
  return true;
}

bool onMode(DashValue& v) {
  if (!v.equals("auto") && !v.equals("manual") && !v.equals("eco")) {
    return v.reject(F("Unknown mode"));
  }
  // v.toString()'s pointer is only valid for this callback (DashValue.h) — copy it out.
  strncpy(modeValue, v.toString(), sizeof(modeValue) - 1);
  modeValue[sizeof(modeValue) - 1] = '\0';
  return true;
}

bool onLabel(DashValue& v) {
  strncpy(labelValue, v.toString(), sizeof(labelValue) - 1);
  labelValue[sizeof(labelValue) - 1] = '\0';
  return true;
}

bool onLedColor(DashValue& v) {
  strncpy(colorValue, v.toString(), sizeof(colorValue) - 1);
  colorValue[sizeof(colorValue) - 1] = '\0';
  return true;
}

void onDeclare() {
  // ---- Display ----
  dash.line("temp", F("Temperature"))
      .group(F("Display"))
      .ch("tin", "tout")
      .labels(F("Indoor"), F("Outdoor"))
      .unit(F("C"))
      .range(-10, 45)
      .window(30);
  dash.value("pres", F("Pressure"))
      .group(F("Display"))
      .ch("p")
      .unit(F("hPa"))
      .decimals(0)
      .trend()
      .minmax();
  dash.gauge("hum", F("Humidity"))
      .group(F("Display"))
      .ch("h")
      .range(0, 100)
      .zone(0, 30, "#e67e22")
      .zone(30, 70, "#2ecc71")
      .zone(70, 100, "#3498db");
  dash.led("pump", F("Pump")).group(F("Display")).ch("pumpOn").on("#2ecc71").off("#888888");
  dash.log("events", F("Events")).group(F("Display"));
  dash.xy("pos", F("Position"))
      .group(F("Display"))
      .ch("coords")
      .xrange(-1.2, 1.2)
      .yrange(-1.2, 1.2)
      .mode(F("lines"));
  dash.bar("spectrum", F("Spectrum")).group(F("Display")).ch("spec").range(0, 100);
  dash.pie("power", F("Power split")).group(F("Display")).ch("pwr").donut();
  dash.level("tank", F("Tank"))
      .group(F("Display"))
      .ch("lvl")
      .range(0, 100)
      .unit(F("%"))
      .zone(0, 20, "#e74c3c")
      .zone(20, 100, "#2ecc71");
  dash.table("status", F("Status")).group(F("Display")).ch("stat");
  dash.heat("thermal", F("Thermal"))
      .group(F("Display"))
      .ch("grid")
      .rows(4)
      .cols(4)
      .range(15, 35)
      .palette(F("thermal"));

  // ---- Controls ----
  dash.button("ping", F("Ping")).group(F("Controls")).confirm(F("Send ping?"));
  dash.toggle("relay", F("Relay")).group(F("Controls")).value(relayOn);
  dash.slider("pwm", F("PWM")).group(F("Controls")).range(0, 255).value(pwmValue);
  dash.number("setpoint", F("Setpoint"))
      .group(F("Controls"))
      .range(-10, 50)
      .stepSize(0.5)
      .unit(F("C"))
      .value(setpointValue);
  dash.select("mode", F("Mode"))
      .group(F("Controls"))
      .option(F("auto"))
      .option(F("manual"))
      .option(F("eco"))
      .value(modeValue);
  dash.text("label", F("Label"))
      .group(F("Controls"))
      .limit(24)
      .placeholder(F("device name"))
      .value(labelValue);
  dash.color("ledColor", F("LED color"))
      .group(F("Controls"))
      .swatches("#ff0000", "#00ff00", "#0000ff", "#ffffff")
      .value(colorValue);
}

void setup() {
  Serial.begin(115200);
  dash.begin(F("All Widgets Demo"), F("1.0.0"));
  dash.onDeclare(onDeclare);

  dash.onControl("ping", onPing);
  dash.onControl("relay", onRelay);
  dash.onControl("pwm", onPwm);
  dash.onControl("setpoint", onSetpoint);
  dash.onControl("mode", onMode);
  dash.onControl("label", onLabel);
  dash.onControl("ledColor", onLedColor);
}

void loop() {
  dash.loop();

  double t = millis() / 1000.0;

  float spectrum[8];
  for (int i = 0; i < 8; i++) spectrum[i] = 50.0f + 40.0f * sin(t / 2.0 + i);

  float thermal[16];
  for (int i = 0; i < 16; i++) thermal[i] = 25.0f + 8.0f * sin(t / 5.0 + i * 0.4);

  dash.data()
      .add("tin", 22.0 + sin(t / 5.0) * 2.0, 1)
      .add("tout", 17.0 + sin(t / 7.0) * 5.0, 1)
      .add("h", 50.0 + sin(t / 11.0) * 20.0, 0)
      .add("p", 1013.0 + sin(t / 30.0) * 8.0)
      .add("pumpOn", sin(t / 13.0) > 0)
      .addXY("coords", cos(t / 6.0), sin(t / 6.0))
      .addArray("spec", spectrum, 8)
      .map("pwr")
      .kv("Pump", 40 + (relayOn ? 20 : 0))
      .kv("Lights", 25)
      .kv("Fan", 15)
      .addArray("grid", thermal, 16)
      .add("lvl", 50.0 + sin(t / 9.0) * 40.0, 0)
      .map("stat")
      // A label->value map (pie/bar/table) only allows number|string per channelValue's schema
      // (protocol/schema/device-to-app.schema.json) — no boolean, unlike a plain top-level
      // channel like "pumpOn" above. relayOn is a real bool, so it's sent as "ON"/"OFF" here.
      .kv("Relay", relayOn ? "ON" : "OFF")
      .kv("PWM", pwmValue)
      .kv("Mode", modeValue);

  static unsigned long lastLog = 0;
  if (millis() - lastLog >= 4000) {
    lastLog = millis();
    if (setpointValue > 30)
      dash.warn(F("Setpoint high"), "sim");
    else
      dash.info(F("Tick"), "sim");
  }

  delay(200);
}
