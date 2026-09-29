# error-taxonomy

> Contrato de erro e validação na borda

**Features do roadmap:** `F2.1` `F2.2` `F2.3` `F2.4` `F2.12`

> Planejado. Ainda sem código — rode `pnpm new error-taxonomy --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4020 |
| Tela  | http://localhost:4021 |
| Infra | `postgres`            |

## Build

CRUD de eventos com validação na borda, DTOs explícitos e uma taxonomia de erro que vira `application/problem+json`. OpenAPI gerado do mesmo lugar.

## Learn

RFC 9457, por que validar na borda e não no meio, e por que devolver a entidade do banco direto é um vazamento esperando acontecer.

## Done

Todo erro da API tem `type`, `title`, `status` e `detail` — e o OpenAPI bate com a implementação, verificado por teste.

## Trap

Um `catch` que devolve 500 para erro de validação. O status faz parte do contrato.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
