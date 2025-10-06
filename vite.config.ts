import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import ViteImageOptimizer from 'vite-plugin-imagemin'
import VitePluginWebpAndPath from 'vite-plugin-webp-and-path'
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, readFileSync, writeFileSync, unlinkSync } from 'fs'
import { resolve, join, extname, basename, dirname } from 'path'
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminSvgo from 'imagemin-svgo'
import imageminWebp from 'imagemin-webp'

// Function to optimize and copy images (convert PNG/JPG to WebP, optimize SVG)
async function optimizeAndCopyImage(src: string, dest: string) {
  const ext = extname(src).toLowerCase();

  // Skip WebP files (already optimized) and non-image files
  if (ext === '.webp' || !/\.(png|jpe?g|svg)$/i.test(src)) {
    copyFileSync(src, dest);
    return;
  }

  try {
    // For PNG and JPG files, convert to WebP
    if (/\.(png|jpe?g)$/i.test(src)) {
      const webpDest = dest.replace(/\.(png|jpe?g)$/i, '.webp');

      const optimizedFiles = await imagemin([src], {
        destination: dirname(webpDest),
        plugins: [
          imageminWebp({ quality: 85 })
        ]
      });

      if (optimizedFiles.length > 0) {
        const optimizedFile = optimizedFiles[0];
        if (optimizedFile.destinationPath && optimizedFile.destinationPath !== webpDest) {
          copyFileSync(optimizedFile.destinationPath, webpDest);
        }
      }
    }
    // For SVG files, just optimize without converting
    else if (ext === '.svg') {
      const optimizedFiles = await imagemin([src], {
        destination: dirname(dest),
        plugins: [
          imageminSvgo({
            plugins: [
              { name: 'removeViewBox', active: false },
              { name: 'removeEmptyAttrs', active: false }
            ]
          })
        ]
      });

      if (optimizedFiles.length > 0) {
        const optimizedFile = optimizedFiles[0];
        if (optimizedFile.destinationPath && optimizedFile.destinationPath !== dest) {
          copyFileSync(optimizedFile.destinationPath, dest);
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to optimize ${src}, copying as-is:`, error);
    copyFileSync(src, dest);
  }
}

// Function to recursively copy and optimize files from source to destination
async function copyRecursiveWithOptimization(src: string, dest: string) {
  if (!existsSync(src)) return;

  const stat = statSync(src);
  if (stat.isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    const files = readdirSync(src);
    for (const file of files) {
      await copyRecursiveWithOptimization(join(src, file), join(dest, file));
    }
  } else {
    await optimizeAndCopyImage(src, dest);
  }
}

// Function to update HTML and CSS files to use WebP paths in build
async function updateFilePaths() {
  const buildHtmlPath = resolve(__dirname, 'build/index.html');

  // Update HTML file
  if (existsSync(buildHtmlPath)) {
    let htmlContent = readFileSync(buildHtmlPath, 'utf-8');

    // Replace PNG references with WebP (no hashing)
    htmlContent = htmlContent
      .replace(/\/assets\/images\/global\/candles\.png/g, '/assets/images/global/candles.webp')
      .replace(/\/assets\/images\/global\/courses\.png/g, '/assets/images/global/courses.webp')
      .replace(/\/assets\/images\/global\/page-texture\.png/g, '/assets/images/global/page-texture.webp');

    writeFileSync(buildHtmlPath, htmlContent);
  }

  // Update CSS file (find the actual CSS file with hash)
  const buildAssetsDir = resolve(__dirname, 'build/assets');
  if (existsSync(buildAssetsDir)) {
    const cssFiles = readdirSync(buildAssetsDir).filter(file => file.endsWith('.css'));
    for (const cssFile of cssFiles) {
      const cssPath = join(buildAssetsDir, cssFile);
      let cssContent = readFileSync(cssPath, 'utf-8');

      // Replace PNG references with WebP in CSS
      cssContent = cssContent
        .replace(/\/assets\/images\/global\/page-texture\.png/g, '/assets/images/global/page-texture.webp');

      writeFileSync(cssPath, cssContent);
    }
  }
}

// Function to remove PNG files since we have WebP versions
async function removePngFiles() {
  const globalDestDir = resolve(__dirname, 'build/assets/images/global');

  if (existsSync(globalDestDir)) {
    const files = readdirSync(globalDestDir);

    for (const file of files) {
      // Remove PNG files that have WebP equivalents
      if (file.match(/^(candles|courses|page-texture)\.png$/)) {
        const pngPath = join(globalDestDir, file);
        const webpPath = join(globalDestDir, file.replace(/\.png$/, '.webp'));

        // Only remove PNG if WebP exists
        if (existsSync(webpPath)) {
          try {
            unlinkSync(pngPath);
            console.log(`Removed duplicate PNG file: ${file}`);
          } catch (error) {
            console.warn(`Failed to remove ${file}:`, error);
          }
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [
    // Custom plugin to copy data and images directories
    {
      name: 'copy-assets',
      async writeBundle() {
        // Copy data directory
        const srcDataDir = resolve(__dirname, 'src/data')
        const buildDataDir = resolve(__dirname, 'build/data')

        if (existsSync(srcDataDir)) {
          mkdirSync(buildDataDir, { recursive: true })
          copyFileSync(
            resolve(srcDataDir, 'restaurants.json'),
            resolve(buildDataDir, 'restaurants.json')
          )
        }

        // Copy images directory for dynamic loading (without hashes)
        const srcImagesDir = resolve(__dirname, 'src/images')

        if (existsSync(srcImagesDir)) {
          // Only copy chef and ui images for dynamic loading
          // Global images are processed by Vite's asset pipeline with hashes
          const chefsSrcDir = resolve(srcImagesDir, 'chefs')
          const uiSrcDir = resolve(srcImagesDir, 'ui')
          const chefsDestDir = resolve(__dirname, 'build/assets/images/chefs')
          const uiDestDir = resolve(__dirname, 'build/assets/images/ui')

          if (existsSync(chefsSrcDir)) {
            await copyRecursiveWithOptimization(chefsSrcDir, chefsDestDir)
          }
          if (existsSync(uiSrcDir)) {
            await copyRecursiveWithOptimization(uiSrcDir, uiDestDir)
          }

          // Process global images: convert PNG/JPG to WebP, optimize SVG
          const globalSrcDir = resolve(srcImagesDir, 'global')
          const globalDestDir = resolve(__dirname, 'build/assets/images/global')

          if (existsSync(globalSrcDir)) {
            const files = readdirSync(globalSrcDir)
            for (const file of files) {
              const srcFile = join(globalSrcDir, file)
              const destFile = join(globalDestDir, file)

              // Only process PNG, JPG, and SVG files (skip existing WebP files)
              if (/\.(png|jpe?g|svg)$/i.test(file)) {
                await optimizeAndCopyImage(srcFile, destFile)
              } else if (file.endsWith('.webp')) {
                // Copy existing WebP files as-is
                copyFileSync(srcFile, destFile)
              }
            }
          }

          // Update HTML and CSS files to use WebP paths
          await updateFilePaths()

          // Remove the PNG files since we have WebP versions
          await removePngFiles()
        }
      }
    },
    tailwindcss(),
    // ViteImageOptimizer disabled - we handle image optimization in custom plugin
    // ViteImageOptimizer({
    //   // Image optimization settings
    //   gifsicle: {
    //     optimizationLevel: 7,
    //     interlaced: false
    //   },
    //   mozjpeg: {
    //     quality: 90
    //   },
    //   pngquant: {
    //     quality: [0.8, 0.95],
    //     speed: 4
    //   },
    //   webp: {
    //     quality: 85
    //   },
    //   svgo: {
    //     plugins: [
    //       {
    //         name: 'removeViewBox',
    //         active: false
    //       },
    //       {
    //         name: 'removeEmptyAttrs',
    //         active: false
    //       }
    //     ]
    //   }
    // }),
    // VitePluginWebpAndPath removed - we use pre-optimized WebP files instead
  ],
  server: {
    port: 3000,
    open: true, // Automatically open browser
    host: true, // Allow external access
    watch: {
      usePolling: true, // Better for some file systems
    },
    allowedHosts: ["devserver-main--indianrestaurantweeksf.netlify.app"],
    historyApiFallback: true // Enable client-side routing
  },
  build: {
    outDir: 'build',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Optimize chunk splitting
        manualChunks: {
          vendor: []
        },
        // Custom asset file names - no hashing for images
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && /\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
            return `assets/images/global/[name][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // Custom chunk file names for JS files
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
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
  // Image optimization - exclude global images (handled by custom plugin)
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
  assetsExclude: ['src/images/global/**/*.png', 'src/images/global/**/*.jpg', 'src/images/global/**/*.jpeg'],
  // Optimize dependencies
  optimizeDeps: {
    include: []
  }
})
