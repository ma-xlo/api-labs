#!/usr/bin/env node
import { spawnSync } from "node:child_process";

import { c, findLab, ROOT } from "./lib/labs.mjs";

/** Serviços que vivem atrás de um profile do compose. Os ausentes sobem sempre. */
const PROFILES = {
  jaeger: "obs",
  mailpit: "mail",
  minio: "storage",
  opensearch: "search",
  rabbitmq: "broker",
  "stripe-mock": "payments",
};

const [, , action = "up", labId] = process.argv;

if (!["down", "logs", "reset", "up"].includes(action)) {
  console.error(c.red("\nUso: pnpm infra <up|down|reset|logs> [lab]\n"));
  process.exit(1);
}

const lab = labId ? findLab(labId) : undefined;
if (labId && !lab) {
  console.error(c.red(`\nLab "${labId}" nao existe.\n`));
  process.exit(1);
}

// Sem lab informado: opera sobre postgres e redis, que servem a todos.
const services = lab?.services ?? ["postgres", "redis"];
const profiles = [...new Set(services.map((s) => PROFILES[s]).filter(Boolean))].flatMap((p) => [
  "--profile",
  p,
]);

const args = {
  down: [...profiles, "down"],
  logs: [...profiles, "logs", "-f", ...services],
  reset: [...profiles, "down", "-v"],
  up: [...profiles, "up", "-d", "--wait", ...services],
}[action];

console.log(c.dim(`docker compose ${args.join(" ")}`));
const result = spawnSync("docker", ["compose", ...args], { cwd: ROOT, stdio: "inherit" });

if (action === "reset" && result.status === 0) {
  spawnSync("docker", ["compose", "up", "-d", "--wait", "postgres", "redis"], {
    cwd: ROOT,
    stdio: "inherit",
  });
}

process.exit(result.status ?? 1);
