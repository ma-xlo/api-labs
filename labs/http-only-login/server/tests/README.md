# Testes deste lab

Os testes são seus. O que o repositório já oferece está em `@labs/test-kit`:

```ts
import { apiClient, expectCookieFlags, withTestDatabase } from "@labs/test-kit";
```

| Helper                                     | Para quê                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `createTemplateDatabase()`                 | num `globalSetup`, cria UMA vez um banco migrado que serve de molde           |
| `withTestDatabase()`                       | clona esse molde por arquivo de teste (~30 ms), e dropa no fim                |
| `withTestRedis()`                          | um prefixo de chave isolado por execução                                      |
| `apiClient(app)`                           | supertest com jar de cookies persistente — sem isso não dá para testar sessão |
| `parseSetCookie()` / `expectCookieFlags()` | asserta HttpOnly, Secure, SameSite, Path e Max-Age de um `Set-Cookie`         |

Dois clientes (`apiClient(app)` chamado duas vezes) simulam dois dispositivos —
que é o que "sair de todos os dispositivos" precisa para ser testado de verdade.

Estrutura sugerida: `unit/` (lógica pura), `integration/` (Postgres real),
`api/` (supertest contra o app). A lista de comportamentos que valem um teste
está no README do lab, na seção "Como saber que terminou".
