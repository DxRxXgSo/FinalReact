import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ✅ Añadimos la base para asegurar que los assets se busquen siempre desde la raíz
  base: '/', 
})