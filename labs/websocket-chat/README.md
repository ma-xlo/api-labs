# websocket-chat

> Chat com WebSocket, presença e reconexão

**Features do roadmap:** `F5.4` `F5.5` `F5.6` `F5.7` `F5.9`

> Planejado. Ainda sem código — rode `pnpm new websocket-chat --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4090 |
| Tela  | http://localhost:4091 |
| Infra | `postgres`, `redis`   |

## Build

Chat com salas e lista de presença, aberto em várias abas. Autenticação do socket, heartbeat, detecção de half-open e reconexão com backoff.

## Learn

Por que o navegador não deixa você mandar header no handshake de WebSocket — e qual é o padrão correto de autenticação por causa disso.

## Done

Matar a rede de uma aba: o servidor detecta em segundos pelo heartbeat, e o cliente reconecta sozinho sem duplicar mensagem.

## Trap

Confiar que `onclose` dispara quando o cabo cai. Não dispara — só o heartbeat descobre.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
