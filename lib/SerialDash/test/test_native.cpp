// Native unit tests for the SerialDash library's transmit path (SPEC.md
// §9.2 QA-10, "test nativi output" per §11's M3 scope — the receive-side
// parser tests noted in PRO-04 land in M4 alongside LIB-RX-01..07).
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

void test_app_connected_always_false_in_m3() {
  FakeStream s;
  SerialDash dash(s);
  TEST_ASSERT_FALSE(dash.appConnected());  // truthful answer needs M4's RX/ping tracking
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
  RUN_TEST(test_app_connected_always_false_in_m3);
  RUN_TEST(test_float_trailing_zeros_stripped);
  RUN_TEST(test_float_negative_rounds_to_zero_without_minus_sign);
  RUN_TEST(test_generic_widget_and_prop_escape_hatch);
  return UNITY_END();
}
