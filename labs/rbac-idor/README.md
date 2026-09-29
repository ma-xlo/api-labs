# rbac-idor

> RBAC, autorização por objeto e o laboratório de IDOR

**Features do roadmap:** `F9.7` `F9.8` `F9.9` `F9.30`

> Planejado. Ainda sem código — rode `pnpm new rbac-idor --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4050 |
| Tela  | http://localhost:4051 |
| Infra | `postgres`            |

## Build

Seletor de papel e uma lista de pedidos de dois tenants. Um campo de receita que aparece para um papel e não para outro.

## Learn

Deny-by-default, autorização por objeto e por campo, e por que filtrar no código depois de buscar tudo já é o bug.

## Done

O teste de IDOR: autenticado como A, tentar ler o pedido de B devolve 404 — e a correção está na query, não num `if` depois de buscar.

## Trap

Devolver 403 em vez de 404 para recurso de outro usuário — o 403 confirma que o recurso existe.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
