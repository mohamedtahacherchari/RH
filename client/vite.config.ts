import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige toutes les requêtes commençant par /api vers http://localhost:5000
      '/api': {
        target: 'http://localhost:7000', // URL de votre backend
        changeOrigin: true, // Nécessaire pour les serveurs virtuels hébergés
        rewrite: (path) => path.replace(/^\/api/, ''), // Supprime le préfixe /api
      },
    },
  },
});