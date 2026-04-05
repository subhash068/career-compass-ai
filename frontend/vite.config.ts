import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const backendTarget =
    process.env.VITE_API_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";

  return {
    server: {
      host: "0.0.0.0",
      port: 5000,
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          // Frontend uses baseURL "/api"; strip it when proxying to backend.
          // Examples:
          // - /api/auth/login -> /auth/login
          // - /api/api/notes -> /api/notes
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
      allowedHosts: true,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            ui: [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-select",
            ],
            charts: ["recharts"],
            router: ["react-router-dom"],
          },
        },
      },
    },
  };
});
