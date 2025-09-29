import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path, { resolve } from "path";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(() => {
  const result = {
    plugins: [react(), tailwindcss()],
    appType: "mpa",
    root: resolve(__dirname, "src"),
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/index.html"),
          settings: resolve(__dirname, "src/settings.html"),
        },
      },
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent Vite from obscuring rust errors
    clearScreen: false,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: "ws",
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        // 3. tell Vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
    },
  } satisfies import("vite").UserConfig;
  return result;
});
