import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  //利用vite解决跨域问题
  server: {
    //代理请求
    proxy: {
      // 前端想去后端请求 /api 开始
      '/api': {
        // 跨域，在浏览器环境下，同源策略的安全性
        target: 'http://localhost:3000',
        secure: false,
        // /api/stream 
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
