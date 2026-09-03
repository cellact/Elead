import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const appDir = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = path.join(appDir, '../..')

export default defineConfig({
  root: appDir,
  publicDir: path.join(repoRoot, 'public'),
  envDir: appDir,
  plugins: [react()],
  optimizeDeps: {
    include: [
      'ethers',
      '@ethersproject/providers',
      '@ethersproject/contracts',
      '@ethersproject/hash',
      '@ethersproject/constants',
    ],
  },
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/generateLeadQR': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/domains': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/fetchLeads': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/config': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/linkDomain': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/setLeadStatus': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/ensureSemaphore': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/generateInboxQR': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/inboxes': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/setInboxRouting': { target: 'http://127.0.0.1:8080', changeOrigin: true },
    },
  },
  preview: {
    port: 4174,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@/shared': path.join(repoRoot, 'src/shared'),
      '@': path.join(appDir, 'src'),
    },
  },
})
