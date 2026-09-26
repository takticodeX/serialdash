// Native unit tests for the SerialDash library (SPEC.md §9.2 QA-10): the transmit path built in
// M3, plus M4's receive path (LIB-RX-01..07) and controls API (§6.5) — see the "RX / controls
// (M4)" section below, which reconstructs the a2d-direction vectors from
// /protocol/test-vectors/app-to-device.jsonl, closing the half of PRO-04 M3 deferred.
//
// Most cases below reconstruct a specific named vector from
// /protocol/test-vectors/{widgets,device-to-app}.jsonl by calling the
// equivalent SerialDash builder chain and asserting the captured output is
// byte-for-byte identical to that vector's `line` — real regression coverage
// tied to the same fixtures the app's Parser.test.ts replays (PRO-04), even
// though, unlike that TypeScript suite, this file doesn't parse the .jsonl
// at run time: reconstructing an arbitrary vector's fields into the right
// builder calls generically would be substantially more code than the
// encoder it would be testing, so each case is instead hand-matched to one
// vector and names it in a comment.
//
// A few vectors can't be hit at all in M3 (`ack`/`pong` need the app's `c`
// request id or `ping`, both received via the RX parser that lands in M4)
// or can't be byte-matched exactly because this library makes different
// (still protocol-valid) choices than that particular example — e.g. `rx`
// is always sent rather than only when non-default, `ts` is written
// immediately rather than held until after `d` (SPEC.md's own §6.4 example
// calls `.ts()` *first* in the chain), and extremely-large-magnitude floats
// (1.79e308) are simply out of range for this library's fixed-point
// formatter, which targets realistic sensor readings, not the full IEEE754
// range. Those are covered with a substring check instead, or not at all
// (noted per case).

#include <unity.h>

#include <cmath>
#include <cstring>

#include "SerialDash.h"

using serialdash::internal::writeEscapedString;

void setUp() {}
void tearDown() {}

// ---- widgets.jsonl -------------------------------------------------------

void test_widget_line() {
  FakeStream s;
  SerialDash dash(s);
  dash.line("temp").ch("tin", "tout").range(-10, 45).window(30);
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"temp\",\"k\":\"line\",\"ch\":[\"tin\",\"tout\"],\"min\":-10,"
      "\"max\":45,\"win\":30}\n",
      s.captured.c_str());
}

void test_widget_value() {
  FakeStream s;
  SerialDash dash(s);
  dash.value("hum").ch("h").unit("%").trend();
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"hum\",\"k\":\"value\",\"ch\":\"h\",\"unit\":\"%\",\"trend\":true}\n",
      s.captured.c_str());
}

void test_widget_gauge() {
  FakeStream s;
  SerialDash dash(s);
  dash.gauge("g1")
      .ch("h")
      .range(0, 100)
      .zone(0, 30, "#e67e22")
      .zone(30, 70, "#2ecc71")
      .zone(70, 100, "#3498db");
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"g1\",\"k\":\"gauge\",\"ch\":\"h\",\"min\":0,\"max\":100,"
      "\"zones\":[[0,30,\"#e67e22\"],[30,70,\"#2ecc71\"],[70,100,\"#3498db\"]]}\n",
      s.captured.c_str());
}

void test_widget_led_colors() {
  FakeStream s;
  SerialDash dash(s);
  dash.led("led1").ch("fan").on("#2ecc71").off("#888888");
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"led1\",\"k\":\"led\",\"ch\":\"fan\",\"on\":\"#2ecc71\","
      "\"off\":\"#888888\"}\n",
      s.captured.c_str());
}

void test_widget_led_states() {
  FakeStream s;
  SerialDash dash(s);
  dash.led("stato").ch("st").state(0, "Fermo", "#888888").state(1, "In funzione", "#2ecc71");
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"stato\",\"k\":\"led\",\"ch\":\"st\","
      "\"states\":{\"0\":[\"Fermo\",\"#888888\"],\"1\":[\"In funzione\",\"#2ecc71\"]}}\n",
      s.captured.c_str());
}

void test_widget_log() {
  FakeStream s;
  SerialDash dash(s);
  dash.log("evt").minLevel("warn").limit(200);
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"evt\",\"k\":\"log\",\"lvl\":\"warn\",\"max\":200}\n",
      s.captured.c_str());
}

void test_widget_xy() {
  FakeStream s;
  SerialDash dash(s);
  dash.xy("pos").ch("pos").xrange(-10, 10).yrange(-10, 10).mode("lines");
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"pos\",\"k\":\"xy\",\"ch\":\"pos\",\"xmin\":-10,\"xmax\":10,"
      "\"ymin\":-10,\"ymax\":10,\"mode\":\"lines\"}\n",
      s.captured.c_str());
}

void test_widget_bar() {
  FakeStream s;
  SerialDash dash(s);
  dash.bar("spec").ch("spectrum").range(0, 255);
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"spec\",\"k\":\"bar\",\"ch\":\"spectrum\",\"min\":0,\"max\":255}\n",
      s.captured.c_str());
}

