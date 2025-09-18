import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import ViteImageOptimizer from 'vite-plugin-imagemin'
import VitePluginWebpAndPath from 'vite-plugin-webp-and-path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    ViteImageOptimizer({
      // Image optimization settings
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      mozjpeg: {
        quality: 80
      },
      pngquant: {
        quality: [0.65, 0.8],
        speed: 4
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    }),
    VitePluginWebpAndPath({
      targetDir: './dist/',
      imgExtensions: 'jpg,png,jpeg',
      textExtensions: 'html,css',
      quality: 80,
      enableLogs: true,
    })
  ],
  server: {
    port: 3000,
    open: true, // Automatically open browser
    host: true, // Allow external access
    watch: {
      usePolling: true, // Better for some file systems
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Optimize chunk splitting
        manualChunks: {
          vendor: []
        }
      }
    },
    // Enable source maps for debugging
    sourcemap: true,
    // Minify CSS and JS
    minify: 'terser',
    // Optimize dependencies
    target: 'es2020'
  },
  // Image optimization
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
  // Optimize dependencies
  optimizeDeps: {
    include: []
  }
})
