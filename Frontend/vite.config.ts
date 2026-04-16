import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'; // Required for path resolution
import path from 'path'; // Required for path resolution

// Define the root directory helper function
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  // Explicitly configure path aliases for Vite's module resolution
  // This resolves the "Cannot find module '@/lib/utils'" error during runtime
  resolve: {
    alias: {
      // Maps the '@/...' import path to the absolute path of the './src' directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})