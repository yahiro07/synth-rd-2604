import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (process.env.BUILD_LIB !== "true") {
    return {
      plugins: [react(), tailwindcss()],
      resolve: {
        tsconfigPaths: true,
      },
      server: {
        port: 3000,
      },
    };
  }
  return {
    plugins: [tailwindcss()],
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        formats: ["es"],
        fileName: "index",
        cssFileName: "style",
      },
      rollupOptions: {
        external: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
        ],
      },
    },
  };
});
