import { runMigrations } from "@labs/db-kit";

import { env } from "../env.ts";

/**
 * Chamado por `pnpm dev http-only-login` antes de subir o servidor.
 * Sem migrations geradas ainda, não faz nada — e tudo bem.
 */
await runMigrations(env.DATABASE_URL, "./drizzle");
console.log("migrations aplicadas");
