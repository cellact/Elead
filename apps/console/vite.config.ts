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
  server: {
    port: 5174,
    strictPort: true,
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
