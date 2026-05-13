import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Allan-PG---Captura-Leads---Insta/',
  plugins: [react()],
  server: { host: true, port: 5173 }
});
