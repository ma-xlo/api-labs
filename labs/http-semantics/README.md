# http-semantics

> Semântica de HTTP, na unha

**Features do roadmap:** `F1.5` `F1.6` `F2.8` `F2.11`

> Planejado. Ainda sem código — rode `pnpm new http-semantics --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4010 |
| Tela  | http://localhost:4011 |
| Infra | `postgres`            |

## Build

Um Postman caseiro: um botão por método e por status. No servidor, reproduza cada semântica e leia os bytes crus com `curl -v`.

## Learn

Safe vs idempotente (não é a mesma coisa), requisição condicional, PATCH merge vs JSON Patch, e por que repetir um POST cobra o cliente duas vezes.

## Done

`docs/http.md` com a sua própria observação de cada comportamento — incluindo um 304 que você não escreveu código para produzir.

## Trap

Achar que idempotente significa 'devolve o mesmo resultado'. Significa que repetir não muda o estado de novo.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
