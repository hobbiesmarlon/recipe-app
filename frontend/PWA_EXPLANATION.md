# Progressive Web App (PWA) Implementation Guide

This document explains the PWA capabilities integrated into the Recipe App, enabling offline access, faster load times, and "installability" on devices.

## 1. Overview

The PWA implementation uses **`vite-plugin-pwa`**, which generates a Service Worker (`sw.js`) during the build process. This Service Worker acts as a network proxy, managing caching and offline requests.

**Key Features:**
*   **Installable:** Users can add the app to their home screen (mobile) or desktop.
*   **Offline Ready:** The app loads even without an internet connection.
*   **Asset Caching:** Images, fonts, and scripts are cached for performance.
*   **API Caching:** Previously visited recipes are available offline.

## 2. Caching Strategies

We utilize two primary caching strategies via Workbox:

### A. App Shell (Static Assets)
*   **Strategy:** `CacheFirst` (Implicit via precache)
*   **Files:** `index.html`, `main.tsx`, CSS files, Logos, Icons.
*   **Behavior:** The browser checks the cache first. If found, it serves the file immediately without hitting the network. This ensures the UI always loads instantly.
*   **Updates:** When you deploy a new version, the Service Worker detects the change, downloads the new files in the background, and prompts the user (or auto-updates) to skip waiting.

### B. API Data (Dynamic Content)
*   **Strategy:** `NetworkFirst` (configured in `vite.config.ts`)
*   **Route:** `^/api/.*` (All backend API requests)
*   **Behavior:**
    1.  **Online:** The app tries to fetch fresh data from the server. If successful, it updates the cache with the new data.
    2.  **Offline:** If the network request fails, the Service Worker retrieves the *most recent* successful response from the cache.
*   **Why this choice?** It ensures users always see the latest recipes when connected, but provides a fallback when offline. It prevents showing stale data if the user *has* a connection.

## 3. Configuration Details

The configuration is located in `frontend/vite.config.ts`.

```typescript
VitePWA({
  registerType: 'autoUpdate', // Updates SW immediately when new version is available
  includeAssets: ['logo.svg', 'PNG/*.png'], // Static assets to include
  workbox: {
    // Increase limit for high-res assets
    maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
    // Dynamic Caching Rules
    runtimeCaching: [
      {
        urlPattern: /^\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100, // Keep last 100 requests
            maxAgeSeconds: 60 * 60 * 24 // Keep for 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
})
```

## 4. How to Test Offline Mode

1.  **Build and Preview:** PWAs work best in production builds.
    ```bash
    cd frontend
    npm run build
    npm run preview
    ```
2.  **Open in Browser:** Go to `http://localhost:4173`.
3.  **Browse:** Navigate to a few pages (e.g., Home, Recipe Details) to populate the cache.
4.  **Go Offline:**
    *   Open Developer Tools (F12).
    *   Go to the **Network** tab.
    *   Change "No throttling" to **"Offline"**.
5.  **Reload:** Refresh the page. The app should load, and the recipes you visited should appear.

## 5. Troubleshooting

*   **"App not installing":** Ensure the site is served over HTTPS (or localhost). Browsers require secure contexts for PWA installation.
*   **"Old content showing":** This is normal for PWAs. The new version downloads in the background. With `registerType: 'autoUpdate'`, it should refresh automatically once the new SW is active.
*   **"Missing Assets":** Check `vite.config.ts` `includeAssets` or the `maximumFileSizeToCacheInBytes` limit if you add very large files.
