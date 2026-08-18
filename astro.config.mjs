import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Preserve Astro 5/6 HTML-aware whitespace (v7 default is JSX-style stripping)
  compressHTML: true,
  integrations: [],
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
      sourcemap: true,
      minify: 'terser',
      target: 'es2020',
    },
    // Astro 6+ scopes client bundling to the Vite client environment
    environments: {
      client: {
        build: {
          minify: 'terser',
          rolldownOptions: {
            output: {
              codeSplitting: {
                groups: [
                  { name: 'vendor-gsap', test: /[\\/]node_modules[\\/]gsap(?:[\\/]|$)/ },
                  { name: 'vendor-swiper', test: /[\\/]node_modules[\\/]swiper(?:[\\/]|$)/ },
                  { name: 'vendor-mapbox', test: /[\\/]node_modules[\\/]mapbox-gl(?:[\\/]|$)/ },
                ],
              },
            },
          },
        },
      },
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

