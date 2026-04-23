import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ✅ Añadimos la base para producción
  base: '/',
  server: {
    proxy: {
      // ✅ Esto redirige las peticiones de localhost:5173/api a localhost:4000/api
      // Así el login funcionará en tu computadora sin cambiar nada en el código
      '/api': {
        target: 'http://localhost:4000', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
})