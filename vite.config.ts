import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    // 1. base መጨመር በጣም ወሳኝ ነው
    base: '/', 
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        // 2. እዚህ ውስጥ የሌሉ ፋይሎችን መጠየቅ build error ሊያመጣ ስለሚችል አስተካክለነዋል
        includeAssets: ['police-logo.png'], 
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
              // 3. እዚህ ጋር ስላሽ (/) አያስፈልገውም
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
      chunkSizeWarningLimit: 3000, // ገደቡን ትንሽ ከፍ አድርገነዋል
      outDir: 'dist'
    }
  };
});
