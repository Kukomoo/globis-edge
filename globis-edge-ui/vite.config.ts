import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  // Serve from /app when deployed on Pi 5 hotspot.
  // Assets resolve correctly whether accessed at /app or / (dev).
  base: '/app/',
})
