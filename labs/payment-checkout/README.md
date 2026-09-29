# payment-checkout

> Checkout com os métodos de pagamento

**Features do roadmap:** `F10.6` `F10.7` `F10.8` `F10.12` `F10.18`

> Planejado. Ainda sem código — rode `pnpm new payment-checkout --from-spec` para começar.

|       |                           |
| ----- | ------------------------- |
| API   | http://localhost:4140     |
| Tela  | http://localhost:4141     |
| Infra | `postgres`, `stripe-mock` |

## Build

Tela de pagamento com os métodos disponíveis (cartão, Pix, boleto) e o desvio de 3-D Secure. Tipo Money, PaymentIntent com chave de idempotência, máquina de estados do pedido.

## Learn

A disciplina central de pagamento: a resposta síncrona diz o que foi _enviado_, só o webhook diz o que _aconteceu_. E por que Pix e boleto quebram a máquina de estados do cartão.

## Done

Uma compra completa em test mode, e `docs/pci-scope.md` explicando exatamente o que o seu servidor toca e o que não toca.

## Trap

Marcar o pedido como pago na resposta de sucesso da API. Não faça. O lab de webhook mostra exatamente por quê.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
