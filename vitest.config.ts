import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      // Enforce strong coverage on the pure business-logic modules. The AI
      // provider paths in intake.ts need network mocking (integration tests,
      // deferred), its safety-critical fallback is unit-tested separately.
      include: ["src/lib/validation.ts", "src/lib/admin.ts", "src/lib/format.ts"],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
