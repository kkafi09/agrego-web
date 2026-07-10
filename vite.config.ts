import { defineConfig } from "vite";
import path from "node:path";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
      },
      manifest: {
        id: "/",
        start_url: "/",
        scope: "/",
        lang: "id",
        name: "Agrego",
        short_name: "Agrego",
        description: "Agrego - Platform Digital Koperasi",
        theme_color: "#0B2F15",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        categories: ["finance", "business"],
        icons: [
          {
            src: "/brand/agrego-brand-mark.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/brand/agrego-brand-mark.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/brand/agrego-brand-mark.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor-react";
            }
            if (id.includes("convex")) {
              return "vendor-convex";
            }
            if (id.includes("lucide-react") || id.includes("radix-ui") || id.includes("@radix-ui")) {
              return "vendor-ui";
            }
            return "vendor";
          }
        },
      },
    },
  },
});
