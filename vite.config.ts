import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ⚙️ Caminho base para o GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: "/Ficha-5/",
  build: {
    outDir: "dist",
  },
});
