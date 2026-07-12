import { defineConfig } from "vitest/config";

import { repositoryUrl } from "./site.config";

export default defineConfig({
  define: {
    "import.meta.env.VITE_REPOSITORY_URL": JSON.stringify(repositoryUrl),
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
