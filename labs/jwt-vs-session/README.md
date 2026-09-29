# jwt-vs-session

> JWT contra sessão, com os ataques

**Features do roadmap:** `F9.3` `F9.5` `F9.6`

> Planejado. Ainda sem código — rode `pnpm new jwt-vs-session --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4040 |
| Tela  | http://localhost:4041 |
| Infra | `postgres`            |

## Build

Dois botões de login — sessão e JWT — e um inspetor que decodifica o token na tela. Depois, ataque o seu próprio verificador.

## Learn

Que quase toda vulnerabilidade real de JWT é erro de configuração do verificador, não quebra de criptografia. E por que fixar o algoritmo esperado não é opcional.

## Done

Seis ataques como testes permanentes: `alg:none`, confusão HS256/RS256, expirado, `aud` errado, `kid` forjado, e token roubado do localStorage via XSS.

## Trap

Confiar no header `alg` do próprio token para decidir como verificá-lo.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
