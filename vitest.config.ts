import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir),
    },
  },
  test: {
    environment: "jsdom",
    include: [
      "components/__tests__/**/*.test.{ts,tsx}",
      "tests/**/*.test.{ts,tsx}",
    ],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
