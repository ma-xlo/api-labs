import { defineConfig } from "vitest/config";

// Um `pnpm test` roda tudo. `pnpm --filter @lab/<x>-server test` roda um só.
export default defineConfig({
  test: {
    projects: ["packages/*", "labs/*/server", "labs/*/client"],
  },
});
