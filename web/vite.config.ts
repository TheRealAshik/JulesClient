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
      react(),
      nodePolyfills({
        include: ['path', 'os', 'crypto', 'buffer', 'events', 'util', 'stream', 'vm'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        }
      }),
      {
         name: 'mock-sdk-fs',
         enforce: 'pre',
         resolveId(id) {
           if (id === 'node:fs' || id === 'fs' || id === 'node:fs/promises' || id === 'fs/promises') {
              return '\0mock-sdk-fs';
           }
           if (id === 'node:timers/promises') {
              return '\0mock-sdk-timers';
           }
           if (id === 'readline' || id === 'node:readline') {
              return '\0mock-sdk-readline';
           }
         },
         load(id) {
           if (id === '\0mock-sdk-fs') {
              return `
                export const writeFile = () => {};
                export const readFile = () => {};
                export const rm = () => {};
                export const access = () => {};
                export const accessSync = () => {};
                export const existsSync = () => {};
                export const createReadStream = () => {};
                export const createWriteStream = () => {};
                export const readdir = () => {};
                export const mkdir = () => {};
                export const stat = () => {};
                export const open = () => {};
                export const appendFile = () => {};
                export const constants = {};
                export default {
                  writeFile, readFile, rm, access, accessSync, existsSync, createReadStream, createWriteStream,
                  readdir, mkdir, stat, open, appendFile, constants
                };
              `;
           }
           if (id === '\0mock-sdk-timers') {
              return `
                 export const setTimeout = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));
                 export default { setTimeout };
              `;
           }
           if (id === '\0mock-sdk-readline') {
              return `
                 export const createInterface = () => ({
                    [Symbol.asyncIterator]: async function* () {}
                 });
                 export default { createInterface };
              `;
           }
         }
      },
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
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
