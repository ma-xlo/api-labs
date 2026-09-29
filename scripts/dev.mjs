#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { c, findLab, readLabs, ROOT, suggest, TIERS } from "./lib/labs.mjs";

const arg = process.argv[2];

if (!arg || arg === "--list") {
  printCatalog();
  process.exit(0);
}

const lab = findLab(arg);
if (!lab) {
  console.error(c.red(`\nLab "${arg}" nao existe.\n`));
  const near = suggest(arg, readLabs());
  if (near.length > 0) console.error(`  Voce quis dizer: ${near.map(c.cyan).join(", ")}\n`);
  console.error(`  ${c.dim("pnpm labs")} lista todos.\n`);
  process.exit(1);
}

if (lab.status !== "ready") {
  console.log(`\n${c.yellow(lab.id)} ainda e uma especificacao, nao tem codigo.\n`);
  const readme = join(lab.dir, "README.md");
  if (existsSync(readme)) console.log(readFileSync(readme, "utf8"));
  console.log(`\nPara comecar a implementar:  ${c.cyan(`pnpm new ${lab.id} --from-spec`)}\n`);
  process.exit(0);
}

await main();

async function main() {
  const env = loadRootEnv();
  const services = lab.services ?? [];

  if (services.length > 0) {
    // --wait respeita os healthchecks do compose. Sem ele, o servidor sobe
    // antes do Postgres aceitar conexao e voce ve ECONNREFUSED no primeiro
    // segundo de todo `pnpm dev`.
    console.log(c.dim(`docker compose up -d --wait ${services.join(" ")}`));
    await run("docker", ["compose", "up", "-d", "--wait", ...services], { cwd: ROOT });
  }

  const childEnv = {
    ...process.env,
    ...env,
    CLIENT_ORIGIN: `http://localhost:${lab.ports.client}`,
    PORT: String(lab.ports.server),
    REDIS_PREFIX: `${lab.id.replace(/-/g, "_")}:`,
    ...(lab.env ?? {}),
  };
  const url = databaseUrl(env.POSTGRES_ADMIN_URL, lab.database);
  if (url) childEnv.DATABASE_URL = url;

  if (lab.database) {
    // Import dinamico de TS: este script roda sob tsx (ver package.json raiz).
    const { ensureDatabase } = await import("../packages/db-kit/src/postgres.ts");
    await ensureDatabase(env.POSTGRES_ADMIN_URL, lab.database);
    console.log(c.dim(`database "${lab.database}" pronto`));
    await run("pnpm", ["--filter", `@lab/${lab.id}-server`, "db:migrate"], {
      cwd: ROOT,
      env: childEnv,
    });
  }

  console.log("");
  console.log(`  ${c.bold(lab.title ?? lab.id)}`);
  console.log(`  ${c.dim("api")}  http://localhost:${lab.ports.server}`);
  console.log(`  ${c.dim("web")}  http://localhost:${lab.ports.client}`);
  for (const [label, url] of Object.entries(lab.extraOrigins ?? {})) {
    console.log(`  ${c.dim(label.padEnd(3))}  ${url}`);
  }
  console.log("");

  const children = [
    tag(
      "server",
      spawn("pnpm", ["--filter", `@lab/${lab.id}-server`, "dev"], base(childEnv)),
      c.cyan,
    ),
    tag(
      "client",
      spawn("pnpm", ["--filter", `@lab/${lab.id}-client`, "dev"], base(childEnv)),
      c.green,
    ),
  ];

  // Alguns labs precisam de uma terceira origem (um site atacante, por
  // exemplo). Se o lab traz um attacker/serve.mjs, ele sobe junto.
  const attacker = join(lab.dir, "attacker/serve.mjs");
  if (existsSync(attacker)) {
    const env = { ...childEnv, ATTACKER_PORT: String(lab.ports.extra?.[0] ?? 4002) };
    children.push(tag("evil", spawn("node", [attacker], base(env)), c.yellow));
  }

  const stopAll = () => {
    for (const child of children) child.kill("SIGINT");
  };
  process.on("SIGINT", stopAll);
  process.on("SIGTERM", stopAll);
  // Se um morre, o outro nao serve para nada. Derruba os dois.
  for (const child of children) child.on("exit", stopAll);
}

function base(env) {
  return { cwd: ROOT, env, stdio: ["ignore", "pipe", "pipe"] };
}

/** Prefixa cada linha para que as duas saidas sejam legiveis intercaladas. */
function tag(name, child, color) {
  const prefix = color(`[${name}]`);
  for (const stream of [child.stdout, child.stderr]) {
    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) console.log(`${prefix} ${line}`);
    });
  }
  return child;
}

function run(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", ...opts });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} saiu com ${code}`)),
    );
  });
}

function databaseUrl(adminUrl, database) {
  if (!database) return undefined;
  const url = new URL(adminUrl);
  url.pathname = `/${database}`;
  return url.toString();
}

function loadRootEnv() {
  const file = join(ROOT, ".env");
  if (!existsSync(file)) {
    console.error(c.red("\nFalta o arquivo .env na raiz.\n"));
    console.error(`  Rode:  ${c.cyan("cp .env.example .env")}\n`);
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (match) env[match[1]] = match[2];
  }
  return env;
}

function printCatalog() {
  const labs = readLabs();
  console.log(`\n  ${c.bold("api-labs")} ${c.dim(`- ${labs.length} labs`)}\n`);

  for (const [tier, title] of Object.entries(TIERS)) {
    const group = labs.filter((lab) => String(lab.tier) === tier);
    if (group.length === 0) continue;

    console.log(`  ${c.bold(title)}`);
    for (const lab of group) {
      const badge = lab.status === "ready" ? c.green("pronto") : c.dim(" spec ");
      console.log(`    ${badge}  ${c.cyan(lab.id.padEnd(24))} ${lab.title ?? ""}`);
      console.log(`            ${c.dim((lab.features ?? []).join(" "))}`);
    }
    console.log("");
  }

  console.log(`  ${c.dim("pnpm dev <lab>")}   sobe infra, migra e roda api + web`);
  console.log(`  ${c.dim("pnpm new <lab>")}   cria um lab novo a partir do template\n`);
}
