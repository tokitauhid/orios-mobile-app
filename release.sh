#!/bin/bash

# ==============================================================================
# Orios Mobile - Versioning & Release Automation Script
# Bumps version across package.json, app.json, and android/app/build.gradle,
# creates a git commit, and tags the release.
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Default release type is 'patch' if none provided (patch | minor | major)
TYPE=${1:-patch}

# Ensure working directory is clean
if [[ -n $(git status -s) ]]; then
  echo "❌ Error: Working directory is not clean. Please commit or stash your changes first."
  exit 1
fi

echo "====================================="
echo "🚀 Orios Mobile: Bumping Version ($TYPE)..."
echo "====================================="

# 1. Bump version in package.json
npm version "$TYPE" --no-git-tag-version

# 2. Extract new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "📌 New version: $NEW_VERSION"

# 3. Update android/app/build.gradle
GRADLE_FILE="android/app/build.gradle"
CURRENT_VERSION_CODE=$(grep 'versionCode' "$GRADLE_FILE" | head -n1 | awk '{print $2}')
NEW_VERSION_CODE=$((CURRENT_VERSION_CODE + 1))

echo "📱 Incrementing Android versionCode: $CURRENT_VERSION_CODE -> $NEW_VERSION_CODE"
echo "📱 Updating Android versionName: $NEW_VERSION"

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/versionCode $CURRENT_VERSION_CODE/versionCode $NEW_VERSION_CODE/" "$GRADLE_FILE"
  sed -i '' "s/versionName \".*\"/versionName \"$NEW_VERSION\"/" "$GRADLE_FILE"
else
  sed -i "s/versionCode $CURRENT_VERSION_CODE/versionCode $NEW_VERSION_CODE/" "$GRADLE_FILE"
  sed -i "s/versionName \".*\"/versionName \"$NEW_VERSION\"/" "$GRADLE_FILE"
fi

# 4. Update app.json to match
node -e "
const fs = require('fs');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
appJson.expo.version = '$NEW_VERSION';
if (appJson.expo.android) {
  appJson.expo.android.versionCode = $NEW_VERSION_CODE;
}
fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2) + '\n');
"

# 5. Stage changed version manifests
git add package.json package-lock.json app.json "$GRADLE_FILE"

# 6. Commit release
COMMIT_MSG="chore(release): v$NEW_VERSION"
git commit -m "$COMMIT_MSG"

# 7. Create Git Tag
TAG_NAME="v$NEW_VERSION"
git tag "$TAG_NAME"

echo "====================================="
echo "✅ Version bumped successfully to $TAG_NAME"
echo "====================================="

# 8. Push confirmation
if [ -t 0 ]; then
  read -p "Push release commit and tag ($TAG_NAME) to origin? (y/N) " -n 1 -r PUSH_CONFIRM
  echo
  if [[ "$PUSH_CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Pushing commit and tag to origin..."
    git push origin HEAD
    git push origin "$TAG_NAME"
    echo "🎉 Pushed! GitHub Actions release workflow triggered."
  else
    echo "ℹ️  Push skipped. Push manually using:"
    echo "   git push origin HEAD && git push origin $TAG_NAME"
  fi
else
  echo "ℹ️  Non-interactive shell. Push manually using:"
  echo "   git push origin HEAD && git push origin $TAG_NAME"
fi
