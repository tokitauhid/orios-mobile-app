# Orios Class Portal - Development Plan

> 📍 **Companion Web Repository & Backend**:
> - **Filesystem Path:** [`../Orios-Class-Portal-V2`](file:///home/tokit/Projects/Orios-Class-Portal-V2) (`/home/tokit/Projects/Orios-Class-Portal-V2`)
> - **Remote Repository:** `https://github.com/tokitauhid/Orios-Class-Portal-V2.git`
> - **Schema Reference:** [`../Orios-Class-Portal-V2/supabase_schema.sql`](file:///home/tokit/Projects/Orios-Class-Portal-V2/supabase_schema.sql)
> - **Subject Constants:** [`../Orios-Class-Portal-V2/lib/subjects.js`](file:///home/tokit/Projects/Orios-Class-Portal-V2/lib/subjects.js)

## Architecture Decision Record (ADR): React Native vs. WebView Wrapper
Before beginning development, we evaluated wrapping the existing mobile-optimized Next.js website (e.g., using Capacitor) versus building a dedicated React Native app. 

**Decision:** We are building a **dedicated React Native (Expo) app from the ground up.**
**Rationale:**
- **The Offline Requirement:** The current Next.js web app is Server-Side Rendered (SSR) on Cloudflare. If wrapped in a WebView, the app would show a "No Internet" screen when offline, completely breaking the requirement for local file storage and offline note viewing.
- **Background Tasks:** Features like background sync ("knocking" the user when offline) and native file opening (Intents) require deep native integration that is unreliable or impossible in a simple SSR WebView wrapper.
- **UI Rebuild Strategy:** The UI cannot be copy-pasted (React Native uses `<View>`/`<Text>` instead of HTML `<div>`). However, we will use **NativeWind** (Tailwind CSS for React Native) to mirror the exact design and reuse the same utility classes (`flex`, `p-4`, etc.), drastically speeding up the UI rewrite while maintaining the exact same look and feel. The Supabase logic and state management "brain" will also be heavily reused.

---

## Phase 1: Native Android App (Dedicated Mobile Experience)
**Technology Stack Recommendation:** React Native with Expo and NativeWind.

### 1. Core Architecture
- **Dedicated Native App:** Build a standalone repository/project for the mobile app to ensure it performs natively.
- **Backend Integration:** Connect the app directly to the existing Supabase PostgreSQL database and Storage buckets via the Supabase JS client.

### 2. Local Storage & Offline Support (Notes)
- **File Storage:** Use `expo-file-system` to securely download and store PDF, DOCX, and ZIP files directly on the device's local storage.
- **Data Caching:** Cache database metadata (subjects, routine, assignments list) locally using `AsyncStorage` or local SQLite (`expo-sqlite`), ensuring the app is usable without an active internet connection.

### 3. Push Notifications (Notes & Announcements)
- **Implementation:** Utilize `expo-notifications` combined with Firebase Cloud Messaging (FCM).
- **Triggers:** Configure Supabase Database Webhooks so that inserting a new row into `public.notes` or `public.assignments` triggers a serverless function that dispatches the push notification to subscribed mobile clients.

### 4. Native File Viewing
- **Implementation:** Use `expo-intent-launcher` combined with `expo-file-system`.
- **Behavior:** The UI will track downloaded files. If a note is already downloaded, the "Download" button dynamically transforms into an "Open" button. Clicking it fires an Android Intent (`ACTION_VIEW`), handing the file off to the user's preferred native app (like a PDF viewer or Word).

### 5. Internal App Updater (OTA)
- **Implementation:** Expo EAS Update for Over-The-Air JavaScript updates (bypassing full APK reinstalls for minor UI changes). 
- **APK Updater:** For native changes, build an in-app APK downloader that checks a Supabase table for the latest version, downloads the new APK, and prompts the Android package installer.

---

## Phase 2: Server-Side & Web App Changes

### 1. UI/UX Restructuring
- **Subject-Based Notes:** Refactor the current `/notes` and `/assignments` pages. Instead of a flat list, collapse the items into categories grouped by `subject_id` (e.g., using Accordions or Tabs) to make browsing much cleaner.

### 2. App Promotion & Distribution
- **Dedicated Landing Page:** Create a new page (e.g., `/app` or `/mobile`) entirely dedicated to motivating users to download the native app. Highlight key features: offline access, background notifications, and better performance.
- **Download Buttons:** Add subtle but clear download prompts in strategic locations (e.g., the Navbar, footer, or as a banner for mobile web users).

### 3. API & Infrastructure for Mobile
- **App Version Control:** Create an `app_versions` table in Supabase to track the latest Android APK version, release notes, and the download URL. The mobile app will poll this to trigger the internal app updater.

---

## Phase 3: Future Enhancements [ON HOLD]

### 1. Background Sync & "Knock" Notifications
- **Implementation:** Implement `expo-background-fetch` alongside `expo-task-manager`.
- **Behavior:** The app will periodically run a background task to check Supabase for new content. If new content is found while the user is offline/app is closed, it fires a local notification to alert them. *(Currently paused to focus on core offline and push notification stability).*
