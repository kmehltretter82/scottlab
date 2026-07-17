import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { repositoryUrl } from "./site.config";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        embed: fileURLToPath(new URL("embed.html", import.meta.url)),
      },
    },
  },
  define: {
    "import.meta.env.VITE_REPOSITORY_URL": JSON.stringify(repositoryUrl),
  },
  plugins: [react()],
});