void test_widget_pie() {
  FakeStream s;
  SerialDash dash(s);
  dash.pie("cons").ch("cons").donut().pct();
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"cons\",\"k\":\"pie\",\"ch\":\"cons\",\"donut\":true,\"pct\":true}\n",
      s.captured.c_str());
}

void test_widget_level() {
  FakeStream s;
  SerialDash dash(s);
  dash.level("tank").ch("lvl").range(0, 100).vert();
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"tank\",\"k\":\"level\",\"ch\":\"lvl\",\"min\":0,\"max\":100,"
      "\"vert\":true}\n",
      s.captured.c_str());
}

void test_widget_table() {
  FakeStream s;
  SerialDash dash(s);
  dash.table("info").ch("kv").cols("Chiave", "Valore");
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"info\",\"k\":\"table\",\"ch\":\"kv\",\"cols\":[\"Chiave\","
      "\"Valore\"]}\n",
      s.captured.c_str());
}

void test_widget_heat() {
  FakeStream s;
  SerialDash dash(s);
  dash.heat("cam").ch("ir").rows(8).cols(8).range(20, 40).palette("thermal").interp();
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"cam\",\"k\":\"heat\",\"ch\":\"ir\",\"rows\":8,\"cols\":8,"
      "\"min\":20,\"max\":40,\"palette\":\"thermal\",\"interp\":true}\n",
      s.captured.c_str());
}

void test_widget_hist() {
  FakeStream s;
  SerialDash dash(s);
  dash.hist("h1").ch("noise").bins(20);
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"h1\",\"k\":\"hist\",\"ch\":\"noise\",\"bins\":20}\n",
      s.captured.c_str());
}

void test_widget_polar() {
  FakeStream s;
  SerialDash dash(s);
  dash.polar("sonar").ch("scan").rmax(200).angleRange(0, 180).sweep();
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"sonar\",\"k\":\"polar\",\"ch\":\"scan\",\"rmax\":200,\"amin\":0,"
      "\"amax\":180,\"sweep\":true}\n",
      s.captured.c_str());
}

void test_widget_compass() {
  FakeStream s;
  SerialDash dash(s);
  dash.compass("cmp").ch("heading").ref("N", "E", "S", "O");
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"cmp\",\"k\":\"compass\",\"ch\":\"heading\",\"ref\":[\"N\",\"E\","
      "\"S\",\"O\"]}\n",
      s.captured.c_str());
}

void test_widget_attitude() {
  FakeStream s;
  SerialDash dash(s);
  dash.attitude("horizon").ch("ahrs");
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"w\",\"id\":\"horizon\",\"k\":\"attitude\",\"ch\":\"ahrs\"}\n",
                           s.captured.c_str());
}

void test_widget_button() {
  FakeStream s;
  SerialDash dash(s);
  dash.button("reboot").label("Riavvia").confirm("Sei sicuro?");
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"reboot\",\"k\":\"button\",\"label\":\"Riavvia\","
      "\"confirm\":\"Sei sicuro?\"}\n",
      s.captured.c_str());
}

void test_widget_button_hold() {
  FakeStream s;
  SerialDash dash(s);
  dash.button("buzz").hold();
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"w\",\"id\":\"buzz\",\"k\":\"button\",\"hold\":true}\n",
                           s.captured.c_str());
}

void test_widget_switch() {
  FakeStream s;
  SerialDash dash(s);
  dash.toggle("fan", "Ventola").value(false);
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"fan\",\"k\":\"switch\",\"title\":\"Ventola\",\"val\":false}\n",
      s.captured.c_str());
}

void test_widget_slider() {
  FakeStream s;
  SerialDash dash(s);
  dash.slider("pwm", "Potenza").range(0, 255).stepSize(1).value(0);
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"pwm\",\"k\":\"slider\",\"title\":\"Potenza\",\"min\":0,\"max\":255,"
      "\"step\":1,\"val\":0}\n",
      s.captured.c_str());
}

void test_widget_number() {
  FakeStream s;
  SerialDash dash(s);
  dash.number("setpoint").range(0, 40).stepSize(0.5);
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"setpoint\",\"k\":\"number\",\"min\":0,\"max\":40,\"step\":0.5}\n",
      s.captured.c_str());
}

void test_widget_select() {
  FakeStream s;
  SerialDash dash(s);
  dash.select("mode").option("auto").option("man").value("auto");
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"mode\",\"k\":\"select\",\"opts\":[\"auto\",\"man\"],"
      "\"val\":\"auto\"}\n",
      s.captured.c_str());
}

void test_widget_select_labelled_opts() {
  FakeStream s;
  SerialDash dash(s);
  dash.select("mode2").option("auto", "Automatico").option("man", "Manuale");
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"mode2\",\"k\":\"select\",\"opts\":[[\"auto\",\"Automatico\"],"
      "[\"man\",\"Manuale\"]]}\n",
      s.captured.c_str());
}

