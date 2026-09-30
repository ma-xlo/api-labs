import type { AnyRelations, EmptyRelations } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { existsSync } from "node:fs";
import pg from "pg";

/**
 * Drizzle 1.0 trocou o antigo `schema` pela API de relations
 * (`defineRelations`). O generic acompanha isso: passe o retorno de
 * `defineRelations(...)` do seu lab, ou nada se ainda não tiver relações.
 */
export type Db<TRelations extends AnyRelations = EmptyRelations> = NodePgDatabase<TRelations>;

/**
 * Encanamento de banco. Modelagem NUNCA entra aqui — schema é de cada lab.
 */

export function createPool(url: string, opts: pg.PoolConfig = {}): pg.Pool {
  return new pg.Pool({ connectionString: url, max: 10, ...opts });
}

export function createDb<TRelations extends AnyRelations = EmptyRelations>(
  pool: pg.Pool,
  relations?: TRelations,
): Db<TRelations> {
  return drizzle({ client: pool, relations: relations as TRelations });
}

/** Troca o database do URL por `postgres`, para operações que não podem rodar
 *  conectadas ao alvo (CREATE/DROP DATABASE). */
export function adminUrl(url: string, database = "postgres"): string {
  const parsed = new URL(url);
  parsed.pathname = `/${database}`;
  return parsed.toString();
}

/** Conecta, roda `fn`, e fecha sempre — inclusive quando `fn` lança. */
export async function withDatabase<T>(
  url: string,
  fn: (client: pg.Client) => Promise<T>,
): Promise<T> {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export function databaseExists(url: string, name: string): Promise<boolean> {
  return withDatabase(adminUrl(url), async (client) => {
    const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [name]);
    return rowCount === 1;
  });
}

/**
 * Cria o database se não existir.
 *
 * Isto existe em vez de um init-script do Postgres porque init-scripts só rodam
 * na PRIMEIRA subida do volume — e você vai adicionar labs depois disso.
 *
 * `template` usa cópia de arquivo no Postgres: clonar um database já migrado
 * custa ~30 ms, contra segundos para rodar as migrations de novo. É o que torna
 * viável um database limpo por arquivo de teste.
 */
export async function ensureDatabase(
  url: string,
  name: string,
  opts: { template?: string } = {},
): Promise<void> {
  if (await databaseExists(url, name)) return;
  await withDatabase(adminUrl(url), async (client) => {
    // Identificador não pode ser parametrizado; por isso a validação estrita.
    assertIdentifier(name);
    const template = opts.template ? ` TEMPLATE ${assertIdentifier(opts.template)}` : "";
    await client.query(`CREATE DATABASE ${name}${template}`);
  });
}

export async function dropDatabase(url: string, name: string): Promise<void> {
  await withDatabase(adminUrl(url), async (client) => {
    assertIdentifier(name);
    await client.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  });
}

/**
 * Migrator programático, não `drizzle-kit migrate` via shell: os testes
 * precisam migrar um database efêmero sem spawnar processo.
 */
export async function runMigrations(url: string, migrationsFolder: string): Promise<void> {
  // Lab recém-criado ainda não rodou `db:generate`. O migrator do Drizzle faz
  // readdir na pasta e lança ENOENT — pasta ausente aqui significa "nada a
  // aplicar", não erro.
  if (!existsSync(migrationsFolder)) return;

  const pool = createPool(url, { max: 1 });
  try {
    await migrate(drizzle({ client: pool }), { migrationsFolder });
  } finally {
    await pool.end();
  }
}

function assertIdentifier(value: string): string {
  if (!/^[a-z_][a-z0-9_]{0,62}$/.test(value)) {
    throw new Error(`Identificador de database inválido: ${JSON.stringify(value)}`);
  }
  return value;
}
