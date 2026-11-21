import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["server/**/*.test.ts", "scripts/**/*.test.ts", "extension/**/*.test.ts"],
    // `npm run test:coverage`. Denominator: all non-test TypeScript in server, shared and extension/src.
    coverage: {
      provider: "v8",
      include: ["server/**/*.ts", "shared/**/*.ts", "extension/src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/fixtures/**", "server/features/**"],
      reporter: ["text", "json-summary", "html"],
    },
  },
});