void test_widget_text() {
  FakeStream s;
  SerialDash dash(s);
  dash.text("note").limit(32).placeholder("scrivi qui\xe2\x80\xa6");  // "…" U+2026, raw UTF-8
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"note\",\"k\":\"text\",\"max\":32,\"ph\":\"scrivi "
      "qui\xe2\x80\xa6\"}\n",
      s.captured.c_str());
}

void test_widget_color() {
  FakeStream s;
  SerialDash dash(s);
  dash.color("led-color").swatches("#ff0000", "#00ff00", "#0000ff");
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"led-color\",\"k\":\"color\",\"swatches\":[\"#ff0000\",\"#00ff00\","
      "\"#0000ff\"]}\n",
      s.captured.c_str());
}

// ---- device-to-app.jsonl --------------------------------------------------

void test_update_partial() {
  FakeStream s;
  SerialDash dash(s);
  dash.update("g1").limit(100).title("Temperature (estate)");
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"u\",\"id\":\"g1\",\"max\":100,\"title\":\"Temperature (estate)\"}\n",
      s.captured.c_str());
}

void test_remove_one() {
  FakeStream s;
  SerialDash dash(s);
  dash.remove("g1");
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"x\",\"id\":\"g1\"}\n", s.captured.c_str());
}

void test_remove_all() {
  FakeStream s;
  SerialDash dash(s);
  dash.removeAll();
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"x\"}\n", s.captured.c_str());
}

void test_data_multiple_forms() {
  FakeStream s;
  SerialDash dash(s);
  int16_t spectrum[4] = {1, 2, 3, 4};
  // "missing" uses NAN to exercise PRT-09's null-for-NaN rule, matching the
  // vector's "missing":null.
  dash.data()
      .add("t1", 23.4, 1)
      .add("fan", true)
      .add("mode", "auto")
      .add("missing", NAN)
      .addXY("pos", 1.2, 3.4, 1)
      .addArray("spectrum", spectrum, 4)
      .map("cons")
      .kv("Pompa", 120)
      .kv("Luci", 45);
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"d\",\"d\":{\"t1\":23.4,\"fan\":true,\"mode\":\"auto\",\"missing\":null,"
      "\"pos\":[1.2,3.4],\"spectrum\":[1,2,3,4],\"cons\":{\"Pompa\":120,\"Luci\":45}}}\n",
      s.captured.c_str());
}

void test_data_with_timestamp() {
  // `ts` is buffered and always written last, regardless of where `.ts()`
  // appears in the chain (see its doc comment in DataBuilder.h) — which
  // happens to also match this vector's own field order exactly, even
  // though SPEC.md's §6.4 example calls `.ts()` *first*
  // (`dash.data().ts(millis()).add(...)`).
  FakeStream s;
  SerialDash dash(s);
  dash.data().ts(123456UL).add("ax", 0.01, 2).add("ay", -0.02, 2);
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"d\",\"d\":{\"ax\":0.01,\"ay\":-0.02},\"ts\":123456}\n",
                           s.captured.c_str());
}

void test_data_ts_called_after_add_still_correct() {
  // Regression test: an earlier implementation wrote `ts` to the stream the
  // moment `.ts()` was called, which was only correct when `.ts()` came
  // first in the chain (as SPEC.md's own example always does) — calling it
  // after `.add()` silently injected a bogus `"ts"` channel *inside* the
  // still-open `d` object instead of a sibling field. Buffering `ts` (see
  // DataBuilder::ts()'s doc comment) fixed this for every call order.
  FakeStream s;
  SerialDash dash(s);
  dash.data().add("a", 1).ts(999UL);
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"d\",\"d\":{\"a\":1},\"ts\":999}\n", s.captured.c_str());
}

void test_data_nan_and_infinity_sent_as_null() {
  FakeStream s;
  SerialDash dash(s);
  dash.send("sensor", NAN);
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"d\",\"d\":{\"sensor\":null}}\n", s.captured.c_str());

  FakeStream s2;
  SerialDash dash2(s2);
  dash2.send("sensor", INFINITY);
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"d\",\"d\":{\"sensor\":null}}\n", s2.captured.c_str());
}

void test_event_warn_with_src() {
  FakeStream s;
  SerialDash dash(s);
  dash.warn("Umidit\xc3\xa0 sopra soglia", "hum");  // "Umidità", raw UTF-8
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"e\",\"lvl\":\"warn\",\"msg\":\"Umidit\xc3\xa0 sopra soglia\",\"src\":\"hum\"}\n",
      s.captured.c_str());
}

// ---- Behavior not tied to one specific named vector -----------------------

