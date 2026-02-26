import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/languages-computation-visualizer/' : '/',
  plugins: [vue(), tailwindcss()],
}))