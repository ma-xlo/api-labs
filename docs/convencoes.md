# Convenções

## A regra que sustenta o repositório

> Um package em `packages/` só pode existir se for **(a)** idêntico em todo lab **e** **(b)** não for o objeto de estudo de nenhum lab.
>
> Duplicação entre labs é o produto, não um defeito. Copiar código do lab X para o lab Y é permitido e incentivado. Importar de `packages/` aquilo que o lab deveria implementar é proibido.

O dia em que `packages/auth` existir, metade do Stage 9 do roadmap vira um `import` — e você terá trocado o aprendizado por conveniência num repositório cujo único propósito é o aprendizado.

### O que nunca entra em `packages/`

Middleware de autenticação ou sessão · CSRF · RBAC · rate limiting · cache · taxonomia de erro e `problem+json` · request-id e logging correlacionado · paginação · `Idempotency-Key` · schemas de validação · cliente HTTP com retry ou circuit breaker · setup de WebSocket · outbox · verificação de assinatura de webhook · tipo Money.

**Cada um desses é um lab.**

### Por que `@labs/test-kit` e `@labs/ui-kit` são exceções legítimas

`test-kit` oferece **asserção**, não implementação: `expectCookieFlags` prova que o seu `Set-Cookie` saiu como você pretendia, mas você continua tendo que escrevê-lo. `withTestDatabase` é encanamento de banco de teste, não conteúdo.

`ui-kit` existe porque frontend não é o objeto de estudo aqui. Um lab novo custa 4 arquivos de cliente por causa dele — e esse custo precisa ficar perto de zero, senão a tela deixa de ser feita.

---

## Idioma

Código, nomes de arquivo, identificadores e mensagens de commit em **inglês**. Comentários, documentação e READMEs em **português**.

Comentário explica **por quê**, não **o quê**. Se o comentário repete o código, apague o comentário.

---

## Um lab

```
labs/<nome>/
├── lab.config.json    portas, serviços, features — a fonte de verdade
├── README.md          Build / Learn / Done / Trap + contrato da API
├── server/            backend + tests/
├── client/            a tela
└── docs/              suas medições e observações
```

O README de cada lab segue o vocabulário do `api-study/ROADMAP.md` — **Build** (o que construir), **Learn** (os conceitos que isso obriga a entender), **Done** (a condição objetiva que fecha o checkbox), **Trap** (o erro que a maioria comete). Assim os dois repositórios conversam.

**O contrato da API vem antes do código.** O front é escrito contra ele, então defini-lo é o primeiro passo de um lab, não o último.

### Não acople este repo ao ROADMAP.md

É tentador escrever um script que extraia o texto da feature do outro repositório. É frágil — dois repos, um caminho absoluto, e eles saem de sincronia. Copie as linhas relevantes para o README do lab e aceite o drift.

---

## Portas

Declaradas **explicitamente** em cada `lab.config.json`, nunca calculadas por índice: índice muda quando você remove um lab, e dois labs passam a brigar pela mesma porta em silêncio.

Cada lab reserva um bloco de 10 a partir de 4000. `pnpm ports:check` valida e regenera `docs/portas.md`.

A infra usa portas deslocadas (Postgres 5442, Redis 6389) para conviver com o `api-study`.

---

## Infra

Um `docker-compose.yml` só, com **profiles**. Postgres e Redis sobem sempre; o resto só quando um lab declara precisar em `services`.

Isolamento entre labs sem containers extras: **um database por lab** no mesmo Postgres, e **prefixo de chave** por lab no mesmo Redis (prefixo, não índice de database — são 16 no total e não existem em cluster).

---

## Medições

Nenhuma afirmação sobre desempenho, escala ou confiabilidade sem um número commitado em `labs/<nome>/docs/`. É o hábito que mais separa quem otimiza a coisa certa de quem otimiza no escuro.

---

## Provoque a falha de propósito

Um teste que só confirma que o ataque falha não distingue "a defesa funcionou" de "o ataque estava mal escrito". Por isso as defesas dos labs de segurança são chaveáveis por variável de ambiente: existe um teste que, com a defesa desligada, **asserta que o exploit funciona**.

Ver a falha acontecer é o aprendizado. A correção depois é quase sempre trivial.
