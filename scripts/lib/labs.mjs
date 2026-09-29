import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const LABS_DIR = join(ROOT, "labs");

/** Lê todos os lab.config.json. Fonte única de portas, serviços e status. */
export function readLabs() {
  if (!existsSync(LABS_DIR)) return [];
  return readdirSync(LABS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(LABS_DIR, d.name, "lab.config.json"))
    .filter(existsSync)
    .map((file) => ({ ...JSON.parse(readFileSync(file, "utf8")), dir: dirname(file) }))
    .sort((a, b) => (a.tier ?? 9) - (b.tier ?? 9) || a.id.localeCompare(b.id));
}

export function findLab(id) {
  return readLabs().find((lab) => lab.id === id);
}

/** Sugere nomes próximos quando o lab digitado não existe. */
export function suggest(id, labs) {
  return labs
    .map((lab) => ({ id: lab.id, score: overlap(id, lab.id) }))
    .filter((candidate) => candidate.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((candidate) => candidate.id);
}

function overlap(a, b) {
  const parts = new Set(a.split("-"));
  const hits = b.split("-").filter((part) => parts.has(part)).length;
  return hits / Math.max(parts.size, b.split("-").length);
}

export const TIERS = {
  0: "Tier 0 - Fundamentos",
  1: "Tier 1 - Seguranca e autenticacao",
  2: "Tier 2 - Tempo real, dados e concorrencia",
  3: "Tier 3 - Dinheiro e integracoes",
  4: "Tier 4 - Arquitetura e operacao",
};

const ESC = String.fromCharCode(27);
const wrap = (code) => (s) => `${ESC}[${code}m${s}${ESC}[0m`;

export const c = {
  bold: wrap(1),
  cyan: wrap(36),
  dim: wrap(2),
  green: wrap(32),
  red: wrap(31),
  yellow: wrap(33),
};
