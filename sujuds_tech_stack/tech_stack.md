# Sujud App Tech Stack

Based on the `package.json` and project configurations, here is the technology stack used for the Sujud project:

## Core Framework
- **Frontend Library:** React (v18)
- **UI Framework:** Ionic React (`@ionic/react`)
- **Native Container:** Capacitor (v8) - Bridges the web app to native mobile (Android/iOS).
- **Build Tool:** Vite
- **Language:** TypeScript

## State & Routing
- **Routing:** React Router DOM (v5.3.x, integrated via `@ionic/react-router`)

## Styling & UI Components
- **CSS Framework:** Tailwind CSS
- **Animation:** Framer Motion, Tailwind CSS Animate, React Confetti Explosion
- **Icons:** Lucide React, Ionicons, React Icons
- **UI Primitives:** Radix UI (`@radix-ui/react-dialog`, `@radix-ui/react-slot`), Vaul (for drawer components)
- **Data Visualization:** React Minimal Pie Chart
- **Virtual Lists:** React Window, React Virtualized (for performance with large lists)

## Backend & Database
- **Firebase:** Core `firebase` SDK, augmented with Capacitor plugins (`@capacitor-firebase/authentication`, `@capacitor-firebase/firestore`).
- **Local Database:** SQLite (using `@capacitor-community/sqlite` and `sql.js`).

## Native Capabilities (Capacitor Plugins)
- App lifecycle and management (`@capacitor/app`, `@capacitor/splash-screen`, `@capacitor/status-bar`)
- Device hardware (`@capacitor/geolocation`, `@capacitor/keyboard`)
- File and sharing (`@capacitor/filesystem`, `@capacitor/share`)
- Notifications (`@capacitor/local-notifications`)
- Utilities (`@capawesome-team/capacitor-android-battery-optimization`, `@capawesome/capacitor-android-edge-to-edge-support`, `@capacitor-community/in-app-review`)

## Testing & Quality Assurance
- **Unit/Integration Testing:** Vitest, Testing Library (`@testing-library/react`), JSDOM
- **Linting:** ESLint with TypeScript hooks.

## Domain Specific
- **Prayer Times:** `adhan` (library for calculating Islamic prayer times).

---

### Package Dependencies Code Reference

Here is the exact `dependencies` tree extracted from `package.json`:

```json
  "dependencies": {
    "@capacitor-community/in-app-review": "^8.0.0",
    "@capacitor-community/sqlite": "^8.0.0",
    "@capacitor-firebase/authentication": "^8.4.0",
    "@capacitor-firebase/firestore": "^8.4.0",
    "@capacitor/android": "^8.1.0",
    "@capacitor/app": "^8.0.0",
    "@capacitor/core": "^8.1.0",
    "@capacitor/dialog": "^8.0.0",
    "@capacitor/filesystem": "^8.1.1",
    "@capacitor/geolocation": "^8.1.0",
    "@capacitor/keyboard": "^8.0.0",
    "@capacitor/local-notifications": "^8.0.0",
    "@capacitor/share": "^8.0.0",
    "@capacitor/splash-screen": "^8.0.0",
    "@capacitor/status-bar": "^8.0.0",
    "@capacitor/toast": "^8.0.0",
    "@capawesome-team/capacitor-android-battery-optimization": "^8.0.0",
    "@capawesome/capacitor-android-edge-to-edge-support": "^8.0.5",
    "@emotion/is-prop-valid": "^1.3.1",
    "@ionic/react": "^8.6.5",
    "@ionic/react-router": "^8.6.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-slot": "^1.0.2",
    "@types/lodash": "^4.17.0",
    "@types/react-window-infinite-loader": "^1.0.9",
    "@types/recharts": "^1.8.29",
    "adhan": "^4.4.3",
    "braces": "^3.0.3",
    "capacitor-native-settings": "^8.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^2.30.0",
    "dotenv": "^16.4.7",
    "firebase": "^12.18.0",
    "framer-motion": "^11.0.5",
    "ionicons": "^8.0.13",
    "lodash": "^4.17.21",
    "lucide-react": "^0.359.0",
    "merge": "^2.1.1",
    "npm-watch": "^0.11.0",
    "prop-types": "^15.8.1",
    "rc-switch": "^4.1.0",
    "react": "^18.2.0",
    "react-confetti-explosion": "^2.1.2",
    "react-dom": "^18.2.0",
    "react-icons": "^4.12.0",
    "react-joyride": "^2.9.3",
    "react-minimal-pie-chart": "^9.1.0",
    "react-modal": "^3.16.1",
    "react-router-dom": "^5.3.4",
    "react-virtualized": "^9.22.5",
    "react-virtualized-auto-sizer": "^1.0.24",
    "react-window": "^1.8.10",
    "react-window-infinite-loader": "^1.0.9",
    "rollup": "^4.24.0",
    "semver": "^7.6.3",
    "sql.js": "^1.12.0",
    "swiper": "^11.0.7",
    "tailwind-merge": "^2.3.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.1"
  }
```
