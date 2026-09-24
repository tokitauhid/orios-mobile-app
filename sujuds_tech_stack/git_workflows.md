# Git Workflows to Release App

The Sujud project automates its releases using GitHub Actions. The workflow is defined in `.github/workflows/release-apk.yml`.

## Trigger Mechanism
The release workflow is automatically triggered when a Git tag starting with `v` (e.g., `v3.4.0`) is pushed to the repository.

## CI/CD Pipeline Workflow

Here is the complete workflow definition for the release process:

```yaml
name: Build & Release APK

on:
  push:
    tags:
      - "v*"

permissions:
  contents: write

jobs:
  build:
    name: Build & Release APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "21"
          cache: gradle

      - name: Set up Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Verify Secrets
        env:
          ENV_FILE: ${{ secrets.ENV_FILE }}
          GOOGLE_SERVICES: ${{ secrets.GOOGLE_SERVICES_JSON }}
        run: |
          echo "Checking secrets..."
          if [ -z "$ENV_FILE" ]; then
            echo "::error::The ENV_FILE secret is missing or empty!"
            exit 1
          fi
          if [ -z "$GOOGLE_SERVICES" ]; then
            echo "::error::The GOOGLE_SERVICES_JSON secret is missing or empty!"
            exit 1
          fi

      - name: Create .env
        env:
          ENV_FILE: ${{ secrets.ENV_FILE }}
        run: echo "$ENV_FILE" > .env

      - name: Create google-services.json
        env:
          GOOGLE_SERVICES: ${{ secrets.GOOGLE_SERVICES_JSON }}
        run: |
          mkdir -p android/app
          echo "$GOOGLE_SERVICES" > android/app/google-services.json

      - name: Build web assets
        run: npm run build

      - name: Sync Capacitor
        run: npx cap sync android

      - name: Check signing configuration
        id: signing
        env:
          KEYSTORE_BASE64: ${{ secrets.KEYSTORE_BASE64 }}
        run: |
          if [ -n "$KEYSTORE_BASE64" ]; then
            echo "enabled=true" >> "$GITHUB_OUTPUT"
          else
            echo "enabled=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Decode keystore
        if: steps.signing.outputs.enabled == 'true'
        env:
          KEYSTORE_BASE64: ${{ secrets.KEYSTORE_BASE64 }}
        run: echo "$KEYSTORE_BASE64" | base64 --decode > android/app/release.keystore

      - name: Remove hardcoded org.gradle.java.home
        run: |
          sed -i '/org.gradle.java.home/d' android/gradle.properties
          echo "org.gradle.java.home=$JAVA_HOME" >> android/gradle.properties

      - name: Build signed release APK
        if: steps.signing.outputs.enabled == 'true'
        working-directory: android
        env:
          KEYSTORE_FILE: ${{ github.workspace }}/android/app/release.keystore
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
        run: |
          ./gradlew assembleRelease \
            -Dorg.gradle.java.home="$JAVA_HOME" \
            -Pandroid.injected.signing.store.file="$KEYSTORE_FILE" \
            -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
            -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
            -Pandroid.injected.signing.key.password="$KEY_PASSWORD"

      - name: Build debug APK
        if: steps.signing.outputs.enabled != 'true'
        working-directory: android
        run: ./gradlew assembleDebug -Dorg.gradle.java.home="$JAVA_HOME"

      - name: Find APK
        id: apk
        run: |
          if [ "${{ steps.signing.outputs.enabled }}" = "true" ]; then
            APK=$(find android/app/build/outputs/apk/release -type f -name "*.apk" | head -n 1)
          else
            APK=$(find android/app/build/outputs/apk/debug -type f -name "*.apk" | head -n 1)
          fi
          echo "path=$APK" >> "$GITHUB_OUTPUT"

      - name: Prepare release APK
        id: release_apk
        run: |
          TAG="${GITHUB_REF_NAME}"
          ORIGINAL="${{ steps.apk.outputs.path }}"
          mkdir -p release
          cp "$ORIGINAL" "release/Sujud-${TAG}.apk"
          echo "path=release/Sujud-${TAG}.apk" >> "$GITHUB_OUTPUT"

      - name: Generate changelog
        run: |
          CURRENT_TAG="${GITHUB_REF_NAME}"
          PREV_TAG=$(git tag --sort=-v:refname | grep -A1 "^${CURRENT_TAG}$" | tail -n1)
          if [ -z "$PREV_TAG" ] || [ "$PREV_TAG" = "$CURRENT_TAG" ]; then
            COMMITS=$(git log --pretty=format:"- %s (\`%h\`)" --no-merges)
          else
            COMMITS=$(git log --pretty=format:"- %s (\`%h\`)" --no-merges "${PREV_TAG}..${CURRENT_TAG}")
          fi
          
          {
            echo "## 🕌 Sujud ${CURRENT_TAG}"
            echo ""
            echo "### What's Changed"
            echo ""
            echo "$COMMITS"
            echo ""
            echo "---"
            echo "### Installation"
            echo "1. Download \`Sujud-${CURRENT_TAG}.apk\` below"
            echo "2. Transfer it to your Android device"
            echo "3. Open the APK and follow the install prompts"
          } > changelog.md

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          body_path: changelog.md
          files: ${{ steps.release_apk.outputs.path }}
```
