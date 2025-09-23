import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import ViteImageOptimizer from 'vite-plugin-imagemin'
import VitePluginWebpAndPath from 'vite-plugin-webp-and-path'
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

// Function to recursively copy all files from source to destination
function copyRecursive(src: string, dest: string) {
  if (!existsSync(src)) return;

  const stat = statSync(src);
  if (stat.isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    const files = readdirSync(src);
    files.forEach(file => {
      copyRecursive(join(src, file), join(dest, file));
    });
  } else {
    copyFileSync(src, dest);
  }
}

export default defineConfig({
  plugins: [
    // Custom plugin to copy data and images directories
    {
      name: 'copy-assets',
      writeBundle() {
        // Copy data directory
        const srcDataDir = resolve(__dirname, 'src/data')
        const buildDataDir = resolve(__dirname, 'build/data')

        if (existsSync(srcDataDir)) {
          mkdirSync(buildDataDir, { recursive: true })
          copyFileSync(
            resolve(srcDataDir, 'restaurants.json'),
            resolve(buildDataDir, 'restaurants.json')
          )
          console.log('✅ Data files copied to build directory')
        }

        // Copy images directory for dynamic loading (without hashes)
        const srcImagesDir = resolve(__dirname, 'src/images')
        const buildImagesDir = resolve(__dirname, 'build/assets/images')

        if (existsSync(srcImagesDir)) {
          copyRecursive(srcImagesDir, buildImagesDir)
          console.log('✅ Images copied to build directory for dynamic loading')
        }
      }
    },
    tailwindcss(),
    ViteImageOptimizer({
      // Image optimization settings
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      mozjpeg: {
        quality: 90
      },
      pngquant: {
        quality: [0.8, 0.95],
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
      targetDir: './build/',
      imgExtensions: 'jpg,png,jpeg',
      textExtensions: 'html,css',
      quality: 95,
      enableLogs: true,
    })
  ],
  server: {
    port: 3000,
    open: true, // Automatically open browser
    host: true, // Allow external access
    watch: {
      usePolling: true, // Better for some file systems
    },
    allowedHosts: ["devserver-main--indianrestaurantweeksf.netlify.app"]
  },
  build: {
    outDir: 'build',
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
    target: 'es2020',
    // Copy public assets and data files
    copyPublicDir: true
  },
  // Image optimization
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
  // Optimize dependencies
  optimizeDeps: {
    include: []
  }
})
