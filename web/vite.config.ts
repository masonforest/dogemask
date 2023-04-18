import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // generate manifest.json in outDir
    manifest: true,
    rollupOptions: {
      // overwrite default .html entry
      input: 'main.js',
    },
  },
  server: {
    origin: 'http://localhost:5173',
  },
  root: '.',
  plugins: [preact()],
})
