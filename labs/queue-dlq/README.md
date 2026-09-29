# queue-dlq

> Broker, consumidor correto e DLQ

**Features do roadmap:** `F12.1` `F12.2` `F12.3` `F12.4`

> Planejado. Ainda sem código — rode `pnpm new queue-dlq --from-spec` para começar.

|       |                        |
| ----- | ---------------------- |
| API   | http://localhost:4210  |
| Tela  | http://localhost:4211  |
| Infra | `postgres`, `rabbitmq` |

## Build

Fila com painel de DLQ e replay. Consumidor correto, poison messages, evolução de schema de mensagem.

## Learn

Que at-least-once é o padrão real e exatamente-uma-vez quase nunca existe — então o consumidor precisa ser idempotente, não a fila ser perfeita.

## Done

Uma mensagem envenenada vai para a DLQ depois de N tentativas sem travar a fila — e pode ser reprocessada pela tela.

## Trap

Dar `ack` antes de processar. A mensagem some no primeiro crash.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
