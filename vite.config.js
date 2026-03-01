import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Google Identity Services (GSI) opens a popup at accounts.google.com which
    // sets COOP: same-origin on its own pages. Without the header below, the
    // browser warns that postMessage from the popup to our page would be blocked.
    // "same-origin-allow-popups" lets popups WE opened send messages back to us.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