void test_hi_contains_name_and_fw() {
  // Not byte-matched against "hi-full": this library has no way to send
  // `board` (not part of §6.4's normative `begin()` signature) and always
  // sends `rx` (rather than only when it differs from the protocol
  // default), both protocol-valid choices that just don't reproduce that
  // exact example.
  FakeStream s;
  SerialDash dash(s);
  dash.begin("Serra", "1.2.0");
  std::string out = s.captured;
  TEST_ASSERT_TRUE(out.find("\"t\":\"hi\"") != std::string::npos);
  TEST_ASSERT_TRUE(out.find("\"v\":1") != std::string::npos);
  TEST_ASSERT_TRUE(out.find("\"name\":\"Serra\"") != std::string::npos);
  TEST_ASSERT_TRUE(out.find("\"fw\":\"1.2.0\"") != std::string::npos);
  TEST_ASSERT_TRUE(out.find("\"rx\":256") != std::string::npos);  // native = non-AVR default
}

void test_ondeclare_invoked_by_begin() {
  static bool called = false;
  called = false;
  FakeStream s;
  SerialDash dash(s);
  dash.onDeclare([]() { called = true; });
  TEST_ASSERT_TRUE(called);  // onDeclare() itself invokes it once immediately
  called = false;
  dash.begin("Demo");
  TEST_ASSERT_TRUE(called);  // begin() invokes it again after sending hi
}

void test_app_connected_false_before_hi_and_ping() {
  FakeStream s;
  SerialDash dash(s);
  TEST_ASSERT_FALSE(dash.appConnected());  // neither a hi request nor a ping has arrived yet
}

void test_float_trailing_zeros_stripped() {
  FakeStream s;
  SerialDash dash(s);
  dash.send("x", 22.0);
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"d\",\"d\":{\"x\":22}}\n", s.captured.c_str());
}

void test_float_negative_rounds_to_zero_without_minus_sign() {
  FakeStream s;
  SerialDash dash(s);
  dash.send("x", -0.0001, 3);
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"d\",\"d\":{\"x\":0}}\n", s.captured.c_str());
}

void test_generic_widget_and_prop_escape_hatch() {
  FakeStream s;
  SerialDash dash(s);
  dash.widget("custom1", "newkind").prop("n", 1).prop("f", 1.5).prop("s", "hi").prop("b", true);
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"w\",\"id\":\"custom1\",\"k\":\"newkind\",\"n\":1,\"f\":1.5,\"s\":\"hi\","
      "\"b\":true}\n",
      s.captured.c_str());
}

// ---- RX / controls (M4): app-to-device.jsonl -------------------------------
//
// Reconstructs every a2d vector from /protocol/test-vectors/app-to-device.jsonl by feeding its
// exact `line` to a FakeStream and calling `dash.loop()` — this is the actual receive path
// (LIB-RX-01..07), not a hand-built call chain, so unlike the TX section above these really do
// parse the fixture text at run time. The 4 vectors marked `valid:false` are still meaningful
// here even though they're a2d/app-side validity failures: per LIB-RX-02/03's own design ("no
// separate error signal" — see JsonParser.h), the device's minimal parser is deliberately
// best-effort rather than strict, so each of those is tested for *graceful degradation*
// (dispatches something reasonable, never crashes or wedges the line buffer) rather than for
// rejecting the line outright, which this parser was never asked to do.

bool g_lastControlOk;
long g_onControlCallCount;

bool controlAccept(DashValue&) {
  ++g_onControlCallCount;
  return true;
}

bool g_hiTestDeclared;

void markDeclared() { g_hiTestDeclared = true; }

void test_a2d_hi_request_triggers_redeclare() {
  FakeStream s;
  SerialDash dash(s);
  dash.begin("Serra");
  g_hiTestDeclared = false;
  dash.onDeclare(markDeclared);
  s.captured.clear();

  s.feedInput("@{\"t\":\"hi\",\"v\":1}\n");  // vector "hi-request"
  dash.loop();

  TEST_ASSERT_TRUE(g_hiTestDeclared);
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"hi\",\"v\":1,\"name\":\"Serra\",\"rx\":256}\n",
                           s.captured.c_str());
}

void test_a2d_ping_replies_pong() {
  FakeStream s;
  SerialDash dash(s);
  s.feedInput("@{\"t\":\"ping\",\"r\":5}\n");  // vector "ping"
  dash.loop();
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"pong\",\"r\":5}\n", s.captured.c_str());
}

void test_a2d_ping_unknown_scalar_field_ignored() {
  FakeStream s;
  SerialDash dash(s);
  // vector "unknown-scalar-field-ignored": the extra "debug" field doesn't stop ping from
  // being answered (PRT-06).
  s.feedInput("@{\"t\":\"ping\",\"r\":5,\"debug\":1}\n");
  dash.loop();
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"pong\",\"r\":5}\n", s.captured.c_str());
}

void test_a2d_c_set_control_bool() {
  FakeStream s;
  SerialDash dash(s);
  dash.onControl("fan", controlAccept);
  s.feedInput("@{\"t\":\"c\",\"r\":1,\"id\":\"fan\",\"v\":true}\n");  // vector "c-set-control"
  dash.loop();
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"ack\",\"r\":1,\"ok\":true}\n@{\"t\":\"d\",\"d\":{\"fan\":true}}\n",
      s.captured.c_str());
}

