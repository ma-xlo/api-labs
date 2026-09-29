# stream-export

> Exportação em stream com backpressure

**Features do roadmap:** `F4.18` `F4.19` `F4.9`

> Planejado. Ainda sem código — rode `pnpm new stream-export --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4130 |
| Tela  | http://localhost:4131 |
| Infra | `postgres`            |

## Build

Botão 'exportar CSV' de 1 milhão de linhas, com progresso e botão de cancelar. Gráfico de memória do processo ao lado.

## Learn

Backpressure de verdade: o que acontece quando o cliente lê mais devagar que o banco entrega, e por que `.map()` sobre o resultado inteiro te mata.

## Done

A memória fica **plana** durante a exportação inteira — e o gráfico prova. Cancelar de verdade para a query no banco.

## Trap

`res.write()` sem checar o retorno. Ele devolve `false` quando o buffer encheu — ignorar isso é o vazamento.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
