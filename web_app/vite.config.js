import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [solid(), viteSingleFile()],
  build: {
    // Ensure worker files are properly processed
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    // Make sure pdfjs-dist is included in dependencies
    include: ['pdfjs-dist']
  }
})