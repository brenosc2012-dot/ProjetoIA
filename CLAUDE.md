# CLAUDE.md

Guia para o Claude Code trabalhar neste repositório.

## Visão geral

**EstudaMais** é um app web de estudos **gamificado** para crianças de ~10 anos
(5º ano do Ensino Fundamental, Sistema de Ensino Positivo), inspirado no Duolingo.
Disciplinas: Matemática, Português, Artes, Filosofia, Redação, Geografia, História,
Ciências e Inglês.

O projeto é **um único arquivo**: `index.html`. Não há build, dependências, frameworks
nem CDNs externos. HTML + CSS + JavaScript puro (vanilla), tudo inline. Funciona
offline após o primeiro carregamento.

## Como rodar

- Abra `index.html` diretamente no navegador (duplo clique) **ou** use um servidor
  estático (ex.: Live Server do VS Code).
- **Importante:** após editar, recarregue com **Ctrl+Shift+R** (hard reload) — o
  navegador costuma servir a versão em cache do arquivo.
- **Requer internet** para carregar o Firebase (CDN) e as lições do Firestore. Os
  recursos de IA também exigem rede. O resto (gamificação/progresso) é local.
- Não há testes automatizados nem passo de compilação.

## Validar alterações no JavaScript

O JS fica embutido no **último** bloco `<script>...</script>` (há também 2 `<script src>`
do Firebase, sem conteúdo inline). Para checar a sintaxe sem abrir o navegador:

```bash
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const b=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];fs.writeFileSync('_check.js',b[b.length-1][1]);" && node --check _check.js && echo OK && rm -f _check.js
```

Sempre rode isso após mexer no JavaScript.

## Estrutura do `index.html`

O CSS e o JS são organizados em seções comentadas. No JavaScript (dentro de uma IIFE
`(function(){ "use strict"; ... })()`):

- **A) DADOS** — `PASSWORD`, chaves do localStorage, `SUBJECTS` (disciplinas) e
  `seedData()` (conteúdo de exemplo: 3 lições por disciplina).
- **B) ESTADO & UTILITÁRIOS** — `DATA`, `PROFILE`, `IA`; `uid`, `esc`, `norm`, `toast`,
  `mascot` (SVG), módulo `Sound` (Web Audio API), load/save do localStorage.
- **C) GAMIFICAÇÃO** — XP, vidas, streak, níveis (`concederRecompensa`), e medalhas
  (`ACHIEVEMENTS`, `verificarMedalhas`, `statsProgresso`).
- **D) UI DO ALUNO** — `render()` central + telas: `home`, `lessons`, `study`,
  `exercise`, `explain`, `done`, `profile`. Estado em `State` e sessão de exercícios
  em `Sess`. A tela `study` mostra um **resumo gerado por IA** antes dos exercícios
  (botão liberado após contagem de 10s, com cache por sessão em `resumoCache`); ao
  errar, a tela `explain` mostra uma **explicação gerada por IA**.
- **E) UI DO PROFESSOR** — login por senha, abas (lições / editor / progresso),
  CRUD de lições/exercícios, e o painel de **geração por IA**.
- **F) INICIALIZAÇÃO** — objeto público `window.App` (todos os handlers chamados via
  `onclick="App.x()"`) e o `boot()` **assíncrono** (`loadProfile()`, `loadIA()`,
  `initFirebase()`, `await loadLicoes()`, `render()`), com tela de carregamento e de
  erro de conexão (`mostrarCarregando` / `mostrarErroConexao`, retry via `App.retryBoot`).

## Conceitos-chave

### Renderização
- A UI é redesenhada via `render()`, que troca o `innerHTML` de `#app` conforme
  `State.tela`. Não há framework nem virtual DOM — strings de template literais.
