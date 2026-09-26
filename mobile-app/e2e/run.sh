#!/usr/bin/env bash
# Emulator smoke test: install the release APK, run the Maestro flow, collect logs and screenshots.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/mobile-app/e2e/out"
mkdir -p "$OUT"
APK=$(ls "$ROOT"/dist/*.apk | head -1)
echo "APK: $APK"
adb wait-for-device
adb shell getprop ro.build.version.release || true
adb install -r -g "$APK" || exit 1
adb logcat -c || true
adb logcat -v time > "$OUT/logcat.txt" 2>&1 &
LOGPID=$!
export MAESTRO_CLI_NO_ANALYTICS=1
cd "$OUT"
maestro test --format junit --output "$OUT/report.xml" --debug-output "$OUT/debug" "$ROOT/mobile-app/e2e/flows/main.yaml"
RC=$?
adb exec-out screencap -p > "$OUT/final.png" || true
sleep 2
kill $LOGPID 2>/dev/null || true
grep -E "YZCV|ReactNativeJS|chromium|FATAL|AndroidRuntime" "$OUT/logcat.txt" > "$OUT/cv-log.txt" || true
echo "----- CV log (tail) -----"
tail -n 80 "$OUT/cv-log.txt" || true
if grep -q "YZCV ready source=local" "$OUT/logcat.txt"; then
  echo "CV engine started from bundled offline assets."
else
  echo "::warning::No 'YZCV ready source=local' in logcat. Check cv-log.txt."
fi
if grep -q "FATAL EXCEPTION" "$OUT/logcat.txt"; then
  echo "::error::App crash (FATAL EXCEPTION) found in logcat."
  RC=1
fi
exit $RC
