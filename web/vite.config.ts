import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'os', 'crypto', 'buffer', 'stream', 'util', 'events', 'vm'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          name: 'Jules Client',
          short_name: 'Jules',
          description: 'A futuristic client for Jules',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: 'index.html'
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: [
        { find: 'fs/promises', replacement: path.resolve(__dirname, 'mocks/fs-promises.ts') },
        { find: 'node:fs/promises', replacement: path.resolve(__dirname, 'mocks/fs-promises.ts') },
        { find: 'node:timers/promises', replacement: path.resolve(__dirname, 'mocks/timers-promises.ts') },
        { find: 'fs', replacement: path.resolve(__dirname, 'mocks/fs-promises.ts') },
        { find: 'node:fs', replacement: path.resolve(__dirname, 'mocks/fs-promises.ts') },
        { find: 'readline', replacement: path.resolve(__dirname, 'mocks/readline.ts') },
        { find: 'node:readline', replacement: path.resolve(__dirname, 'mocks/readline.ts') },
        { find: '@', replacement: path.resolve(__dirname, '.') },
      ]
    }
  };
});
