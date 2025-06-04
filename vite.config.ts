import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths'; // Import the plugin

export default defineConfig({
  plugins: [react(), tsconfigPaths()], // Add the plugin to the array
  server: {
    port: 5173,
    strictPort: true
  },
  base: '/',
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      external: ['cloudflare:sockets'],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js', '@supabase/auth-ui-react'],
          'lucide-vendor': ['lucide-react']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});
