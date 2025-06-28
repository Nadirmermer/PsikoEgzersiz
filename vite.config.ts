import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '/' : './',
  server: {
    host: "::",
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          'chart-vendor': ['recharts'],
          'audio-vendor': ['@tanstack/react-query'],
          'game-engines': [
            './src/components/GameEngine/UniversalGameEngine.tsx',
            './src/components/GameEngine/GameScreens.tsx'
          ],
          // Split game pages for lazy loading
          'memory-games': [
            './src/pages/HafizaOyunuSayfasi.tsx',
            './src/hooks/useMemoryGame.ts',
            './src/utils/memoryGameUtils.ts'
          ],
          'sequence-games': [
            './src/pages/SayiDizisiTakibiSayfasi.tsx',
            './src/pages/RenkDizisiTakibiSayfasi.tsx',
            './src/hooks/useNumberSequence.ts',
            './src/hooks/useColorSequence.ts'
          ],
          'matching-games': [
            './src/pages/KelimeResimEslestirmeSayfasi.tsx',
            './src/pages/ResimKelimeEslestirmeSayfasi.tsx',
            './src/hooks/useImageWordMatching.ts',
            './src/hooks/useWordImageMatching.ts'
          ],
          'tower-games': [
            './src/pages/HanoiKuleleriSayfasi.tsx',
            './src/pages/LondraKulesiSayfasi.tsx',
            './src/hooks/useHanoiTowers.ts',
            './src/hooks/useTowerOfLondon.ts'
          ],
          'logic-games': [
            './src/pages/MantikDizileriSayfasi.tsx',
            './src/hooks/useLogicSequences.ts'
          ],
          'dashboard': [
            './src/pages/UzmanDashboardSayfasi.tsx',
            './src/components/dashboard/ClientDetail.tsx',
            './src/components/dashboard/ClientList.tsx'
          ]
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.\w+$/, '')
            : 'chunk'
          return `js/${facadeModuleId}-[hash].js`
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `img/[name]-[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
            return `fonts/[name]-[hash][extname]`
          }
          if (/mp3|wav|ogg|m4a/i.test(ext || '')) {
            return `audio/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      }
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'recharts'
    ],
    exclude: ['@capacitor/core', '@capacitor/android', '@capacitor/ios']
  },
  plugins: [
    react({
      // Enable Fast Refresh
      plugins: [["@swc/plugin-styled-jsx", {}]],
    }),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png', 'placeholder.svg'],
      manifest: {
        name: 'PsikoEgzersiz',
        short_name: 'PsikoEgzersiz',
        description: 'Bilişsel egzersiz ve ruh sağlığı uygulaması',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallbackDenylist: [/^chrome-extension:\/\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              },
              backgroundSync: {
                name: 'supabase-queue',
                options: {
                  maxRetentionTime: 24 * 60 // 24 hours
                }
              }
            }
          }
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Enable React DevTools in development
    __DEV__: mode === 'development',
  },
  esbuild: {
    // Remove console.log in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  }
}));
