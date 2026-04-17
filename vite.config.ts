import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // NOTE: Keep this as your actual repository name
  base: '/noise-monitor/', 
  plugins: [react()]
});
