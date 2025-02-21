import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 指定构建输出目录为后端项目根目录下的 dist
    outDir: '../dist',
    // 构建前清空目标目录
    emptyOutDir: true,
    // 配置资源文件路径
    assetsDir: 'assets',
    // 配置 base URL
    base: '/static/',
  },
  server: {
    proxy: {
      // 开发环境代理配置
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 开发环境静态资源代理
      '/static': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/assets': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
}) 