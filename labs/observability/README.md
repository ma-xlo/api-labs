# observability

> Tracing distribuído e os três pilares

**Features do roadmap:** `F13.7` `F13.9` `F13.10` `F13.12`

> Planejado. Ainda sem código — rode `pnpm new observability --from-spec` para começar.

|       |                       |
| ----- | --------------------- |
| API   | http://localhost:4200 |
| Tela  | http://localhost:4201 |
| Infra | `postgres`, `jaeger`  |

## Build

Botão que dispara um fluxo completo e devolve um link direto para o trace no Jaeger. OpenTelemetry, métricas Prometheus, e os três pilares correlacionados.

## Learn

Por que log, métrica e trace respondem perguntas diferentes, e por que sem correlação entre eles você tem três ferramentas e nenhuma resposta.

## Done

Um único `trace_id` leva de uma requisição do navegador até a query no Postgres, passando pela fila — em uma tela só.

## Trap

Instrumentar tudo e amostrar nada. O custo é real; decida a taxa de amostragem de propósito.

---

## Contrato da API

_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou

_Os comportamentos que valem um teste permanente. Helpers em `@labs/test-kit`._
