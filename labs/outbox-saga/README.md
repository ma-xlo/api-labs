# outbox-saga

> Outbox transacional e saga

**Features do roadmap:** `F11.6` `F11.9` `F12.14`

> Planejado. Ainda sem código — rode `pnpm new outbox-saga --from-spec` para começar.

|       |                        |
| ----- | ---------------------- |
| API   | http://localhost:4190  |
| Tela  | http://localhost:4191  |
| Infra | `postgres`, `rabbitmq` |

## Build

Um pedido atravessando três serviços, com timeline na tela e um botão 'falhar a etapa 2'. Outbox transacional, saga com compensação.

## Learn

O perigo do dual-write: gravar no banco e publicar no broker não é atômico, e todo sistema que finge que é tem uma inconsistência à espera.

## Done

Matar o processo entre o commit e a publicação do evento: nenhuma mensagem se perde, e nenhuma é publicada sem o commit ter acontecido.

## Trap

Publicar dentro da transação. Se o commit falhar depois, você anunciou um fato que não existe.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
