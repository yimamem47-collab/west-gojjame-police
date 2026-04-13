import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        // እዚህ ጋር ያሉ ፋይሎች በ public/ ፎልደር ውስጥ መኖራቸውን እርግጠኛ ሁን
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'police-logo.png'],
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
              // አድራሻውን ወደ ፋይሉ ስም ብቻ ቀይረነዋል
              src: 'police-logo.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'police-logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
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
