# subscription-billing

> Assinatura, planos e dunning

**Features do roadmap:** `F10.17` `F10.15` `F10.13`

> Planejado. Ainda sem código — rode `pnpm new subscription-billing --from-spec` para começar.

|       |                           |
| ----- | ------------------------- |
| API   | http://localhost:4150     |
| Tela  | http://localhost:4151     |
| Infra | `postgres`, `stripe-mock` |

## Build

Tela de assinatura com os planos disponíveis, upgrade, downgrade e cancelar no fim do período. Ciclo trial → active → past due → cancelled, dirigido por eventos.

## Learn

Por que recorrência é bem mais difícil que cobrança avulsa: aritmética de proração, churn involuntário por cartão vencido, e uma máquina de estados com muito mais arestas.

## Done

Um ciclo de cobrança inteiro simulado com relógio falso: pagamento falho, retentativa de dunning, recuperação e cancelamento.

## Trap

Proração calculada em float. Meio centavo perdido por assinante vira um rombo que não fecha.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
