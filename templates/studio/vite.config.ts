// ABOUTME: Vite config for the studio app — React + Tailwind v4 plugins, nothing else.
// ABOUTME: The Remotion side does NOT use Vite; it bundles via remotion.config.ts (webpack).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
