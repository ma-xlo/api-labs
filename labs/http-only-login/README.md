# http-only-login

> Sessão no servidor, cookie que o JavaScript não enxerga, e um site atacante para provar que a defesa de CSRF é real.

**Features do roadmap:** `F9.1` `F9.2` `F9.4*` `F1.7` `F9.12` `F9.13` · [ROADMAP.md](../../../api-study/ROADMAP.md)

```bash
pnpm dev http-only-login
```

|               |                                             |
| ------------- | ------------------------------------------- |
| API           | http://localhost:4000                       |
| Tela          | http://localhost:4001                       |
| Site atacante | http://127.0.0.1:4002/attacker.html         |
| Infra         | `postgres` (database `lab_http_only_login`) |

O front já está pronto. O backend é seu — `server/src/app.ts` sobe com `/health` e devolve **501** em qualquer rota `/auth/*` até você implementá-la, e a tela mostra isso explicitamente.

---

## Build

Uma autenticação por sessão com cookie `HttpOnly`, feita inteira à mão:

- **Cadastro e login** com **Argon2id**. Parâmetros medidos nesta máquina (`server/src/auth/measure.ts` é seu para escrever — a meta é 100–250 ms por hash), guardados junto do hash para permitir rehash transparente quando você endurecer o custo. Erro de credencial genérico e com custo de tempo constante.
- **Sessão server-side**: o cookie carrega um token de 256 bits; o banco guarda apenas o `SHA-256` dele. Timeout **idle** (deslizante) e **absoluto** (teto), ambos no servidor.
- **Rotação do id no login** — e em qualquer mudança de privilégio.
- **Detecção de reuso** (`F9.4` adaptado): reapresentar um id já rotacionado revoga a **família inteira** de sessões daquele login e grava um evento de segurança.
- **Lista de dispositivos** com revogação individual e "sair de todos".
- **CORS** com `credentials: true` e origem explícita.
- **CSRF**: token derivado por HMAC do segredo da sessão, **mais** checagem de `Origin`. As duas defesas chaveáveis por env, para que você possa desligá-las e ver o ataque funcionar.

## Learn

Por que o hash da senha é lento de propósito e o do token de sessão é rápido de propósito — não é descuido, são ameaças diferentes. O que **session fixation** é e por que rotacionar o identificador no login é a correção. Por que mensagem de erro genérica sem tempo constante ainda enumera contas. E a vantagem operacional que só sessão server-side tem: revogação instantânea e completa.

## Done

- [ ] O `Set-Cookie` do login tem exatamente `HttpOnly`, `Secure`, `SameSite`, `Path` — verificado num teste, não no olho
- [ ] O id do cookie **muda** no login (fixation)
- [ ] `logout-all` derruba a outra janela na **requisição seguinte**
- [ ] Reapresentar um id rotacionado mata a família e registra o evento
- [ ] O ataque do `attacker.html` falha com as defesas ligadas **e funciona com elas desligadas**
- [ ] `docs/cookies.md` e `docs/csrf.md` escritos com suas próprias observações

## Trap

Duas portas de `localhost` são **cross-origin mas same-site**. Para cookies, "site" é o domínio registrável e **ignora a porta** — então `SameSite=Lax` continua mandando o cookie entre `:4001` e `:4000`, e um teste de CSRF montado só entre essas duas portas passa sem ter exercitado defesa nenhuma. É por isso que o atacante mora em `127.0.0.1:4002`: IP não tem domínio registrável em comum com `localhost`, então é outro site de verdade.

---

## Contrato da API

A tela chama exatamente isto. Implemente contra este contrato e ela funciona sem ajuste. O espelho em TypeScript está em [`client/src/contract.ts`](client/src/contract.ts).

Todas as respostas são JSON. Erro tem a forma `{ "code": string, "message": string }`.

### `POST /auth/register`

```jsonc
// →
{ "email": "ana@exemplo.com", "password": "senha-muito-longa-e-boba" }
// ← 201
{ "id": "uuid", "email": "ana@exemplo.com", "createdAt": "2026-09-28T12:00:00.000Z" }
// ← 409  e-mail já existe — mensagem genérica, sem confirmar que existe
// ← 422  senha fraca
```

### `POST /auth/login`

```jsonc
// →
{ "email": "ana@exemplo.com", "password": "senha-muito-longa-e-boba" }
// ← 204  + Set-Cookie: sid=…; HttpOnly; Secure; SameSite=Lax; Path=/
//        + Set-Cookie: csrf=…; Secure; SameSite=Lax; Path=/     (sem HttpOnly)
// ← 401  { "code": "invalid_credentials", "message": "E-mail ou senha inválidos" }
//        idêntico para e-mail inexistente e senha errada, inclusive no tempo
// ← 429  conta bloqueada
```

### `GET /auth/me`

```jsonc
// ← 200
{ "id": "uuid", "email": "ana@exemplo.com", "createdAt": "2026-09-28T12:00:00.000Z" }
// ← 401  sem sessão, expirada ou revogada
```

### `GET /auth/csrf`

```jsonc
// ← 200  + Set-Cookie: csrf=…
{ "token": "base64url" }
```

