import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path - change this to match your cPanel subdirectory if not deploying to root
  // For example, if deploying to yourdomain.com/ratidzo, use '/ratidzo/'
  // If deploying to root domain, use '/' (or remove this line)
  base: '/', 
});
