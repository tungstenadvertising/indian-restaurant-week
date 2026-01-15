import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  integrations: [netlify()],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      port: 3000,
      host: true,
      open: true,
      watch: {
        usePolling: true,
      },
      allowedHosts: ["devserver-main--indianrestaurantweeksf.netlify.app"],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-gsap': ['gsap'],
            'vendor-swiper': ['swiper'],
            'vendor-mapbox': ['mapbox-gl']
          },
        },
      },
      sourcemap: true,
      minify: 'terser',
      target: 'es2020',
    },
    optimizeDeps: {
      include: []
    }
  },
  // Configure redirects for popup URLs
  redirects: {
    // These will be handled by client-side routing, but we need to ensure
    // they fall back to index.html for static hosting
  }
});

