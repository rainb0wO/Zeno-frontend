import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      // 使用 browserslist 配置，支持更广泛的浏览器
      targets: [
        '> 0.5%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'iOS >= 12',
        'Safari >= 12',
        'Chrome >= 80',
        'Edge >= 80',
        'Android >= 8',
        'Samsung >= 10',
        'not IE 11',
        'not op_mini all',
      ],
      // 启用现代 polyfills
      modernPolyfills: true,
      // 为旧浏览器生成单独的 chunk
      renderLegacyChunks: true,
      // 额外的 polyfills（legacy 插件会自动处理 regenerator-runtime）
      // additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      // 渲染现代和传统 chunks
      renderModernChunks: true,
    }),
  ],
  build: {
    // 使用 ES2015 作为目标，兼容更多浏览器
    target: 'es2015',
    // CSS 目标设置为 Chrome 80，确保 CSS 兼容性
    cssTarget: 'chrome80',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        // 兼容旧浏览器
        ecma: 2015,
      },
      format: {
        ecma: 2015,
      },
    },
    rollupOptions: {
      output: {
        // 代码分割优化
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'antd-vendor': ['antd'],
          'router-vendor': ['react-router-dom'],
        },
        // 确保文件名兼容性
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 增加 chunk 大小警告限制（因为 legacy 会生成更多文件）
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
