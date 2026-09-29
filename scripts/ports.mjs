#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { c, readLabs, ROOT } from "./lib/labs.mjs";

/**
 * Portas são declaradas explicitamente em cada lab.config.json, nunca
 * calculadas por índice — índice muda quando você remove um lab, e aí dois
 * labs passam a brigar pela mesma porta em silêncio.
 */
const labs = readLabs();
const taken = new Map();
const conflicts = [];

for (const lab of labs) {
  for (const [role, value] of Object.entries(lab.ports ?? {})) {
    for (const port of Array.isArray(value) ? value : [value]) {
      if (taken.has(port)) conflicts.push(`porta ${port}: ${taken.get(port)} vs ${lab.id}.${role}`);
      else taken.set(port, `${lab.id}.${role}`);
    }
  }
}

if (conflicts.length > 0) {
  console.error(c.red("\nColisao de portas entre labs:\n"));
  for (const conflict of conflicts) console.error(`  ${conflict}`);
  console.error("");
  process.exit(1);
}

const rows = labs.map((lab) => {
  const extra = Array.isArray(lab.ports?.extra) ? lab.ports.extra.join(", ") : "—";
  return `| \`${lab.id}\` | ${lab.ports?.server ?? "—"} | ${lab.ports?.client ?? "—"} | ${extra} | ${lab.status} |`;
});

writeFileSync(
  join(ROOT, "docs/portas.md"),
  `# Mapa de portas

Gerado por \`pnpm ports:check\`. Não edite à mão — a fonte é cada \`labs/*/lab.config.json\`.

## Infra (docker-compose)

| Serviço | Porta host | Observação |
| --- | --- | --- |
| postgres | 5442 | 5432 é do api-study |
| redis | 6389 | 6379 deixado livre |
| mailpit smtp / ui | 1026 / 8026 | profile \`mail\` |
| stripe-mock | 12111 | profile \`payments\` |
| rabbitmq / mgmt | 5673 / 15673 | profile \`broker\` |
| opensearch | 9201 | profile \`search\` |
| minio api / console | 9010 / 9011 | profile \`storage\` |
| jaeger ui | 16687 | profile \`obs\` |

## Labs

Cada lab reserva um bloco de 10 portas, para caber servidor, cliente e origens extras.

| Lab | API | Web | Extras | Status |
| --- | --- | --- | --- | --- |
${rows.join("\n")}
`,
);

console.log(c.green(`OK  ${taken.size} portas, nenhuma colisao`));
console.log(c.dim(`    docs/portas.md atualizado (${labs.length} labs)`));
