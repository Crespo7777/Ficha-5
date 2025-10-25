import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuração obrigatória para GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: "/Ficha-5/",
  build: {
    outDir: "dist",
  },
});