// Callbacks passed to onControl() must be plain non-capturing function pointers (LIB-CTL-01), so
// — same as a real sketch would — the handful of tests below that need to inspect what a
// callback saw communicate through file-scope globals rather than a capturing lambda or a local
// class with static members (the latter isn't even legal C++: a local class's static data
// members cannot have an out-of-class definition).
bool g_numericValueWas128;

bool checkNumericValue(DashValue& v) {
  g_numericValueWas128 = (v.toInt() == 128);
  return true;
}

void test_a2d_c_numeric_value() {
  FakeStream s;
  g_numericValueWas128 = false;
  SerialDash dash(s);
  dash.onControl("pwm", checkNumericValue);
  s.feedInput("@{\"t\":\"c\",\"r\":17,\"id\":\"pwm\",\"v\":128}\n");  // vector "c-numeric-value"
  dash.loop();
  TEST_ASSERT_TRUE(g_numericValueWas128);
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"ack\",\"r\":17,\"ok\":true}\n@{\"t\":\"d\",\"d\":{\"pwm\":128}}\n",
      s.captured.c_str());
}

bool g_stringValueWasAuto;

bool checkStringValue(DashValue& v) {
  g_stringValueWasAuto = v.equals("auto");
  return true;
}

void test_a2d_c_string_value() {
  FakeStream s;
  g_stringValueWasAuto = false;
  SerialDash dash(s);
  dash.onControl("mode", checkStringValue);
  s.feedInput(
      "@{\"t\":\"c\",\"r\":2,\"id\":\"mode\",\"v\":\"auto\"}\n");  // vector "c-string-value"
  dash.loop();
  TEST_ASSERT_TRUE(g_stringValueWasAuto);
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"ack\",\"r\":2,\"ok\":true}\n@{\"t\":\"d\",\"d\":{\"mode\":\"auto\"}}\n",
      s.captured.c_str());
}

bool g_nestedValueWasNull;

bool checkNestedValueIsNull(DashValue& v) {
  g_nestedValueWasNull = v.isNull();
  return true;
}

void test_a2d_c_nested_value_skipped_gracefully() {
  // vector "c-nested-value-not-flat" (valid:false at the app-encoding level, PRT-40): the nested
  // object is skipped per LIB-RX-02, so the control still dispatches with `v` simply absent
  // (Null) rather than the line being rejected outright.
  FakeStream s;
  g_nestedValueWasNull = false;
  SerialDash dash(s);
  dash.onControl("pos", checkNestedValueIsNull);
  s.feedInput("@{\"t\":\"c\",\"r\":3,\"id\":\"pos\",\"v\":{\"x\":1,\"y\":2}}\n");
  dash.loop();
  TEST_ASSERT_TRUE(g_nestedValueWasNull);
  TEST_ASSERT_TRUE(s.captured.find("\"r\":3") != std::string::npos);
  TEST_ASSERT_TRUE(s.captured.find("\"ok\":true") != std::string::npos);
}

void test_a2d_c_r_out_of_range_still_handled() {
  // vector "c-r-out-of-range" (r:0 violates PRT-41, which is a promise the *app*'s encoder
  // keeps — LIB-RX doesn't ask the device to validate it). The device just echoes whatever r it
  // was given; no crash, no special-casing needed.
  FakeStream s;
  SerialDash dash(s);
  dash.onControl("fan", controlAccept);
  s.feedInput("@{\"t\":\"c\",\"r\":0,\"id\":\"fan\",\"v\":true}\n");
  dash.loop();
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"ack\",\"r\":0,\"ok\":true}\n@{\"t\":\"d\",\"d\":{\"fan\":true}}\n",
      s.captured.c_str());
}

void test_a2d_invalid_id_bad_character_falls_through_to_unknown() {
  // vector "invalid-id-bad-character": a space inside a quoted JSON string is syntactically
  // valid JSON even though PRT-11 forbids it in a real id — the device parses it fine and simply
  // never matches a registered control, landing on LIB-RX-07's "unknown control" path.
  FakeStream s;
  SerialDash dash(s);
  dash.onControl("fan", controlAccept);
  s.feedInput("@{\"t\":\"c\",\"r\":4,\"id\":\"pw m\",\"v\":1}\n");
  dash.loop();
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"ack\",\"r\":4,\"ok\":false,\"err\":\"unknown control\"}\n",
                           s.captured.c_str());
}

void test_a2d_malformed_json_does_not_crash_and_buffer_recovers() {
  // vector "malformed-json-unterminated-string": genuinely broken JSON. The requirement here
  // isn't a specific response — LIB-RX-02/03 make no promise about malformed input — it's that
  // the library doesn't crash and the line buffer is usable again for the next, valid line.
  FakeStream s;
  SerialDash dash(s);
  g_onControlCallCount = 0;
  dash.onControl("fan", controlAccept);
  s.feedInput("@{\"t\":\"c\",\"r\":1,\"id\":\"fan\",\"v\":\"auto}\n");
  dash.loop();

  s.captured.clear();
  s.feedInput("@{\"t\":\"ping\",\"r\":9}\n");
  dash.loop();
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"pong\",\"r\":9}\n", s.captured.c_str());
}

