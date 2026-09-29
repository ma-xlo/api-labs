# api-labs

Monorepo de estudo: cada tópico de backend é um **lab** autocontido — tela React mínima, backend com profundidade real, testes, um comando para subir.

## Divisão de trabalho — importante

**O usuário implementa o backend e os testes de cada lab.** Não escreva a implementação por ele, mesmo quando for óbvia e mesmo quando ele estiver travado num bug — o repositório inteiro existe para que esse código seja escrito à mão.

O que é seu:

- a **tela** de cada lab (React, modo escuro, via `@labs/ui-kit`)
- o **contrato da API** no README, que o front assume
- o esqueleto do `server/` (sobe com `/health`, 501 no resto)
- os packages compartilhados e os scripts

Quando ele pedir ajuda com o backend: explique o conceito, aponte o erro, sugira a direção — não entregue o código pronto.

## A regra dos packages compartilhados

Um package em `packages/` só existe se for idêntico em todo lab **e** não for o objeto de estudo de nenhum. Não há middleware de auth, CSRF, rate limit, cache ou paginação em `packages/` — cada um é um lab. Duplicação entre labs é o produto. Detalhes em `docs/convencoes.md`.

## Comandos

```bash
pnpm labs                     # catálogo
pnpm dev <lab>                # infra + migrations + api + tela
pnpm new <lab> --from-spec    # lab planejado → código
pnpm typecheck && pnpm lint   # antes de qualquer commit
pnpm ports:check              # valida portas, regenera docs/portas.md
```

## Stack

Node 22 ESM · TypeScript 6 estrito (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) · Express 5 · Drizzle 1.0-rc (API de `relations`, não a antiga de `schema`) · Postgres 17 · React 19 + Vite 8 · Vitest 5 · pnpm workspaces com `catalog:`.

Versões só no `catalog:` do `pnpm-workspace.yaml`. Nunca fixe versão no `package.json` de um lab — use `"catalog:"`.

Packages exportam TS-source direto (`"exports": "./src/index.ts"`), sem build step. `tsx` e Vite consomem isso nativamente.

## Idioma

Código e commits em inglês. Comentários, docs e READMEs em português. Comentário explica **por quê**, não **o quê**.

## Portas

Infra deslocada (Postgres 5442, Redis 6389) para conviver com o repo `api-study`. Labs em blocos de 10 a partir de 4000, declarados em cada `lab.config.json`.
