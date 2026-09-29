# resilient-client

> Cliente HTTP resiliente e circuit breaker

**Features do roadmap:** `F10.1` `F10.2` `F10.3` `F14.1` `F14.4`

> Planejado. Ainda sem código — rode `pnpm new resilient-client --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4180 |
| Tela  | http://localhost:4181 |
| Infra | `postgres`            |

## Build

Painel do upstream instável com botões para provocar lentidão, erro e timeout — e o estado do circuito em tempo real. Timeout, retry com jitter, circuit breaker, bulkhead.

## Learn

Por que retry sem jitter transforma uma falha passageira numa tempestade, e o que um bulkhead impede que um timeout sozinho não impede.

## Done

Com o upstream 100% fora, sua API continua respondendo (degradada) e o circuito abre antes de esgotar o pool de conexões.

## Trap

Retry em cima de operação não idempotente. Você acabou de cobrar o cliente três vezes.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
