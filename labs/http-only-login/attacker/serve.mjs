import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Serve attacker.html em 127.0.0.1, NÃO em localhost.
 *
 * A diferença é o lab inteiro: 127.0.0.1 e localhost são sites distintos para
 * a política de cookies, enquanto duas portas de localhost são o mesmo site.
 * Bindar no host errado faz o ataque "falhar" por motivo nenhum.
 */
const port = Number(process.env["ATTACKER_PORT"] ?? 4002);
const file = join(dirname(fileURLToPath(import.meta.url)), "attacker.html");

createServer((req, res) => {
  if (req.url === "/favicon.ico") {
    res.writeHead(204).end();
    return;
  }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(readFileSync(file));
}).listen(port, "127.0.0.1", () => {
  console.log(`site atacante em http://127.0.0.1:${port}/attacker.html`);
});