// ---- onControl / onAnyControl / onText / setAutoEcho (§6.5) ---------------

bool controlReject(DashValue& v) { return v.reject(F("Ferma prima il motore")); }

void test_onControl_reject_sends_err_and_no_echo() {
  FakeStream s;
  SerialDash dash(s);
  dash.onControl("reboot", controlReject);
  s.feedInput("@{\"t\":\"c\",\"r\":1,\"id\":\"reboot\",\"v\":true}\n");
  dash.loop();
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"ack\",\"r\":1,\"ok\":false,\"err\":\"Ferma prima il motore\"}\n",
      s.captured.c_str());
}

bool controlClamp(DashValue& v) {
  int p = v.toInt();
  if (p > 200) p = 200;
  v.set(p);
  return true;
}

void test_onControl_set_changes_the_echoed_value() {
  FakeStream s;
  SerialDash dash(s);
  dash.onControl("pwm", controlClamp);
  s.feedInput("@{\"t\":\"c\",\"r\":1,\"id\":\"pwm\",\"v\":255}\n");
  dash.loop();
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"ack\",\"r\":1,\"ok\":true}\n@{\"t\":\"d\",\"d\":{\"pwm\":200}}\n",
      s.captured.c_str());
}

bool anyControlSeen(const char* id, DashValue& v) {
  g_lastControlOk = (strcmp(id, "mystery") == 0) && v.toBool();
  return true;
}

void test_onAnyControl_handles_ids_without_their_own_callback() {
  FakeStream s;
  SerialDash dash(s);
  g_lastControlOk = false;
  dash.onAnyControl(anyControlSeen);
  s.feedInput("@{\"t\":\"c\",\"r\":1,\"id\":\"mystery\",\"v\":true}\n");
  dash.loop();
  TEST_ASSERT_TRUE(g_lastControlOk);
  TEST_ASSERT_TRUE(s.captured.find("\"ok\":true") != std::string::npos);
}

void test_unknown_control_with_no_handler_at_all() {
  FakeStream s;
  SerialDash dash(s);
  s.feedInput("@{\"t\":\"c\",\"r\":7,\"id\":\"nope\",\"v\":1}\n");
  dash.loop();
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"ack\",\"r\":7,\"ok\":false,\"err\":\"unknown control\"}\n",
                           s.captured.c_str());
}

void test_onControl_matches_a_flash_id() {
  FakeStream s;
  SerialDash dash(s);
  dash.onControl(F("reboot"), controlAccept);
  g_onControlCallCount = 0;
  s.feedInput("@{\"t\":\"c\",\"r\":1,\"id\":\"reboot\",\"v\":true}\n");
  dash.loop();
  TEST_ASSERT_EQUAL(1, g_onControlCallCount);
}

std::string g_lastTextLine;

void captureText(const char* line) { g_lastTextLine = line; }

void test_onText_receives_lines_not_starting_with_at_brace() {
  FakeStream s;
  SerialDash dash(s);
  dash.onText(captureText);
  s.feedInput("hello from a plain sketch\n");
  dash.loop();
  TEST_ASSERT_EQUAL_STRING("hello from a plain sketch", g_lastTextLine.c_str());
}

void test_setAutoEcho_false_suppresses_d_but_not_ack() {
  FakeStream s;
  SerialDash dash(s);
  dash.setAutoEcho(false);
  dash.onControl("fan", controlAccept);
  s.feedInput("@{\"t\":\"c\",\"r\":1,\"id\":\"fan\",\"v\":true}\n");
  dash.loop();
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"ack\",\"r\":1,\"ok\":true}\n", s.captured.c_str());
}

// ---- rx overflow (LIB-RX-04) -----------------------------------------------

void test_rx_overflow_reports_event_and_recovers() {
  FakeStream s;
  SerialDash dash(s);
  std::string tooLong(SERIALDASH_RX_BUFFER + 50, 'x');
  tooLong += "\n";
  s.feedInput(tooLong.c_str());
  dash.loop();
  TEST_ASSERT_EQUAL_STRING(
      "@{\"t\":\"e\",\"lvl\":\"err\",\"msg\":\"rx overflow\",\"src\":\"dash\"}\n",
      s.captured.c_str());

  s.captured.clear();
  s.feedInput("@{\"t\":\"ping\",\"r\":1}\n");
  dash.loop();
  TEST_ASSERT_EQUAL_STRING("@{\"t\":\"pong\",\"r\":1}\n", s.captured.c_str());
}

// ---- appConnected() (§3.5 rule 5) ------------------------------------------