- Handlers são expostos em `window.App` e chamados por `onclick="App.metodo(...)"`.
- Como o `innerHTML` é recriado a cada `render()`, **inputs de texto não usam `oninput`
  que re-renderiza** (perderia o foco). Título/texto da lição são lidos sob demanda por
  `syncTextInputs()` antes de qualquer re-render.

### Persistência

**Lições → Firebase Firestore.** As lições do professor ficam na coleção `licoes`
do Firestore (projeto `estudamais-5cb1b`). O Firebase é carregado por **CDN compat**
(`firebase-app-compat.js` + `firebase-firestore-compat.js`, sem bundler/import) e
inicializado em `initFirebase()` → `db = firebase.firestore()` (com `enablePersistence`
best-effort para cache offline).

- Documento Firestore: `{ disciplina, titulo, conteudo, exercicios, criadoEm, resumoIA, explicacoes }`.
- Lição interna no app: `{ id, titulo, texto, exercicios, resumoIA, explicacoes }`
  (note: `conteudo`↔`texto`, `id` = id do documento). Conversão em `licaoDeDoc()`.
- **Conteúdo de IA é persistido no Firestore para compartilhar entre dispositivos:**
  `resumoIA` (resumo de estudo, string) e `explicacoes` (mapa `{exId: texto}` das
  explicações de erro). Gerado uma vez por qualquer aparelho e salvo no doc; os demais
  usam o salvo (sem nova chamada à IA e sem precisar da chave naquele aparelho).
  `saveLesson()` invalida ambos ao editar (`resumoIA:""` + `explicacoes` via
  `FieldValue.delete()`), pois o material pode ter mudado.
- `pregerarExplicacoes(l)` roda em segundo plano ao abrir a lição **num aparelho com
  a chave** e gera/salva a explicação de TODAS as questões que ainda não têm uma, para
  que dispositivos sem a chave (ex.: o celular) encontrem a explicação pronta ao errar.
- `ouvirLicoes()` registra um **listener em tempo real** (`onSnapshot`) na coleção:
  `construirDATA(snap)` reagrupa em `DATA[disciplina]` e `aoAtualizarLicoes()`
  re-renderiza quando a tela é segura (home/lessons/profile/teacher-licoes), para que
  mudanças feitas em **qualquer dispositivo** apareçam ao vivo. A Promise resolve no
  primeiro snapshot (para o boot). Se a coleção estiver vazia na 1ª vez (e `SEED_FLAG`
  não setado no navegador), `seedFirestore()` popula os 27 exemplos uma vez.
- CRUD do professor é **assíncrono** e grava no Firestore: `saveLesson()`
  (`add`/`set merge`), `deleteLesson()` (`delete`), atualizando `DATA` local em seguida.
- ⚠️ **Regras do Firestore:** o app é client-only; o projeto precisa ter regras que
  permitam leitura/escrita na coleção `licoes` (modo de teste ou regras adequadas),
  senão o boot cai na tela de erro de conexão.

**localStorage** — apenas dados locais do aluno/dispositivo:

| Chave | Conteúdo |
|---|---|
| `estudamais_perfil_v1` | Progresso do aluno (`PROFILE`: XP, níveis, streak, medalhas, som) |
| `estudamais_ia_v1` | Config da IA (`IA`: `{apiKey, modo}`) |
| `estudamais_seed_firestore` | Flag: exemplos já semeados no Firestore por este navegador |

- `localStorage` é por navegador/origem; o progresso não sincroniza entre dispositivos
  (apenas as lições, que vivem no Firestore).
- O id da lição agora é o id do documento Firestore — `PROFILE.licoesConcluidas`
  guarda esses ids; progresso anterior (ids antigos) não casa com as lições novas.

