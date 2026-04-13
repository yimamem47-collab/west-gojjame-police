import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    // ቪርሴል ላይ ፋይሎቹ በትክክል እንዲገኙ base መጨመር አስፈላጊ ነው
    base: '/', 
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        // Removed police-logo.png to prevent 404s as we use external URL
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        workbox: {
          maximumFileSizeToCacheInBytes: 5000000,
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        manifest: {
          name: 'West Gojjam Police Management System',
          short_name: 'WG Police',
          description: 'Official Management System for West Gojjam Zone Police',
          theme_color: '#002B5B',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              // እዚህ ጋር የፖሊስ አርማውን ስም በትክክል ተጠቅመናል
              src: 'https://lh3.googleusercontent.com/d/1l4YxTKjFHV39B59KAntO0SyuZbu0UdOr',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'https://lh3.googleusercontent.com/d/1l4YxTKjFHV39B59KAntO0SyuZbu0UdOr',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      // ለ AI ስራ አስፈላጊ የሆኑ ቁልፎች
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'global': 'window',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 3000,
      outDir: 'dist'
    }
  };
});