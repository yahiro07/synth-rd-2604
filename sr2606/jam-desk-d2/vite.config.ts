import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        "iframe-osc": "units/osc/index.html",
      },
    },
  },
  resolve: {
    preserveSymlinks: true,
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  server: { port: 3004 },
});
