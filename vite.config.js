import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { securityHeaders, securityHeadersPlugin } from './security-headers.js'

export default defineConfig({
  plugins: [react(), securityHeadersPlugin()],
  // dev server answers only this machine
  server: { host: 'localhost' },
  // `npm run preview` serves the production build with the same headers as the live site
  preview: { host: 'localhost', headers: securityHeaders({ https: false }) },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap', 'lenis'],
        },
      },
    },
  },
})
