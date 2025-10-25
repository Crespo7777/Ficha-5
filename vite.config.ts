import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ⚠️ IMPORTANTE: base deve apontar pro nome do repositório no GitHub
export default defineConfig({
  plugins: [react()],
  base: "/Ficha-5/",
});
