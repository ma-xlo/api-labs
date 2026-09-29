# pagination-search

> Paginação por cursor e busca

**Features do roadmap:** `F2.6` `F2.7` `F3.6` `F12.10`

> Planejado. Ainda sem código — rode `pnpm new pagination-search --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4030 |
| Tela  | http://localhost:4031 |
| Infra | `postgres`            |

## Build

Lista com scroll infinito, filtros, ordenação e sparse fieldsets. Paginação por cursor, nunca por offset. Busca full-text no Postgres.

## Learn

Por que offset fica linearmente mais lento e cursor não, e por que offset pula ou duplica linhas quando alguém insere durante a paginação.

## Done

Um `EXPLAIN ANALYZE` commitado mostrando o índice sendo usado — e o mesmo com offset em 100 mil linhas, para comparar.

## Trap

Cursor que é só o id. Se a ordenação é por data, o cursor precisa carregar data _e_ id, senão empates quebram a paginação.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
