// Baseline sketch for the SPEC.md §9.3 / DOC-14 size report: does roughly
// what examples/02_FirstChart does (read millis(), compute a sine value,
// print it over Serial once per loop) but WITHOUT SerialDash, so comparing
// its compiled size against 02_FirstChart's isolates the library's own
// flash/RAM overhead (LIB-GEN-07) rather than measuring sin()/Serial's own
// footprint too. Not a real example — never listed in examples.md — just a
// fixture for tools/size-report.

void setup() { Serial.begin(115200); }

void loop() {
  double v = sin(millis() / 1000.0);
  Serial.println(v, 3);
  delay(50);
}
