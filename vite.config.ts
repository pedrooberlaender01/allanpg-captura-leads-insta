import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/allanpg-captura-leads-insta/',
  plugins: [react()],
  server: { host: true, port: 5173 }
});
