import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4000,  // Chọn cổng không trùng lặp (ví dụ cổng 4000)
  }
})
