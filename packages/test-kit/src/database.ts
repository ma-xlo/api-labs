import type { AnyRelations, EmptyRelations } from "drizzle-orm";

import { createDb, createPool, dropDatabase, ensureDatabase, runMigrations } from "@labs/db-kit";
import { randomBytes } from "node:crypto";

const rand = () => randomBytes(4).toString("hex");

/**
 * Chamado UMA vez no globalSetup: cria um database migrado que serve de molde.
 *
 * Rodar as migrations é a parte cara. Fazendo isso uma vez e clonando depois,
 * cada arquivo de teste ganha um banco limpo por ~30 ms em vez de segundos.
 */
export async function createTemplateDatabase(opts: {
  adminUrl: string;
  lab: string;
  migrationsDir: string;
}): Promise<string> {
  const name = `${opts.lab}_tmpl`;
  await dropDatabase(opts.adminUrl, name);
  await ensureDatabase(opts.adminUrl, name);

  const url = new URL(opts.adminUrl);
  url.pathname = `/${name}`;
  await runMigrations(url.toString(), opts.migrationsDir);
  return name;
}

/**
 * Um database descartável POR ARQUIVO DE TESTE — que é a granularidade em que
 * o Vitest paraleliza. Clonado do template, dropado no fim.
 *
 * Por que não testcontainers: a stack do compose já está de pé porque o
 * `pnpm dev` a subiu. Reusar um Postgres quente custa ~50 ms; subir um
 * container custa 3–8 s por execução e duplica a infra que já está declarada
 * no docker-compose.yml. Testcontainers vira assunto quando você quiser CI
 * hermético — e aí é um lab próprio.
 */
export async function withTestDatabase<TRelations extends AnyRelations = EmptyRelations>(opts: {
  adminUrl: string;
  lab: string;
  relations?: TRelations;
  template: string;
}) {
  const name = `${opts.lab}_t_${rand()}`;
  await ensureDatabase(opts.adminUrl, name, { template: opts.template });

  const url = new URL(opts.adminUrl);
  url.pathname = `/${name}`;
  const pool = createPool(url.toString(), { max: 4 });
  const db = createDb(pool, opts.relations);

  return {
    async close() {
      await pool.end();
      await dropDatabase(opts.adminUrl, name);
    },
    db,
    pool,
    /** Entre testes do MESMO arquivo. RESTART IDENTITY para que os ids não
     *  vazem informação de um teste para o outro. */
    async truncateAll() {
      const { rows } = await pool.query<{ tablename: string }>(
        `SELECT tablename FROM pg_tables
         WHERE schemaname = 'public' AND tablename <> '__drizzle_migrations'`,
      );
      if (rows.length === 0) return;
      const tables = rows.map((r) => `"${r.tablename}"`).join(", ");
      await pool.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
    },
    url: url.toString(),
  };
}

export async function withTestRedis(url: string, lab: string) {
  const { createRedis } = await import("@labs/db-kit");
  const prefix = `${lab}:t:${rand()}:`;
  const redis = createRedis(url, prefix);
  await redis.connect();

  const flush = async () => {
    // `keyPrefix` do ioredis não se aplica a SCAN, então varremos pelo prefixo cru.
    let cursor = "0";
    do {
      const [next, keys] = await redis.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 500);
      cursor = next;
      if (keys.length > 0) await redis.del(...keys.map((k) => k.slice(prefix.length)));
    } while (cursor !== "0");
  };

  return {
    async close() {
      await flush();
      redis.disconnect();
    },
    flush,
    prefix,
    redis,
  };
}
