import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { repositoryUrl } from "./site.config";

export default defineConfig({
  base: "./",
  define: {
    "import.meta.env.VITE_REPOSITORY_URL": JSON.stringify(repositoryUrl),
  },
  plugins: [react()],
});
