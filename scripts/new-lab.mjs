#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

import { c, LABS_DIR, readLabs, ROOT } from "./lib/labs.mjs";

const [, , id, ...flags] = process.argv;
const specOnly = flags.includes("--spec");
const fromSpec = flags.includes("--from-spec");

if (!id || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(id)) {
  console.error(c.red("\nUso: pnpm new <nome-em-kebab-case> [--spec] [--from-spec]\n"));
  console.error("  --spec       cria so README + lab.config.json (lab planejado, sem codigo)");
  console.error("  --from-spec  transforma um lab spec-only existente em codigo\n");
  process.exit(1);
}

const dir = join(LABS_DIR, id);
const labs = readLabs();
const existing = labs.find((lab) => lab.id === id);

if (existsSync(join(dir, "server"))) {
  console.error(c.red(`\nO lab "${id}" ja tem codigo em labs/${id}/server.\n`));
  process.exit(1);
}
if (existing && !fromSpec && !specOnly) {
  console.error(c.red(`\nJa existe um lab "${id}" (status: ${existing.status}).`));
  console.error(`Use ${c.cyan(`pnpm new ${id} --from-spec`)} para implementa-lo.\n`);
  process.exit(1);
}

const ports = existing?.ports ?? allocatePorts(labs);
const config = {
  database: existing?.database ?? `lab_${id.replace(/-/g, "_")}`,
  features: existing?.features ?? [],
  id,
  ports,
  services: existing?.services ?? ["postgres"],
  status: specOnly ? "spec" : "ready",
  tier: existing?.tier ?? 9,
  title: existing?.title ?? id,
};

mkdirSync(dir, { recursive: true });

if (specOnly) {
  writeFileSync(join(dir, "lab.config.json"), `${JSON.stringify(config, null, 2)}\n`);
  if (!existsSync(join(dir, "README.md"))) {
    writeFileSync(
      join(dir, "README.md"),
      `# ${id}\n\n> Planejado, ainda sem codigo.\n\n**Build** ·\n\n**Learn** ·\n\n**Done** ·\n`,
    );
  }
  console.log(c.green(`\nLab "${id}" registrado como especificacao.\n`));
  process.exit(0);
}

// Copia o template e substitui os marcadores no conteudo E nos nomes de arquivo.
const template = join(ROOT, "templates/lab");
cpSync(template, dir, { errorOnExist: false, force: false, recursive: true });

const tokens = {
  __CLIENT_PORT__: String(ports.client),
  __EXTRA_PORT__: String(ports.extra?.[0] ?? ports.client + 1),
  __LAB_NAME__: id,
  __LAB_PASCAL__: id
    .split("-")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(""),
  __LAB_TITLE__: config.title,
  __SERVER_PORT__: String(ports.server),
};

walk(dir, (file) => {
  const original = readFileSync(file, "utf8");
  let next = original;
  for (const [token, value] of Object.entries(tokens)) next = next.split(token).join(value);
  if (next !== original) writeFileSync(file, next);

  let renamed = file;
  for (const [token, value] of Object.entries(tokens)) renamed = renamed.split(token).join(value);
  if (renamed !== file) renameSync(file, renamed);
});

// Preserva o README que o lab spec-only ja tinha: ele carrega o Build/Learn/Done.
if (fromSpec && existing) {
  const specReadme = readFileSync(join(dir, "README.md"), "utf8");
  if (!specReadme.includes("Planejado, ainda sem codigo")) {
    // README real ja escrito na fase de spec: mantem.
  }
}

writeFileSync(join(dir, "lab.config.json"), `${JSON.stringify(config, null, 2)}\n`);

console.log(c.green(`\nLab "${id}" criado em labs/${id}`));
console.log(`  api  http://localhost:${ports.server}`);
console.log(`  web  http://localhost:${ports.client}\n`);
console.log(`  ${c.cyan("pnpm install")} && ${c.cyan(`pnpm dev ${id}`)}\n`);

/** Aloca o proximo bloco de 10 portas livre, a partir de 4000. */
function allocatePorts(all) {
  const used = new Set();
  for (const lab of all) {
    for (const value of Object.values(lab.ports ?? {})) {
      for (const port of Array.isArray(value) ? value : [value]) used.add(port);
    }
  }
  for (let base = 4000; base < 5000; base += 10) {
    if (![0, 1, 2].some((offset) => used.has(base + offset))) {
      return { client: base + 1, extra: [base + 2], server: base };
    }
  }
  throw new Error("Sem blocos de porta livres na faixa 4000-4999.");
}

function walk(root, visit) {
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    if (statSync(full).isDirectory()) walk(full, visit);
    else visit(full);
  }
}
