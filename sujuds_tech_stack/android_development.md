# Android Development Details

The Android aspect of the Sujud app is managed through **Capacitor**, acting as the bridge between the Vite/React web app and the native Android ecosystem.

## 1. Native Build System
- **Environment:** Requires Java JDK (17 or 21) and Android SDK (API 34+).
- **Core Engine:** Capacitor 8 (`@capacitor/android`).
- **Build Tool:** Gradle, configured within the `/android` directory.

## 2. Advanced Local Build & Deploy Script
Located at `scripts/build-release-apk.sh` (or executed via `npm run build:apk`), this script is highly robust for local development. It automates web building, Gradle APK building, keystore discovery, and direct ADB deployment.

**Snippet of how it detects ADB devices and pushes the APK:**

```bash
# ...
if command -v adb >/dev/null 2>&1; then
  CONNECTED_DEVICES=$(adb devices 2>/dev/null | grep -w "device" | awk '{print $1}' || true)
  if [ -n "$CONNECTED_DEVICES" ]; then
    DEVICE_COUNT=$(echo "$CONNECTED_DEVICES" | wc -l)
    echo "📱 Found $DEVICE_COUNT connected ADB device(s):"
    
    # ... handles prompting the user ...
    
    for DEV in $CONNECTED_DEVICES; do
      echo "🚀 Installing APK to $DEV..."
      if adb -s "$DEV" install -r "$DEST_APK"; then
        echo "✅ Successfully installed on $DEV!"
      else
        echo "❌ Failed to install on $DEV via ADB."
      fi
    done
  fi
fi
```

## 3. Auto Keystore Logic
The build script intelligently handles release signing credentials without hardcoding secrets:

```bash
# Auto-discover keystore if not specified
if [ -z "$KEYSTORE_FILE" ]; then
  SEARCH_LOCATIONS=(
    "$PROJECT_ROOT/internal/secrets/release.keystore"
    "$PROJECT_ROOT/android/app/release.keystore"
    "$PROJECT_ROOT/release.keystore"
  )
  for LOC in "${SEARCH_LOCATIONS[@]}"; do
    if [ -f "$LOC" ]; then
      KEYSTORE_FILE="$LOC"
      break
    fi
  done
fi

# Fallback to Unsigned Debug APK
if [ -z "$KEYSTORE_FILE" ] || [ ! -f "$KEYSTORE_FILE" ]; then
  read -rp "Would you like to build an unsigned Debug APK instead? [Y/n]: " FALLBACK_DEBUG
  if [[ ! "$FALLBACK_DEBUG" =~ ^[Nn]$ ]]; then
    BUILD_DEBUG=true
  fi
fi
```

## 4. Capacitor Specific Plugins
Sujud heavily relies on native capabilities accessible via Capacitor:
- `@capacitor-community/sqlite` & `@capacitor-community/in-app-review`
- Background & OS integration: `@capawesome-team/capacitor-android-battery-optimization`, `@capawesome/capacitor-android-edge-to-edge-support`
- Firebase bindings for native performance: `@capacitor-firebase/authentication`, `@capacitor-firebase/firestore`
- Standard hardware access: Geolocation, Keyboard, Filesystem, Status Bar, Splash Screen.

## 5. Gradle Configurations
Version codes and names are automated via `release.sh`, which parses `android/app/build.gradle`. Gradle dependencies are kept in sync with NPM via Capacitor (`npx cap sync android`), meaning most plugin updates originate in `package.json` rather than direct Gradle modifications.
