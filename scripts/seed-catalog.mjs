#!/usr/bin/env node
/**
 * Gera os labs spec-only do catálogo. Roda uma vez, no bootstrap do repo.
 *
 * Labs spec NÃO têm package.json — então não entram no workspace, não quebram
 * `pnpm -r test`, e ainda assim aparecem em `pnpm labs` com porta reservada.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { c, LABS_DIR } from "./lib/labs.mjs";

const CATALOG = [
  // ── Tier 0 · Fundamentos ────────────────────────────────────────────────
  {
    build:
      "Um Postman caseiro: um botão por método e por status. No servidor, reproduza cada semântica e leia os bytes crus com `curl -v`.",
    done: "`docs/http.md` com a sua própria observação de cada comportamento — incluindo um 304 que você não escreveu código para produzir.",
    features: ["F1.5", "F1.6", "F2.8", "F2.11"],
    id: "http-semantics",
    learn:
      "Safe vs idempotente (não é a mesma coisa), requisição condicional, PATCH merge vs JSON Patch, e por que repetir um POST cobra o cliente duas vezes.",
    tier: 0,
    title: "Semântica de HTTP, na unha",
    trap: "Achar que idempotente significa 'devolve o mesmo resultado'. Significa que repetir não muda o estado de novo.",
  },
  {
    build:
      "CRUD de eventos com validação na borda, DTOs explícitos e uma taxonomia de erro que vira `application/problem+json`. OpenAPI gerado do mesmo lugar.",
    done: "Todo erro da API tem `type`, `title`, `status` e `detail` — e o OpenAPI bate com a implementação, verificado por teste.",
    features: ["F2.1", "F2.2", "F2.3", "F2.4", "F2.12"],
    id: "error-taxonomy",
    learn:
      "RFC 9457, por que validar na borda e não no meio, e por que devolver a entidade do banco direto é um vazamento esperando acontecer.",
    tier: 0,
    title: "Contrato de erro e validação na borda",
    trap: "Um `catch` que devolve 500 para erro de validação. O status faz parte do contrato.",
  },
  {
    build:
      "Lista com scroll infinito, filtros, ordenação e sparse fieldsets. Paginação por cursor, nunca por offset. Busca full-text no Postgres.",
    done: "Um `EXPLAIN ANALYZE` commitado mostrando o índice sendo usado — e o mesmo com offset em 100 mil linhas, para comparar.",
    features: ["F2.6", "F2.7", "F3.6", "F12.10"],
    id: "pagination-search",
    learn:
      "Por que offset fica linearmente mais lento e cursor não, e por que offset pula ou duplica linhas quando alguém insere durante a paginação.",
    tier: 0,
    title: "Paginação por cursor e busca",
    trap: "Cursor que é só o id. Se a ordenação é por data, o cursor precisa carregar data *e* id, senão empates quebram a paginação.",
  },

  // ── Tier 1 · Segurança ──────────────────────────────────────────────────
  {
    build:
      "Dois botões de login — sessão e JWT — e um inspetor que decodifica o token na tela. Depois, ataque o seu próprio verificador.",
    done: "Seis ataques como testes permanentes: `alg:none`, confusão HS256/RS256, expirado, `aud` errado, `kid` forjado, e token roubado do localStorage via XSS.",
    features: ["F9.3", "F9.5", "F9.6"],
    id: "jwt-vs-session",
    learn:
      "Que quase toda vulnerabilidade real de JWT é erro de configuração do verificador, não quebra de criptografia. E por que fixar o algoritmo esperado não é opcional.",
    tier: 1,
    title: "JWT contra sessão, com os ataques",
    trap: "Confiar no header `alg` do próprio token para decidir como verificá-lo.",
  },
  {
    build:
      "Seletor de papel e uma lista de pedidos de dois tenants. Um campo de receita que aparece para um papel e não para outro.",
    done: "O teste de IDOR: autenticado como A, tentar ler o pedido de B devolve 404 — e a correção está na query, não num `if` depois de buscar.",
    features: ["F9.7", "F9.8", "F9.9", "F9.30"],
    id: "rbac-idor",
    learn:
      "Deny-by-default, autorização por objeto e por campo, e por que filtrar no código depois de buscar tudo já é o bug.",
    tier: 1,
    title: "RBAC, autorização por objeto e o laboratório de IDOR",
    trap: "Devolver 403 em vez de 404 para recurso de outro usuário — o 403 confirma que o recurso existe.",
  },
  {
    build:
      '"Entrar com GitHub" de ponta a ponta: authorization code com PKCE, `state`, troca do código, e verificação do token OIDC contra o JWKS do provedor.',
    done: "Um login social real funcionando, e um teste que prova que um `state` ausente ou reutilizado é rejeitado.",
    features: ["F9.19", "F9.20", "F9.31"],
    id: "oauth-login",
    learn: "O que PKCE resolve que o `state` não resolve, e por que o fluxo implícito morreu.",
    tier: 1,
    title: "OAuth 2.1 com PKCE e OIDC",
    trap: "Confiar no `id_token` sem validar `iss`, `aud` e a assinatura. Ele chega pela rede como qualquer outra coisa.",
  },
  {
    build:
      "QR code, campo de 6 dígitos e recovery codes de uso único. Mais reset de senha e verificação de e-mail por link (Mailpit).",
    done: "Um código TOTP não é aceito duas vezes, e um recovery code queima ao ser usado — ambos com teste.",
    features: ["F9.22", "F9.24"],
    id: "two-factor-totp",
    learn:
      "Janela de tolerância de relógio, por que ela precisa ser estreita, e por que recovery codes precisam ser hasheados como senha.",
    services: ["postgres", "mailpit"],
    tier: 1,
    title: "Segundo fator com TOTP",
    trap: "Aceitar o mesmo código dentro da janela de 30s mais de uma vez — replay trivial.",
  },
  {
    build:
      "Botão de spam com contador e um gráfico de 429 ao vivo. Token bucket e sliding window, no Redis para valer entre réplicas.",
    done: "Duas instâncias da API compartilham o mesmo limite — provado subindo duas e batendo nas duas.",
    features: ["F9.18", "F4.24", "F14.2"],
    id: "rate-limit-lab",
    learn:
      "Por que limite em memória vira N× o limite com N réplicas, e a diferença entre limitar e derrubar carga (load shedding).",
    services: ["postgres", "redis"],
    tier: 1,
    title: "Rate limiting distribuído e lockout",
    trap: "Contar por IP atrás de um proxy sem configurar `trust proxy` — você limita o proxy, não o cliente.",
  },

  // ── Tier 2 · Tempo real, dados e concorrência ───────────────────────────
  {
    build:
      "Chat com salas e lista de presença, aberto em várias abas. Autenticação do socket, heartbeat, detecção de half-open e reconexão com backoff.",
    done: "Matar a rede de uma aba: o servidor detecta em segundos pelo heartbeat, e o cliente reconecta sozinho sem duplicar mensagem.",
    features: ["F5.4", "F5.5", "F5.6", "F5.7", "F5.9"],
    id: "websocket-chat",
    learn:
      "Por que o navegador não deixa você mandar header no handshake de WebSocket — e qual é o padrão correto de autenticação por causa disso.",
    services: ["postgres", "redis"],
    tier: 2,
    title: "Chat com WebSocket, presença e reconexão",
    trap: "Confiar que `onclose` dispara quando o cabo cai. Não dispara — só o heartbeat descobre.",
  },
  {
    build:
      "Dashboard que atualiza sozinho por SSE, com `Last-Event-ID` e um buffer circular para retomar sem buracos. Ao lado, short e long polling do mesmo dado, para comparar.",
    done: "`docs/realtime.md` com medições suas das quatro abordagens: requisições/min, bytes, latência de entrega e CPU por cliente.",
    features: ["F5.1", "F5.2", "F5.3"],
    id: "sse-live-feed",
    learn:
      "Que SSE é HTTP puro — herda autenticação, compressão, proxies e status codes de graça, o que é uma vantagem prática grande sobre WebSocket.",
    tier: 2,
    title: "SSE com retomada, contra polling",
    trap: "Um proxy no meio que faz buffer da resposta e transforma seu stream em nada. Descubra qual header desliga isso.",
  },
  {
    build:
      "Grade de assentos e um botão que dispara 50 compras simultâneas do último lugar. Transações, níveis de isolamento e locks.",
    done: "As 50 requisições concorrentes vendem exatamente 1 ingresso — e o teste que prova isso roda no CI.",
    features: ["F3.8", "F3.9", "F3.10", "F4.10"],
    id: "oversell-lab",
    learn:
      "Que `SELECT` seguido de `UPDATE` não é atômico, o que `FOR UPDATE` resolve, e que race condition existe em código single-threaded por causa do `await`.",
    tier: 2,
    title: "O laboratório de oversell",
    trap: 'Testar com 2 requisições "simultâneas" no Postman. Não é concorrência; use uma barreira e dispare de verdade.',
  },
  {
    build:
      "Botão com latência medida e hit/miss visível. ETag e condicionais, cache-aside no Redis, escada de invalidação, e um botão que provoca stampede.",
    done: "O gráfico mostra 100 requisições simultâneas num cache frio gerando **uma** consulta ao banco, não 100.",
    features: ["F6.1", "F6.3", "F6.4", "F6.5"],
    id: "cache-lab",
    learn:
      "Por que TTL sozinho não é invalidação, e o que single-flight resolve que TTL nenhum resolve.",
    services: ["postgres", "redis"],
    tier: 2,
    title: "Cache, invalidação e stampede",
    trap: "Cachear a resposta já serializada e depois não conseguir invalidar por entidade.",
  },
  {
    build:
      "Botão 'exportar CSV' de 1 milhão de linhas, com progresso e botão de cancelar. Gráfico de memória do processo ao lado.",
    done: "A memória fica **plana** durante a exportação inteira — e o gráfico prova. Cancelar de verdade para a query no banco.",
    features: ["F4.18", "F4.19", "F4.9"],
    id: "stream-export",
    learn:
      "Backpressure de verdade: o que acontece quando o cliente lê mais devagar que o banco entrega, e por que `.map()` sobre o resultado inteiro te mata.",
    tier: 2,
    title: "Exportação em stream com backpressure",
    trap: "`res.write()` sem checar o retorno. Ele devolve `false` quando o buffer encheu — ignorar isso é o vazamento.",
  },

  // ── Tier 3 · Dinheiro ───────────────────────────────────────────────────
  {
    build:
      "Tela de pagamento com os métodos disponíveis (cartão, Pix, boleto) e o desvio de 3-D Secure. Tipo Money, PaymentIntent com chave de idempotência, máquina de estados do pedido.",
    done: "Uma compra completa em test mode, e `docs/pci-scope.md` explicando exatamente o que o seu servidor toca e o que não toca.",
    features: ["F10.6", "F10.7", "F10.8", "F10.12", "F10.18"],
    id: "payment-checkout",
    learn:
      "A disciplina central de pagamento: a resposta síncrona diz o que foi *enviado*, só o webhook diz o que *aconteceu*. E por que Pix e boleto quebram a máquina de estados do cartão.",
    services: ["postgres", "stripe-mock"],
    tier: 3,
    title: "Checkout com os métodos de pagamento",
    trap: "Marcar o pedido como pago na resposta de sucesso da API. Não faça. O lab de webhook mostra exatamente por quê.",
  },
  {
    build:
      "Tela de assinatura com os planos disponíveis, upgrade, downgrade e cancelar no fim do período. Ciclo trial → active → past due → cancelled, dirigido por eventos.",
    done: "Um ciclo de cobrança inteiro simulado com relógio falso: pagamento falho, retentativa de dunning, recuperação e cancelamento.",
    features: ["F10.17", "F10.15", "F10.13"],
    id: "subscription-billing",
    learn:
      "Por que recorrência é bem mais difícil que cobrança avulsa: aritmética de proração, churn involuntário por cartão vencido, e uma máquina de estados com muito mais arestas.",
    services: ["postgres", "stripe-mock"],
    tier: 3,
    title: "Assinatura, planos e dunning",
    trap: "Proração calculada em float. Meio centavo perdido por assinante vira um rombo que não fecha.",
  },
  {
    build:
      "Inbox de webhooks recebidos com botão de replay manual. Verificação de HMAC sobre o **raw body**, deduplicação, e tolerância a entrega fora de ordem.",
    done: "A suíte de entrega hostil passa: duplicado, fora de ordem, forjado, e um que chega antes do seu próprio commit.",
    features: ["F10.9", "F10.10", "F10.11", "F8.14"],
    id: "webhook-receiver",
    learn:
      "Por que o body precisa ser verificado cru, antes de qualquer parse — e por que `express.json()` global já destrói essa possibilidade.",
    services: ["postgres", "redis"],
    tier: 3,
    title: "Receptor de webhook e entrega hostil",
    trap: "Processar o webhook de forma síncrona na requisição. Enfileire e responda 200 rápido, senão o provedor reenvia.",
  },
  {
    build:
      "Painel do admin com reembolso parcial e um extrato contábil. Razão de partidas dobradas, disputas e chargebacks.",
    done: "Depois de qualquer sequência de operações, a soma dos débitos é igual à soma dos créditos — verificado por teste baseado em propriedade.",
    features: ["F10.14", "F10.15", "F10.16"],
    id: "refunds-ledger",
    learn:
      "Que reembolso não é uma cobrança com sinal negativo — tem ciclo de vida, falhas e tempo próprios. E que chargeback é dinheiro saindo semanas depois.",
    services: ["postgres", "stripe-mock"],
    tier: 3,
    title: "Reembolsos, disputas e razão contábil",
    trap: "Um `UPDATE saldo` em vez de lançamentos imutáveis. Você perde a capacidade de responder 'por que o saldo é este'.",
  },
  {
    build:
      "Painel do upstream instável com botões para provocar lentidão, erro e timeout — e o estado do circuito em tempo real. Timeout, retry com jitter, circuit breaker, bulkhead.",
    done: "Com o upstream 100% fora, sua API continua respondendo (degradada) e o circuito abre antes de esgotar o pool de conexões.",
    features: ["F10.1", "F10.2", "F10.3", "F14.1", "F14.4"],
    id: "resilient-client",
    learn:
      "Por que retry sem jitter transforma uma falha passageira numa tempestade, e o que um bulkhead impede que um timeout sozinho não impede.",
    tier: 3,
    title: "Cliente HTTP resiliente e circuit breaker",
    trap: "Retry em cima de operação não idempotente. Você acabou de cobrar o cliente três vezes.",
  },

  // ── Tier 4 · Arquitetura e operação ─────────────────────────────────────
  {
    build:
      "Um pedido atravessando três serviços, com timeline na tela e um botão 'falhar a etapa 2'. Outbox transacional, saga com compensação.",
    done: "Matar o processo entre o commit e a publicação do evento: nenhuma mensagem se perde, e nenhuma é publicada sem o commit ter acontecido.",
    features: ["F11.6", "F11.9", "F12.14"],
    id: "outbox-saga",
    learn:
      "O perigo do dual-write: gravar no banco e publicar no broker não é atômico, e todo sistema que finge que é tem uma inconsistência à espera.",
    services: ["postgres", "rabbitmq"],
    tier: 4,
    title: "Outbox transacional e saga",
    trap: "Publicar dentro da transação. Se o commit falhar depois, você anunciou um fato que não existe.",
  },
  {
    build:
      "Botão que dispara um fluxo completo e devolve um link direto para o trace no Jaeger. OpenTelemetry, métricas Prometheus, e os três pilares correlacionados.",
    done: "Um único `trace_id` leva de uma requisição do navegador até a query no Postgres, passando pela fila — em uma tela só.",
    features: ["F13.7", "F13.9", "F13.10", "F13.12"],
    id: "observability",
    learn:
      "Por que log, métrica e trace respondem perguntas diferentes, e por que sem correlação entre eles você tem três ferramentas e nenhuma resposta.",
    services: ["postgres", "jaeger"],
    tier: 4,
    title: "Tracing distribuído e os três pilares",
    trap: "Instrumentar tudo e amostrar nada. O custo é real; decida a taxa de amostragem de propósito.",
  },
  {
    build:
      "Fila com painel de DLQ e replay. Consumidor correto, poison messages, evolução de schema de mensagem.",
    done: "Uma mensagem envenenada vai para a DLQ depois de N tentativas sem travar a fila — e pode ser reprocessada pela tela.",
    features: ["F12.1", "F12.2", "F12.3", "F12.4"],
    id: "queue-dlq",
    learn:
      "Que at-least-once é o padrão real e exatamente-uma-vez quase nunca existe — então o consumidor precisa ser idempotente, não a fila ser perfeita.",
    services: ["postgres", "rabbitmq"],
    tier: 4,
    title: "Broker, consumidor correto e DLQ",
    trap: "Dar `ack` antes de processar. A mensagem some no primeiro crash.",
  },
];

let created = 0;
let base = 4010;

for (const entry of CATALOG) {
  const dir = join(LABS_DIR, entry.id);
  if (existsSync(join(dir, "lab.config.json"))) continue;

  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "lab.config.json"),
    `${JSON.stringify(
      {
        database: `lab_${entry.id.replace(/-/g, "_")}`,
        features: entry.features,
        id: entry.id,
        ports: { client: base + 1, extra: [base + 2], server: base },
        services: entry.services ?? ["postgres"],
        status: "spec",
        tier: entry.tier,
        title: entry.title,
      },
      null,
      2,
    )}\n`,
  );

  writeFileSync(
    join(dir, "README.md"),
    `# ${entry.id}

> ${entry.title}

**Features do roadmap:** ${entry.features.map((f) => `\`${f}\``).join(" ")}

> Planejado. Ainda sem código — rode \`pnpm new ${entry.id} --from-spec\` para começar.

| | |
| --- | --- |
| API | http://localhost:${base} |
| Tela | http://localhost:${base + 1} |
| Infra | ${(entry.services ?? ["postgres"]).map((s) => `\`${s}\``).join(", ")} |

## Build
${entry.build}

## Learn
${entry.learn}

## Done
${entry.done}

## Trap
${entry.trap}

---

## Contrato da API
_A definir quando o lab começar. O front é escrito contra este contrato, então
ele vem antes do código._

## Como saber que terminou
_Os comportamentos que valem um teste permanente. Helpers em \`@labs/test-kit\`._
`,
  );

  base += 10;
  created++;
}

console.log(c.green(`OK  ${created} labs de especificacao criados`));
