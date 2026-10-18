import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { SERVICE_IDS } from './src/data/services'

const serviceInputs = Object.fromEntries(
  SERVICE_IDS.map((id) => [id, resolve(__dirname, `services/${id}.html`)]),
)

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...serviceInputs,
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