A tela envia esse valor no header **`X-CSRF-Token`** em todo `POST`/`DELETE`. Ela o lê do cookie `csrf`, então o cookie precisa ser legível por JS.

### `POST /auth/logout` · `POST /auth/logout-all`

```jsonc
// ← 204  + cookies expirados (Max-Age=0, com as MESMAS opções do set)
```

### `GET /auth/sessions`

```jsonc
// ← 200
[
  {
    "id": "hash-da-sessao",
    "current": true, // a sessão que está fazendo esta requisição
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0 …",
    "createdAt": "2026-09-28T12:00:00.000Z",
    "lastSeenAt": "2026-09-28T12:34:00.000Z",
  },
]
```

### `DELETE /auth/sessions/:id`

```jsonc
// ← 204
// ← 404  sessão de outro usuário — 404, nunca 403: confirmar a existência é um IDOR em miniatura
```

---

## Modelo de dados

As tabelas que este lab pede. A modelagem em Drizzle é sua (`server/src/db/schema.ts`).

**`users`** — `id`, `email` (único, **case-insensitive**: `lower(email)`), `password_hash`, `password_params` (os parâmetros com que _este_ hash foi gerado — sem isso não há como saber que precisa reescrevê-lo), `failed_attempts`, `locked_until`, timestamps.

**`sessions`** — `id` (**PK = SHA-256 do token**; o token em claro nunca toca o banco), `user_id`, `family_id` (agrupa todas as rotações de um mesmo login), `previous_id`, `csrf_secret`, `rotated_at` (não-nulo = já rotacionada; reapresentá-la é o sinal de reuso), `revoked_at`, `revoked_reason`, `created_at`, `last_seen_at`, `idle_expires_at`, `absolute_expires_at`, `user_agent`, `ip`.

**`auth_events`** — trilha de auditoria: `login_ok`, `login_fail`, `rotate`, `reuse_detected`, `logout`, `logout_all`, `revoke`, `lockout`.

Depois de escrever o schema:

```bash
pnpm --filter @lab/http-only-login-server db:generate   # gera a migration
pnpm dev http-only-login                                # aplica e sobe
```

---

## Variáveis de ambiente

Acrescente ao `server/src/env.ts` conforme for precisando. As que a tela e o exercício de ataque assumem:

| Variável              | Padrão | Para quê                                     |
| --------------------- | ------ | -------------------------------------------- |
| `CSRF_MODE`           | `hmac` | `off` \| `double-submit` \| `hmac`           |
| `CHECK_ORIGIN`        | `true` | valida `Origin`/`Referer` contra a allowlist |
| `SESSION_SAMESITE`    | `lax`  | `lax` \| `strict` \| `none`                  |
| `SESSION_IDLE_MS`     | 30 min | timeout deslizante                           |
| `SESSION_ABSOLUTE_MS` | 12 h   | teto que não desliza                         |
| `SESSION_STORE`       | `pg`   | `pg` \| `redis` (o segundo backend, depois)  |

As três primeiras existem para que um teste possa **assertar que o exploit funciona** com as defesas desligadas. Um teste que só confirma que o ataque falha não distingue "a defesa funcionou" de "o ataque estava mal escrito".

---

## Como saber que terminou

Comportamentos que valem um teste permanente. Os helpers estão em [`tests/README.md`](tests/README.md).

**Unidade** — hash/verify; `needsRehash` true quando os parâmetros sobem; login com e-mail inexistente ainda paga o custo do hash; token com ≥256 bits; CSRF de outra sessão não valida.

**Integração (Postgres real)** — round-trip do store; sessão vencida por idle não volta; vencida pelo absoluto não volta _mesmo com touch recente_; `revokeFamily` mata todas; unicidade de e-mail é case-insensitive.

**API (supertest com jar de cookies)** — flags do `Set-Cookie`; login inválido e usuário inexistente com corpo _e_ status idênticos; **fixation** (o id muda no login e o antigo morre); **reuso** (id rotacionado → 401 + família revogada + evento); `logout-all` derruba o segundo cliente; CSRF ausente → 403; CSRF de outra sessão → 403; `Origin` fora da allowlist → 403 mesmo com token válido; **e o exploit passando com `CSRF_MODE=off`**; preflight de CORS ecoando a origem e nunca `*`.

---

## Depois que funcionar

1. **Extraia a interface `SessionStore`** e escreva o backend em Redis. Rode a mesma suíte de integração contra os dois com `describe.each(["pg", "redis"])`. O contraste é o aprendizado: no Postgres, "listar os dispositivos deste usuário" é um `WHERE` com índice; no Redis exige um índice secundário mantido à mão, sem transação. Isso vira o ADR de `F9.6`.
2. **`VITE_DIRECT_API=1 pnpm dev http-only-login`** — o proxy do Vite sai do caminho e a tela bate direto em `:4000`, cross-origin. Veja quebrar, leia o erro de CORS no console, conserte. É o `F9.12`.
3. **Escreva `docs/cookies.md`** com a tabela que você mesmo observou: configuração × legível por JS × enviado cross-site × consequência. E `docs/csrf.md` com a matriz defesa × ataque.
