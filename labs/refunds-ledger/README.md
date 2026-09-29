# refunds-ledger

> Reembolsos, disputas e razão contábil

**Features do roadmap:** `F10.14` `F10.15` `F10.16`

> Planejado. Ainda sem código — rode `pnpm new refunds-ledger --from-spec` para começar.

|       |                           |
| ----- | ------------------------- |
| API   | http://localhost:4170     |
| Tela  | http://localhost:4171     |
| Infra | `postgres`, `stripe-mock` |

## Build

Painel do admin com reembolso parcial e um extrato contábil. Razão de partidas dobradas, disputas e chargebacks.

## Learn

Que reembolso não é uma cobrança com sinal negativo — tem ciclo de vida, falhas e tempo próprios. E que chargeback é dinheiro saindo semanas depois.

## Done

Depois de qualquer sequência de operações, a soma dos débitos é igual à soma dos créditos — verificado por teste baseado em propriedade.

## Trap

Um `UPDATE saldo` em vez de lançamentos imutáveis. Você perde a capacidade de responder 'por que o saldo é este'.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
