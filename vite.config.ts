import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { Buffer } from 'buffer'

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  plugins: [
    react(),
    {
      name: 'inject-buffer',
      config() {
        if (typeof globalThis.Buffer === 'undefined') {
          globalThis.Buffer = Buffer;
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
      process: 'process/browser',
      // React 19 has useSyncExternalStore built-in, redirect shim imports to React
      'use-sync-external-store/shim': path.resolve(__dirname, './src/shims/use-sync-external-store.ts'),
      'use-sync-external-store': path.resolve(__dirname, './src/shims/use-sync-external-store.ts'),
    },
  },
  define: {
    global: 'globalThis',
    'global.Buffer': 'globalThis.Buffer',
    'global.process': 'globalThis.process',
    process: 'globalThis.process',
    'process.env': {},
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    // Force include all CommonJS dependencies from @solana/web3.js for proper conversion
    include: [
      '@solana/buffer-layout',
      '@solana/buffer-layout-utils',
      'bs58',
      'base-x',
      'borsh',
      'rpc-websockets',
      'bigint-buffer',
      'node-fetch',
      'bn.js',
      'jayson/lib/client/browser',
      'eventemitter3',
      'process',
    ],
    // Exclude @solana v1.0 packages from pre-bundling
    exclude: [
      '@solana/spl-token',
      '@solana/spl-token-metadata',
      '@solana/web3.js',
      '@solana/client',
      '@solana/react-hooks',
      '@solana/wallet-standard',
      'use-sync-external-store',
      'valtio',
      '@keystonehq/sdk',
      '@keystonehq/sol-keyring',
      '@solana-program/system',
      'zustand',
    ],
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis',
      },
    },
  },
})
