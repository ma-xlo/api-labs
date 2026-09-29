# oversell-lab

> O laboratório de oversell

**Features do roadmap:** `F3.8` `F3.9` `F3.10` `F4.10`

> Planejado. Ainda sem código — rode `pnpm new oversell-lab --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4110 |
| Tela  | http://localhost:4111 |
| Infra | `postgres`            |

## Build

Grade de assentos e um botão que dispara 50 compras simultâneas do último lugar. Transações, níveis de isolamento e locks.

## Learn

Que `SELECT` seguido de `UPDATE` não é atômico, o que `FOR UPDATE` resolve, e que race condition existe em código single-threaded por causa do `await`.

## Done

As 50 requisições concorrentes vendem exatamente 1 ingresso — e o teste que prova isso roda no CI.

## Trap

Testar com 2 requisições "simultâneas" no Postman. Não é concorrência; use uma barreira e dispare de verdade.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
