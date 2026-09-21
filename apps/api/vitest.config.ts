import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["tests/globalSetup.ts"],
    setupFiles: ["tests/setup.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 60000
  }
});
