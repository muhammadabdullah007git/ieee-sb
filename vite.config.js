import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/ieee-baust-sb/', // Replace with your GitHub repo name
  plugins: [
    react({
      // Enable Fast Refresh for better DX
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    }),
    tailwindcss()
  ],
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Use esbuild for faster minification
    minify: 'esbuild',
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Firebase services
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // UI libraries
          'vendor-ui': ['framer-motion', 'lucide-react'],
          // Markdown and syntax highlighting
          'vendor-markdown': ['react-markdown', 'rehype-highlight', 'rehype-katex', 'remark-gfm', 'remark-math'],
          // Charts
          'vendor-charts': ['recharts'],
          // PDF generation (only loaded when needed)
          'vendor-pdf': ['jspdf', 'html2canvas'],
          // Date utilities
          'vendor-date': ['date-fns'],
        },
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            extType = 'images';
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional, remove if not needed)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Optimize dependencies
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
    exclude: ['jspdf', 'html2canvas'], // Exclude heavy PDF libs from pre-bundling
  },
  // Server configuration for development
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
  },
})
