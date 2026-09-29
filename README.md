# api-labs

Um monorepo onde cada tópico de backend vira um **lab**: um mini-projeto autocontido com uma tela mínima para exercitar, um backend com profundidade real, testes que provam o comportamento, e um comando para subir tudo.

Complemento de [`api-study`](../api-study), que leva o mesmo conteúdo num produto contínuo. Lá você constrói um sistema; aqui você isola um assunto por vez.

```bash
cp .env.example .env
pnpm install
pnpm labs                  # o catálogo
pnpm dev http-only-login   # sobe infra, migra, e roda api + tela
```

Requer Node 22.13.1 (`.nvmrc`), pnpm 9 e Docker.

---

## Como um lab funciona

```
labs/http-only-login/
├── lab.config.json    portas, serviços, features do roadmap
├── README.md          Build / Learn / Done / Trap + o contrato da API
├── server/            seu backend            ← você escreve
├── client/            a tela, em React       ← já vem pronta
└── tests/             seus testes            ← você escreve
```

**A tela vem pronta e o backend não.** O `server/` sobe com `/health` e devolve **501** em qualquer rota que você ainda não implementou — a tela mostra isso explicitamente, e vai ganhando vida conforme você avança. O contrato exato (endpoints, corpos, status, flags de cookie) está no README de cada lab, então não há adivinhação: implemente contra ele e a tela funciona de primeira.

---

## O catálogo

`pronto` = a tela existe. O backend é sempre seu.

### Tier 0 · Fundamentos

| Lab                 | A tela é                         | O backend ensina                                                  |
| ------------------- | -------------------------------- | ----------------------------------------------------------------- |
| `http-semantics`    | um Postman caseiro               | safe vs idempotente, requisição condicional, PATCH, versionamento |
| `error-taxonomy`    | formulário que dispara cada erro | Problem Details (RFC 9457), validação na borda, DTOs              |
| `pagination-search` | lista infinita com filtros       | paginação por cursor, sparse fieldsets, full-text no Postgres     |

### Tier 1 · Segurança e autenticação

| Lab                      | A tela é                                              | O backend ensina                                                 |
| ------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| **`http-only-login`** ✅ | login + dispositivos conectados + inspetor de cookies | Argon2id, sessão server-side, fixation, revogação, CSRF, CORS    |
| `jwt-vs-session`         | dois logins e um inspetor de token                    | JWT completo, JWKS, e seis ataques ao seu próprio verificador    |
| `rbac-idor`              | seletor de papel, dados de dois tenants               | RBAC deny-by-default, autorização por campo, laboratório de IDOR |
| `oauth-login`            | "Entrar com GitHub"                                   | OAuth 2.1 + PKCE, verificação de token OIDC                      |
| `two-factor-totp`        | QR code, 6 dígitos, recovery codes                    | TOTP, janela de relógio, replay                                  |
| `rate-limit-lab`         | botão de spam + gráfico de 429                        | token bucket distribuído, lockout de conta                       |

### Tier 2 · Tempo real, dados e concorrência

| Lab              | A tela é                                   | O backend ensina                                           |
| ---------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `websocket-chat` | chat com salas e presença                  | Upgrade, auth sem header, heartbeat, half-open, reconexão  |
| `sse-live-feed`  | dashboard que atualiza sozinho             | SSE, `Last-Event-ID`, retomada sem buracos, contra polling |
| `oversell-lab`   | grade de assentos + 50 compras simultâneas | transações, isolation levels, locks, o oversell            |
| `cache-lab`      | painel de hit/miss + botão de stampede     | ETag, cache-aside, invalidação, single-flight              |
| `stream-export`  | CSV de 1M linhas + gráfico de memória      | backpressure real, async iterators, cancelamento           |

### Tier 3 · Dinheiro e integrações

| Lab                    | A tela é                                         | O backend ensina                                               |
| ---------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| `payment-checkout`     | **carrinho com os métodos disponíveis** + 3DS    | tipo Money, PaymentIntent, idempotência, o webhook é a verdade |
| `subscription-billing` | **planos Free/Pro/Business**, upgrade e cancelar | ciclo de vida, proração, dunning, relógio falso                |
| `webhook-receiver`     | inbox de webhooks com replay                     | HMAC no raw body, dedup, entrega fora de ordem                 |
| `refunds-ledger`       | painel do admin: reembolso parcial + extrato     | partidas dobradas, disputas, chargebacks                       |
| `resilient-client`     | upstream instável + estado do circuito           | timeout, retry com jitter, circuit breaker, bulkhead           |

### Tier 4 · Arquitetura e operação

| Lab             | A tela é                                      | O backend ensina                                         |
| --------------- | --------------------------------------------- | -------------------------------------------------------- |
| `outbox-saga`   | pedido em 3 serviços + botão "falhar etapa 2" | outbox transacional, saga, o perigo do dual-write        |
| `queue-dlq`     | fila com DLQ e replay                         | at-least-once, poison messages, consumidor idempotente   |
| `observability` | botão que gera um trace + link pro Jaeger     | OpenTelemetry, Prometheus, correlacionar os três pilares |

---

## Comandos

|                                              |                                                               |
| -------------------------------------------- | ------------------------------------------------------------- |
| `pnpm labs`                                  | lista o catálogo com status e features                        |
| `pnpm dev <lab>`                             | sobe a infra do lab, aplica migrations e roda api + tela      |
| `pnpm new <lab> --from-spec`                 | transforma um lab planejado em código                         |
| `pnpm infra up\|down\|reset [lab]`           | controla os containers                                        |
| `pnpm test` · `pnpm typecheck` · `pnpm lint` | em todo o workspace                                           |
| `pnpm ports:check`                           | valida colisões e regenera [`docs/portas.md`](docs/portas.md) |

---

## O que é compartilhado, e o que não é

| Package                                                        | Para quê                                                                                             |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `@labs/http-kit`                                               | app Express base, `/health`, `/ready`, `/version`, logger, shutdown limpo                            |
| `@labs/db-kit`                                                 | pool, `ensureDatabase`, migrator programático, Redis com prefixo                                     |
| `@labs/test-kit`                                               | database descartável por arquivo de teste, supertest com jar de cookies, asserção de flags de cookie |
| `@labs/ui-kit`                                                 | a bancada React: `Bench`, `Panel`, `RequestLog`, `CookieInspector`, `useApi`                         |
| `@labs/config`                                                 | validação de env que falha na subida                                                                 |
| `@labs/tsconfig` · `@labs/eslint-config` · `@labs/vite-preset` | configuração                                                                                         |

**A regra**, em [`docs/convencoes.md`](docs/convencoes.md): um package compartilhado só pode existir se for idêntico em todo lab **e** não for o objeto de estudo de nenhum. Não há middleware de auth, CSRF, rate limit, cache ou paginação em `packages/` — cada um desses é um lab, e precisa ser escrito à mão lá dentro. Duplicação entre labs é o produto, não um defeito.

---

## Portas

A infra é deslocada de propósito (Postgres em **5442**, não 5432) para que este repo e o `api-study` rodem ao mesmo tempo. Cada lab reserva um bloco de 10 portas a partir de 4000. O mapa completo está em [`docs/portas.md`](docs/portas.md), gerado a partir dos `lab.config.json`.
