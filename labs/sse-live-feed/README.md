# sse-live-feed

> SSE com retomada, contra polling

**Features do roadmap:** `F5.1` `F5.2` `F5.3`

> Planejado. Ainda sem código — rode `pnpm new sse-live-feed --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4100 |
| Tela  | http://localhost:4101 |
| Infra | `postgres`            |

## Build

Dashboard que atualiza sozinho por SSE, com `Last-Event-ID` e um buffer circular para retomar sem buracos. Ao lado, short e long polling do mesmo dado, para comparar.

## Learn

Que SSE é HTTP puro — herda autenticação, compressão, proxies e status codes de graça, o que é uma vantagem prática grande sobre WebSocket.

## Done

`docs/realtime.md` com medições suas das quatro abordagens: requisições/min, bytes, latência de entrega e CPU por cliente.

## Trap

Um proxy no meio que faz buffer da resposta e transforma seu stream em nada. Descubra qual header desliga isso.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
