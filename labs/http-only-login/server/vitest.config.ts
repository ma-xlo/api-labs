import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // forks dá isolamento real de processo por arquivo — o que torna seguro
    // um database descartável por arquivo de teste (ver @labs/test-kit).
    include: ["tests/**/*.test.ts"],
    pool: "forks",
    testTimeout: 20_000,
  },
});
