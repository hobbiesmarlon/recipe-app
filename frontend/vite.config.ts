import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', 'PNG/*.png'],
      manifest: {
        name: 'Recipefy',
        short_name: 'Recipefy',
        description: 'Discover and share recipes',
        theme_color: '#f48525',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/PNG/192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/PNG/512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            // 1. API Caching (Recipes, Users, Auth)
            urlPattern: ({ url }) => {
              const isApiDomain = url.hostname === 'api.recipefy.co.ke' || 
                                 url.hostname === 'localhost' || 
                                 url.port === '8000';
              const isApiPath = url.pathname.startsWith('/recipes') || 
                               url.pathname.startsWith('/users') || 
                               url.pathname.startsWith('/auth');
              return isApiDomain && isApiPath;
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // 2. Media Caching (S3/CDN Images & Videos)
            urlPattern: ({ url }) => {
              const isMediaDomain = url.hostname === 'recipeapp-public-bucket.s3.af-south-1.amazonaws.com';
              const isMediaExt = url.pathname.match(/\.(?:png|jpg|jpeg|svg|gif|webp|mp4|webm)$/i);
              return isMediaDomain || isMediaExt;
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
