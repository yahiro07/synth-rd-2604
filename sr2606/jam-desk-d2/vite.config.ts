import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: "mpa",
  resolve: {
    preserveSymlinks: true,
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  server: { port: 3004 },
});
