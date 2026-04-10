import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true
        },
        manifest: {
          name: 'Police Management System',
          short_name: 'PoliceApp',
          description: 'Advanced Police Management and Reporting System',
          theme_color: '#002B5B',
          icons: [
            {
              src: 'https://img.icons8.com/color/192/police-badge.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://img.icons8.com/color/512/police-badge.png',
              sizes: '512x512',
              type: 'image/png'
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
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      headers: {
        'Permissions-Policy': 'camera=*, microphone=(), geolocation=()'
      }
    },
    build: {
      chunkSizeWarningLimit: 2000
    }
  };
});
