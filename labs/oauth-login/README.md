# oauth-login

> OAuth 2.1 com PKCE e OIDC

**Features do roadmap:** `F9.19` `F9.20` `F9.31`

> Planejado. Ainda sem código — rode `pnpm new oauth-login --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4060 |
| Tela  | http://localhost:4061 |
| Infra | `postgres`            |

## Build

"Entrar com GitHub" de ponta a ponta: authorization code com PKCE, `state`, troca do código, e verificação do token OIDC contra o JWKS do provedor.

## Learn

O que PKCE resolve que o `state` não resolve, e por que o fluxo implícito morreu.

## Done

Um login social real funcionando, e um teste que prova que um `state` ausente ou reutilizado é rejeitado.

## Trap

Confiar no `id_token` sem validar `iss`, `aud` e a assinatura. Ele chega pela rede como qualquer outra coisa.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
