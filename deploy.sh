#!/bin/bash
# ==============================================================================
# Orios Mobile - Local Build & ADB Deploy Script
# Compiles unsigned Debug APK and installs directly to connected device
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================================="
echo "🚀 Orios Mobile: Building & Deploying Debug APK"
echo "=========================================================="

# 1. Check for Android SDK
if [ -z "$ANDROID_HOME" ]; then
  if [ -d "/opt/android-sdk" ]; then
    export ANDROID_HOME="/opt/android-sdk"
  fi
fi

# Ensure local.properties exists
if [ ! -f "$PROJECT_ROOT/android/local.properties" ] && [ -n "$ANDROID_HOME" ]; then
  echo "sdk.dir=$ANDROID_HOME" > "$PROJECT_ROOT/android/local.properties"
fi

# 2. Build Debug APK via Gradle
echo "📦 [1/3] Compiling Android Debug APK with Gradle..."
cd "$PROJECT_ROOT/android"
./gradlew assembleDebug --no-daemon

APK_PATH="$PROJECT_ROOT/android/app/build/outputs/apk/debug/app-debug.apk"

if [ ! -f "$APK_PATH" ]; then
  echo "❌ Error: Build completed but APK was not found at $APK_PATH"
  exit 1
fi

echo "✅ [2/3] APK compiled successfully: $(ls -lh "$APK_PATH" | awk '{print $5}')"

# 3. Detect ADB Devices & Deploy
cd "$PROJECT_ROOT"
if command -v adb >/dev/null 2>&1; then
  CONNECTED_DEVICES=$(adb devices 2>/dev/null | grep -w "device" | awk '{print $1}' || true)

  if [ -z "$CONNECTED_DEVICES" ]; then
    echo "⚠️  No ADB devices connected. APK is ready at:"
    echo "   $APK_PATH"
    exit 0
  fi

  for DEV in $CONNECTED_DEVICES; do
    echo "📱 [3/3] Installing APK to connected device ($DEV)..."
    if adb -s "$DEV" install -r "$APK_PATH"; then
      echo "✅ Successfully installed on $DEV!"
      echo "🚀 Launching Orios Mobile on $DEV..."
      adb -s "$DEV" shell monkey -p com.orios.app -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true
      adb -s "$DEV" reverse tcp:8081 tcp:8081 2>/dev/null || true
    else
      echo "⚠️  Direct ADB install restricted by device (common on Xiaomi/MIUI/HyperOS)."
      echo "📲 Copying APK directly to phone Downloads folder..."
      adb -s "$DEV" push "$APK_PATH" /sdcard/Download/orios-debug.apk
      echo "✅ APK copied to: /sdcard/Download/orios-debug.apk"
      echo "👉 Open the Downloads / File Manager app on your phone and tap 'orios-debug.apk' to install."
    fi
  done
else
  echo "⚠️  adb command not found. APK is ready at: $APK_PATH"
fi

echo "=========================================================="
echo "🎉 Deployment complete!"
echo "=========================================================="
