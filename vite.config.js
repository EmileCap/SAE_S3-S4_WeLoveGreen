import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { templateCompilerOptions } from '@tresjs/core'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    // "@/components/…" = "src/components/…" (le même alias est déclaré dans jsconfig.json pour l'éditeur)
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    vue({...templateCompilerOptions}),
    vueDevTools(),
  ],
})
