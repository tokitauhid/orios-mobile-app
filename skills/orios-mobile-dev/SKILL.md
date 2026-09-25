---
name: orios-mobile-dev
description: >-
  Comprehensive guide and operational runbook for developing the Orios Native Android mobile app.
  Use this skill whenever building native UI components, configuring React Native with Expo, setting up
  offline SQLite caching and document downloads, wiring push notifications with Supabase/FCM, managing
  Android Intents, or building release APKs.
---

# 📱 Orios Mobile Development Skill

This skill is the definitive architectural specification and development runbook for AI agents and engineers working on the **Orios Mobile (Android)** project.

---

## 1. Cross-Project Context & Path Pointers

The mobile application is a companion client to the **Orios Class Portal V2** web application, sharing the same Supabase database, data models, and brand styling.

| Resource | Filesystem Path | Purpose |
|---|---|---|
| **Web Repository Root** | [`../Orios-Class-Portal-V2`](file:///home/tokit/Projects/Orios-Class-Portal-V2) | Server-rendered portal codebase |
| **Database Schema** | [`../Orios-Class-Portal-V2/supabase_schema.sql`](file:///home/tokit/Projects/Orios-Class-Portal-V2/supabase_schema.sql) | Source of truth for PostgreSQL tables, triggers, and RLS |
| **Subject Config & Colors** | [`../Orios-Class-Portal-V2/lib/subjects.js`](file:///home/tokit/Projects/Orios-Class-Portal-V2/lib/subjects.js) | Subject codes, names, credit hours, and exact color palettes |
| **Mock Dataset** | [`../Orios-Class-Portal-V2/lib/mock-data.js`](file:///home/tokit/Projects/Orios-Class-Portal-V2/lib/mock-data.js) | Test fixtures and fallback data for development |
| **Sujud Reference Architecture** | [`./sujuds_tech_stack/`](file:///home/tokit/Projects/orios-mobile-app/sujuds_tech_stack) | Proven patterns for Android Gradle builds, keystore signing, and CI/CD |
| **Architectural Plan** | [`./develpment plan.md`](file:///home/tokit/Projects/orios-mobile-app/develpment%20plan.md) | Multi-phase development roadmap and ADR |

---

## 2. Architecture & Tech Stack

- **Core Framework:** React Native with Expo (Managed / Prebuild workflow).
- **Styling Engine:** NativeWind v4 (Tailwind CSS for React Native) to mirror web class names.
- **Icons:** `lucide-react-native` (matching the web's Lucide icon set).
- **Backend / API:** `@supabase/supabase-js` connecting directly to Supabase PostgreSQL and Storage.
- **Offline Storage:**
  - File Downloads: `expo-file-system` (stores PDFs, DOCX, ZIPs locally).
  - Metadata Caching: `expo-sqlite` and `@react-native-async-storage/async-storage`.
- **Native Document Handoff:** `expo-intent-launcher` (Android `ACTION_VIEW` for default PDF/doc viewers).
- **Push Notifications:** `expo-notifications` backed by Firebase Cloud Messaging (FCM).

---

## 3. Design System & Visual Guidelines

The mobile app must replicate the **"Quiet Premium"** aesthetic of the web portal:

### Color Palette
- **Backgrounds:** Dark-first zinc theme (`bg-zinc-950` root, `bg-zinc-900` cards/surfaces, `border-zinc-800` dividers).
- **Text:** High contrast white/zinc (`text-zinc-100` headings, `text-zinc-400` secondary/subtext).
- **Subject Color Tokens** (from `lib/subjects.js`):
  - **Indigo** (`eee-1201`): `bg-indigo-500/10 text-indigo-400 border-indigo-500/20`
  - **Emerald** (`phy-1201`): `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`
  - **Violet** (`cse-1201`): `bg-violet-500/10 text-violet-400 border-violet-500/20`
  - **Amber** (`math-1201`): `bg-amber-500/10 text-amber-400 border-amber-500/20`

### Navigation & Layout
- **Bottom Navigation Bar:** Routine / Today (`/schedule`), Notes (`/notes`), Assignments (`/assignments`), More (`/more`).
- **Header:** Sticky top bar with date, semester indicator, and search icon.
- **Gestures:** Pull-to-refresh on all lists to re-sync with Supabase.

---

## 4. Offline Storage & Document Viewer Pattern

To satisfy the primary offline requirement without bundling heavy PDF renderers inside the app:

### Step 1: File Storage Directory
```typescript
import * as FileSystem from 'expo-file-system';

const getLocalFilePath = (fileName: string) => {
  return `${FileSystem.documentDirectory}notes/${fileName}`;
};
```

### Step 2: Check & Download Pipeline
```typescript
export async function downloadNoteAttachment(url: string, fileName: string, onProgress?: (p: number) => void) {
  const localUri = getLocalFilePath(fileName);
  const info = await FileSystem.getInfoAsync(localUri);
  
  if (info.exists) {
    return localUri;
  }

  const downloadResumable = FileSystem.createDownloadResumable(
    url,
    localUri,
    {},
    (progress) => {
      const p = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
      onProgress?.(p);
    }
  );

  const result = await downloadResumable.downloadAsync();
  return result?.uri;
}
```

### Step 3: Native Intent Handoff (Android)
```typescript
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system';

export async function openLocalDocument(localUri: string, mimeType: string = 'application/pdf') {
  const contentUri = await FileSystem.getContentUriAsync(localUri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
    type: mimeType,
  });
}
```

---

## 5. Supabase Data Integration & Contracts

### Client Initialization
```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### Core Tables to Query
- `public.subjects` - Code, title, color key.
- `public.notes` - Title, description, `subject_id`, `attachments` (JSONB: `[{ name, url, type }]`).
- `public.assignments` - Title, `due_date`, `status`, `subject_id`, `attachments`.
- `public.routine` + `public.time_slots` - Day of week and slot index to build schedule.
- `public.teachers` - Faculty contacts, room numbers, office hours.

---

## 6. Build, Versioning & Release Pipeline (Lessons from Sujud)

When preparing Android builds, follow the battle-tested automation extracted from `sujud`:

1. **Semantic Versioning (`release.sh`):**
   - Automatically bumps version in `package.json`.
   - Increments `versionCode` by 1 and aligns `versionName` in Android Gradle configuration.
   - Creates a git release tag (`vX.Y.Z`) which triggers GitHub Actions.
2. **Release Keystore Setup:**
   - Place keystores in `internal/secrets/release.keystore` or `android/app/release.keystore`.
   - Never commit keystores to Git (ensured by `.gitignore`).
3. **CI/CD (`.github/workflows/release-apk.yml`):**
   - Java 21 + Node 22 setup.
   - Injects `GOOGLE_SERVICES_JSON` and keystore secrets.
   - Builds signed APK (`./gradlew assembleRelease`).
   - Automatically generates a git-log changelog and publishes a GitHub Release with the attached APK.

---

## 7. Golden Rules for AI Agents

1. **NO HTML Elements:** Do NOT write `<div>`, `<span>`, `<button>`, or `<a>`. Use React Native primitives: `<View>`, `<Text>`, `<Pressable>`, `<ScrollView>`, `<FlatList>`.
2. **NO Hardcoded Backend URLs:** Always pull from `EXPO_PUBLIC_SUPABASE_URL` and refer to `../Orios-Class-Portal-V2/supabase_schema.sql` for table and column definitions.
3. **Always Plan for Offline:** Every query to Supabase should cache its response locally. When the device has no network, render from cache immediately rather than showing a fatal network error.
4. **Preserve Design Language:** Use the exact subject colors and tokens defined in `../Orios-Class-Portal-V2/lib/subjects.js`.
5. **Interactive Feedback:** Always provide tactile visual feedback (`Pressable` with opacity / scale states) and loading indicators for network/download operations.