void test_appConnected_true_after_hi_and_recent_ping() {
  FakeStream s;
  SerialDash dash(s);
  s.feedInput("@{\"t\":\"hi\",\"v\":1}\n");
  dash.loop();
  s.feedInput("@{\"t\":\"ping\",\"r\":1}\n");
  dash.loop();
  TEST_ASSERT_TRUE(dash.appConnected());
}

void test_appConnected_false_once_ping_goes_stale() {
  FakeStream s;
  SerialDash dash(s);
  s.feedInput("@{\"t\":\"hi\",\"v\":1}\n");
  dash.loop();
  s.feedInput("@{\"t\":\"ping\",\"r\":1}\n");
  dash.loop();
  TEST_ASSERT_TRUE(dash.appConnected());
  advanceMillis(5001);
  TEST_ASSERT_FALSE(dash.appConnected());
}

// ---- DashValue tolerant conversions (LIB-CTL-02) ---------------------------

bool g_tolerantConversionsRan;

bool checkTolerantConversions(DashValue& v) {
  TEST_ASSERT_TRUE(v.isNumber());
  TEST_ASSERT_EQUAL(1, v.toInt());
  TEST_ASSERT_TRUE(v.toBool());  // nonzero number -> true
  g_tolerantConversionsRan = true;
  return true;
}

void test_DashValue_tolerant_conversions() {
  FakeStream s;
  SerialDash dash(s);
  g_tolerantConversionsRan = false;
  dash.onControl("x", checkTolerantConversions);
  s.feedInput("@{\"t\":\"c\",\"r\":1,\"id\":\"x\",\"v\":1}\n");
  dash.loop();
  TEST_ASSERT_TRUE(g_tolerantConversionsRan);
}

// Writes one sample instance of every message/widget kind to `path`, one
// JSON line per line — not itself a Unity test, just a batch of real library
// output for a separate CI step to run through the schema (QA-11: "ogni
// riga prodotta dai test della libreria viene validata anche contro lo JSON
// Schema"). See tools/validate-vectors/src/validate-lines.ts.
void dumpSampleLinesForSchemaValidation(const char* path) {
  FakeStream s;
  SerialDash dash(s);
  dash.begin("Demo", "1.0.0");
  dash.line("l")
      .ch("a", "b")
      .labels("A", "B")
      .colors("#ff0000", "#00ff00")
      .unit("C")
      .range(-10, 45)
      .window(20)
      .step()
      .fill()
      .stale(5)
      .size(6, 4)
      .order(1)
      .group("G")
      .decimals(2);
  dash.value("v").trend().minmax().warn(0, 10).alarm(-5, 50);
  dash.gauge("g").ch("h").range(0, 100).zone(0, 30, "#e67e22");
  dash.led("led").ch("f").on("#2ecc71").off("#888888");
  dash.led("led2").ch("st").state(0, "Off", "#888888").state(1, "On", "#2ecc71");
  dash.log("evt").minLevel("warn").limit(200).sources("a", "b");
  dash.xy("xy1").ch("pos").xrange(0, 10).yrange(0, 10).trail(500).mode("points").xlabel("x").ylabel(
      "y");
  dash.bar("bar1").ch("s").range(0, 100).horiz().xlabels("a", "b");
  dash.pie("pie1").ch("c").donut().pct();
  dash.level("lvl1").ch("h").range(0, 100).vert();
  dash.table("tab1").cols("A", "B");
  dash.heat("heat1").ch("ir").rows(8).cols(8).range(20, 40).palette("thermal").interp();
  dash.hist("hist1").bins(20).range(0, 100).samples(1000);
  dash.polar("pol1").ch("scan").rmax(200).angleRange(0, 180).sweep();
  dash.compass("cmp1").ch("hd").ref("N", "E", "S", "W");
  dash.attitude("att1").ch("p");
  dash.button("btn1").hold().label("Go").color("#ff0000").confirm("Sure?");
  dash.toggle("sw1", "Switch").value(false);
  dash.slider("sl1", "Slider").range(0, 255).stepSize(1).value(0);
  dash.number("num1").range(0, 10).stepSize(0.5);
  dash.select("sel1").option("a").option("b", "B").value("a");
  dash.text("txt1").limit(32).placeholder("type");
  dash.color("col1").swatches("#ff0000", "#00ff00");
  // Deliberately NOT included here: dash.widget(id, "newkind") — the generic
  // escape hatch (LIB-TX-01) is meant for kinds the *schema* doesn't know
  // about yet ("per tipi futuri"), so of course it doesn't validate against
  // today's closed set of `k` values; it's covered by
  // test_generic_widget_and_prop_escape_hatch's exact-match assertion
  // instead, which checks the *encoder's* mechanics, not schema compliance.
  dash.update("g").range(0, 200).title("Updated");
  dash.remove("g");
  dash.removeAll();
  dash.data().add("a", 1).add("b", 1.5).add("c", true).add("d", "x").ts(123);
  dash.sendXY("xy1", 1.0, 2.0);
  float arr[3] = {1, 2, 3};
  dash.sendArray("ir", arr, 3);
  dash.data().map("m").kv("A", 1).kv("B", 2);
  dash.debug("d");
  dash.info("i");
  dash.warn("w");
  dash.error("e");

  // M4: ack/pong are also device-to-app messages (§3.3) and belong in the schema-validated
  // sample too — exercised through the real RX path, not written directly.
  dash.onControl("sample-ctl", [](DashValue& v) {
    v.set(v.toInt());
    return true;
  });
  s.feedInput("@{\"t\":\"ping\",\"r\":1}\n");
  dash.loop();
  s.feedInput("@{\"t\":\"c\",\"r\":2,\"id\":\"sample-ctl\",\"v\":1}\n");
  dash.loop();
  s.feedInput("@{\"t\":\"c\",\"r\":3,\"id\":\"unregistered\",\"v\":1}\n");
  dash.loop();

  FILE* f = fopen(path, "w");
  if (f != nullptr) {
    fwrite(s.captured.data(), 1, s.captured.size(), f);
    fclose(f);
  }
}

