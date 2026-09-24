# 📱 Orios Mobile — Native Android App

A dedicated native Android application for **Orios Class Portal**, built to provide students and faculty with high-performance, offline-first access to class notes, routines, assignments, and announcements.

Companion to [Orios-Class-Portal-V2](https://github.com/tokitauhid/Orios-Class-Portal-V2).

---

## 🎯 Key Objectives

1. **Native Performance:** Fast, fluid, responsive Android experience.
2. **Offline-First Notes:** Download course notes (PDF, DOCX, ZIP) directly to local storage and browse catalog metadata even with zero internet connectivity.
3. **Native File Opening:** Direct handoff to Android's default file viewers (PDF readers, office tools) using native Android Intents (`ACTION_VIEW`).
4. **Push Notifications:** Immediate alerts for newly uploaded lecture notes, assignments, and class announcements via Firebase Cloud Messaging (FCM) triggered by Supabase Webhooks.
5. **In-App Updater:** Over-The-Air (OTA) runtime updates for rapid bug fixes and an in-app APK updater for native releases.

---

## 🏗️ Architecture & Tech Stack

- **Framework:** React Native with Expo
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Backend / Database:** Supabase (PostgreSQL, Storage, Auth)
- **Local Storage & Offline Caching:** `expo-file-system`, `expo-sqlite`, `AsyncStorage`
- **Native File Viewer:** `expo-intent-launcher` + `expo-file-system`
- **Notifications:** `expo-notifications` + Firebase Cloud Messaging (FCM)
- **Updates:** Expo EAS Update / In-app APK updater

---

## 📁 Repository Structure

```text
├── develpment plan.md       # Comprehensive architectural plan & roadmap
├── sujuds_tech_stack/       # Reference documentation extracted from Sujud
│   ├── tech_stack.md        # Sujud dependencies & plugins reference
│   ├── git_workflows.md     # GitHub Actions CI/CD release workflow
│   ├── versioning_scripts.md# Bash scripts for semantic versioning & APK deployment
│   └── android_development.md# Native Android build & ADB deployment patterns
├── LICENSE                  # MIT License
├── README.md                # Project documentation
└── .gitignore               # Android, Node, Gradle, and secret exclusions
```

---

## 🗺️ Roadmap & Phases

- [x] **Phase 0: Planning & Architectural Alignment** (See [`develpment plan.md`](./develpment%20plan.md))
  - Architectural Decision Record (ADR): Dedicated Native App vs. WebView wrapper.
  - Offline-first storage and intent launch strategy.
  - Review of production release patterns from Sujud.
- [ ] **Phase 1: Project Scaffolding & Core Shell**
  - Initialize Expo project with TypeScript and NativeWind.
  - Configure Supabase client connection.
  - Implement bottom-tab navigation mirroring the portal structure.
- [ ] **Phase 2: Offline Storage & Native Document Viewer**
  - Local caching for subjects and notes list.
  - File download engine using `expo-file-system`.
  - Android Intent integration for opening PDFs natively.
- [ ] **Phase 3: Push Notifications**
  - FCM + `expo-notifications` integration.
  - Supabase Database Webhook trigger for notes and assignments.
- [ ] **Phase 4: Release Automation & Updater**
  - In-app version check against Supabase `app_versions` table.
  - GitHub Actions CI/CD for APK building and releases.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
