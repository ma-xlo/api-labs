# cache-lab

> Cache, invalidação e stampede

**Features do roadmap:** `F6.1` `F6.3` `F6.4` `F6.5`

> Planejado. Ainda sem código — rode `pnpm new cache-lab --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4120 |
| Tela  | http://localhost:4121 |
| Infra | `postgres`, `redis`   |

## Build

Botão com latência medida e hit/miss visível. ETag e condicionais, cache-aside no Redis, escada de invalidação, e um botão que provoca stampede.

## Learn

Por que TTL sozinho não é invalidação, e o que single-flight resolve que TTL nenhum resolve.

## Done

O gráfico mostra 100 requisições simultâneas num cache frio gerando **uma** consulta ao banco, não 100.

## Trap

Cachear a resposta já serializada e depois não conseguir invalidar por entidade.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
