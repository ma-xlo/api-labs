import { runMigrations } from "@labs/db-kit";

import { env } from "../env.ts";

await runMigrations(env.DATABASE_URL, "./drizzle");
console.log("migrations aplicadas");