### Modelo de dados
- Disciplina: objeto em `SUBJECTS` com `{id, nome, icon, cor}`.
- Lição: `{id, titulo, texto, exercicios:[...]}` em `DATA[subjId]`.
- Exercício: `{id, tipo, enunciado, ...}` onde `tipo`:
  - `"mc"` (múltipla escolha): `opcoes:[...]`, `correta:<índice>`
  - `"vf"` (verdadeiro/falso): `opcoes:["Verdadeiro","Falso"]`, `correta:0|1`
  - `"fill"` (completar lacuna): `resposta:"<texto>"` (correção via `norm()`,
    ignora acentos/maiúsculas)

### Gamificação
- `XP_POR_NIVEL=50`, `XP_POR_ACERTO=10`, `XP_BONUS_LICAO=20`.
- 3 vidas (corações) por sessão; zerar → tela de "game over".
- Streak diário baseado em `Date`. Medalhas em `ACHIEVEMENTS` desbloqueiam ao concluir
  lições (`verificarMedalhas`).

### Som
- `Sound` usa a **Web Audio API** (sem arquivos). Só inicializa após o primeiro toque
  do usuário (regra dos navegadores). Liga/desliga no perfil (`PROFILE.som`).

### Layout / rolagem
- App-shell de **altura fixa**: `#app { height:100dvh; overflow:hidden }`. A rolagem
  acontece dentro de `.content` (e `.celebrate`). Para a rolagem flex funcionar, esses
  contêineres precisam de **`min-height:0`** — não remova isso.
- Mobile-first: `max-width:480px` centralizado, botões ≥48px, fontes ≥16px.

## Geração de exercícios por IA

- Provedor atual: **Groq** (compatível com a API da OpenAI).
  - Endpoint: `https://api.groq.com/openai/v1/chat/completions`
  - Modelo: `llama-3.1-8b-instant`
  - Auth: header `Authorization: Bearer <chave>`
  - Resposta extraída de `data.choices[0].message.content`.
- Helper compartilhado: `chamarIA(prompt)` faz o `fetch` e devolve o texto (lança
  `Error` em falha). Usado por três fluxos:
  1. **Gerar exercícios** (professor) — `gerarExerciciosIA()`.
  2. **Resumo de estudo** (aluno) — `openLesson()` gera o resumo; cache em `resumoCache`;
     fallback para o texto original do professor se não houver chave ou der erro.
  3. **Explicação ao errar** (aluno) — `gerarExplicacao()`; fallback para uma mensagem
     padrão acolhedora.
- Fluxo de exercícios: `gerarExerciciosIA()` monta o prompt → `chamarIA` → `parseExerciciosIA()`
  (limpa cercas ```` ```json ````, faz `JSON.parse`, mapeia
  `multipla_escolha→mc` / `verdadeiro_falso→vf` / `completar_lacunas→fill`,
  e `acharIndiceCorreto()` resolve a opção correta por texto ou letra A/B/C/D).
- O professor cola a chave no painel (⚙️), salva em `IA.apiKey`; chave gratuita em
  `console.groq.com`. Há estados de loading e tratamento de erro (401/429/rede).
- Histórico de provedores já usados: Anthropic → Google Gemini → **Groq** (atual).
  Para trocar de provedor, ajuste `IA_MODELO`, `IA_ENDPOINT`, o `fetch`/headers e a
  extração da resposta em `gerarExerciciosIA`, além dos textos do painel (`iaPanel`).

## Segurança

- A chave da IA fica em texto no `localStorage` e aparece nas requisições do navegador.
  Aceitável para uso local/familiar; **não** publicar o `index.html` com a chave em site
  público. Para produção, o ideal seria um proxy backend guardando a chave.
- A senha do professor (`professor123`) está hardcoded em `PASSWORD` — é uma barreira
  simples, não segurança real.

## Convenções

- Código e textos de UI em **português (pt-BR)**.
- Comentários por seção; mantenha a densidade/idioma do código existente.
- Tudo em um arquivo — não introduza arquivos JS/CSS externos nem dependências sem
  pedido explícito.
- Sempre escape conteúdo do usuário com `esc()` ao montar HTML.