int main(int argc, char** argv) {
  if (argc > 1) {
    dumpSampleLinesForSchemaValidation(argv[1]);
    return 0;
  }

  UNITY_BEGIN();
  RUN_TEST(test_widget_line);
  RUN_TEST(test_widget_value);
  RUN_TEST(test_widget_gauge);
  RUN_TEST(test_widget_led_colors);
  RUN_TEST(test_widget_led_states);
  RUN_TEST(test_widget_log);
  RUN_TEST(test_widget_xy);
  RUN_TEST(test_widget_bar);
  RUN_TEST(test_widget_pie);
  RUN_TEST(test_widget_level);
  RUN_TEST(test_widget_table);
  RUN_TEST(test_widget_heat);
  RUN_TEST(test_widget_hist);
  RUN_TEST(test_widget_polar);
  RUN_TEST(test_widget_compass);
  RUN_TEST(test_widget_attitude);
  RUN_TEST(test_widget_button);
  RUN_TEST(test_widget_button_hold);
  RUN_TEST(test_widget_switch);
  RUN_TEST(test_widget_slider);
  RUN_TEST(test_widget_number);
  RUN_TEST(test_widget_select);
  RUN_TEST(test_widget_select_labelled_opts);
  RUN_TEST(test_widget_text);
  RUN_TEST(test_widget_color);
  RUN_TEST(test_update_partial);
  RUN_TEST(test_remove_one);
  RUN_TEST(test_remove_all);
  RUN_TEST(test_data_multiple_forms);
  RUN_TEST(test_data_with_timestamp);
  RUN_TEST(test_data_ts_called_after_add_still_correct);
  RUN_TEST(test_data_nan_and_infinity_sent_as_null);
  RUN_TEST(test_event_warn_with_src);
  RUN_TEST(test_hi_contains_name_and_fw);
  RUN_TEST(test_ondeclare_invoked_by_begin);
  RUN_TEST(test_app_connected_false_before_hi_and_ping);
  RUN_TEST(test_float_trailing_zeros_stripped);
  RUN_TEST(test_float_negative_rounds_to_zero_without_minus_sign);
  RUN_TEST(test_generic_widget_and_prop_escape_hatch);

  // RX / controls (M4)
  RUN_TEST(test_a2d_hi_request_triggers_redeclare);
  RUN_TEST(test_a2d_ping_replies_pong);
  RUN_TEST(test_a2d_ping_unknown_scalar_field_ignored);
  RUN_TEST(test_a2d_c_set_control_bool);
  RUN_TEST(test_a2d_c_numeric_value);
  RUN_TEST(test_a2d_c_string_value);
  RUN_TEST(test_a2d_c_nested_value_skipped_gracefully);
  RUN_TEST(test_a2d_c_r_out_of_range_still_handled);
  RUN_TEST(test_a2d_invalid_id_bad_character_falls_through_to_unknown);
  RUN_TEST(test_a2d_malformed_json_does_not_crash_and_buffer_recovers);
  RUN_TEST(test_onControl_reject_sends_err_and_no_echo);
  RUN_TEST(test_onControl_set_changes_the_echoed_value);
  RUN_TEST(test_onAnyControl_handles_ids_without_their_own_callback);
  RUN_TEST(test_unknown_control_with_no_handler_at_all);
  RUN_TEST(test_onControl_matches_a_flash_id);
  RUN_TEST(test_onText_receives_lines_not_starting_with_at_brace);
  RUN_TEST(test_setAutoEcho_false_suppresses_d_but_not_ack);
  RUN_TEST(test_rx_overflow_reports_event_and_recovers);
  RUN_TEST(test_appConnected_true_after_hi_and_recent_ping);
  RUN_TEST(test_appConnected_false_once_ping_goes_stale);
  RUN_TEST(test_DashValue_tolerant_conversions);
  return UNITY_END();
}
