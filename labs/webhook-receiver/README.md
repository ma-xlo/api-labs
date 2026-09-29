# webhook-receiver

> Receptor de webhook e entrega hostil

**Features do roadmap:** `F10.9` `F10.10` `F10.11` `F8.14`

> Planejado. Ainda sem código — rode `pnpm new webhook-receiver --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4160 |
| Tela  | http://localhost:4161 |
| Infra | `postgres`, `redis`   |

## Build

Inbox de webhooks recebidos com botão de replay manual. Verificação de HMAC sobre o **raw body**, deduplicação, e tolerância a entrega fora de ordem.

## Learn

Por que o body precisa ser verificado cru, antes de qualquer parse — e por que `express.json()` global já destrói essa possibilidade.

## Done

A suíte de entrega hostil passa: duplicado, fora de ordem, forjado, e um que chega antes do seu próprio commit.

## Trap

Processar o webhook de forma síncrona na requisição. Enfileire e responda 200 rápido, senão o provedor reenvia.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
