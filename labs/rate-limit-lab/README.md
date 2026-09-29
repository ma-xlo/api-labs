# rate-limit-lab

> Rate limiting distribuído e lockout

**Features do roadmap:** `F9.18` `F4.24` `F14.2`

> Planejado. Ainda sem código — rode `pnpm new rate-limit-lab --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4080 |
| Tela  | http://localhost:4081 |
| Infra | `postgres`, `redis`   |

## Build

Botão de spam com contador e um gráfico de 429 ao vivo. Token bucket e sliding window, no Redis para valer entre réplicas.

## Learn

Por que limite em memória vira N× o limite com N réplicas, e a diferença entre limitar e derrubar carga (load shedding).

## Done

Duas instâncias da API compartilham o mesmo limite — provado subindo duas e batendo nas duas.

## Trap

Contar por IP atrás de um proxy sem configurar `trust proxy` — você limita o proxy, não o cliente.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
