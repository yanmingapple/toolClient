import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: ['electron'],
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      'zustand',
      '@monaco-editor/react'
    ],
  },
  define: {
    '__dirname': JSON.stringify(path.resolve(__dirname)),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
})