/** @type {import('tailwindcss').Config} */

// vite.config.js
export default defineConfig({
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
      cors: {
        origin: 'http://localhost:3000',
        credentials: true,
      },
    },
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  });
  