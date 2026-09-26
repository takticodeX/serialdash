#!/usr/bin/env bash
# QA-12: compiles every SerialDash example against every board LIB-GEN-03
# declares as tested. Requires arduino-cli with these cores already
# installed (see docs/contributing/testing.md); mirrors the
# library-compile matrix in .github/workflows/ci.yml, but sequentially and
# locally instead of as a parallel CI matrix.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LIB_DIR="$REPO_ROOT/lib/SerialDash"

BOARDS=(
  "arduino:avr:uno"
  "arduino:avr:mega"
  "esp32:esp32:esp32"
  "esp32:esp32:esp32s3"
  "esp32:esp32:esp32c3"
  "esp8266:esp8266:nodemcuv2"
  "rp2040:rp2040:rpipico"
  "arduino:samd:mkrzero"
)

EXAMPLES=(
  "01_TextOnly"
  "02_FirstChart"
  "03_WeatherStation"
  "04_Controls"
  "07_TextCommands"
)

failures=0
for board in "${BOARDS[@]}"; do
  for example in "${EXAMPLES[@]}"; do
    echo "==> $example on $board"
    if ! arduino-cli compile --fqbn "$board" --library "$LIB_DIR" "$LIB_DIR/examples/$example" \
        >/tmp/lib-compile-output.log 2>&1; then
      echo "FAILED: $example on $board"
      cat /tmp/lib-compile-output.log
      failures=$((failures + 1))
    fi
  done
done

if [ "$failures" -gt 0 ]; then
  echo "$failures compile(s) failed."
  exit 1
fi
echo "All examples compiled cleanly on all ${#BOARDS[@]} boards."
