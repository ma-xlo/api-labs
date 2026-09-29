# two-factor-totp

> Segundo fator com TOTP

**Features do roadmap:** `F9.22` `F9.24`

> Planejado. Ainda sem código — rode `pnpm new two-factor-totp --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4070 |
| Tela  | http://localhost:4071 |
| Infra | `postgres`, `mailpit` |

## Build

QR code, campo de 6 dígitos e recovery codes de uso único. Mais reset de senha e verificação de e-mail por link (Mailpit).

## Learn

Janela de tolerância de relógio, por que ela precisa ser estreita, e por que recovery codes precisam ser hasheados como senha.

## Done

Um código TOTP não é aceito duas vezes, e um recovery code queima ao ser usado — ambos com teste.

## Trap

Aceitar o mesmo código dentro da janela de 30s mais de uma vez — replay trivial.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
