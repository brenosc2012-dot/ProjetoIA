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
- Não há testes automatizados nem passo de compilação.

## Validar alterações no JavaScript

O JS fica embutido em `<script>...</script>`. Para checar a sintaxe sem abrir o navegador:

```bash
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const m=h.match(/<script>([\s\S]*)<\/script>/);fs.writeFileSync('_check.js',m[1]);" && node --check _check.js && echo OK && rm -f _check.js
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
- **D) UI DO ALUNO** — `render()` central + telas: `home`, `lessons`, `content`,
  `exercise`, `done`, `profile`. Estado em `State` e sessão de exercícios em `Sess`.
- **E) UI DO PROFESSOR** — login por senha, abas (lições / editor / progresso),
  CRUD de lições/exercícios, e o painel de **geração por IA**.
- **F) INICIALIZAÇÃO** — objeto público `window.App` (todos os handlers chamados via
  `onclick="App.x()"`) e o boot (`loadData()`, `loadProfile()`, `loadIA()`, `render()`).

## Conceitos-chave

### Renderização
- A UI é redesenhada via `render()`, que troca o `innerHTML` de `#app` conforme
  `State.tela`. Não há framework nem virtual DOM — strings de template literais.
- Handlers são expostos em `window.App` e chamados por `onclick="App.metodo(...)"`.
- Como o `innerHTML` é recriado a cada `render()`, **inputs de texto não usam `oninput`
  que re-renderiza** (perderia o foco). Título/texto da lição são lidos sob demanda por
  `syncTextInputs()` antes de qualquer re-render.

### Persistência (localStorage)
Quatro chaves (todas criadas no boot se não existirem):

| Chave | Conteúdo |
|---|---|
| `estudamais_dados_v2` | Lições e exercícios (`DATA`) |
| `estudamais_perfil_v1` | Progresso do aluno (`PROFILE`: XP, níveis, streak, medalhas, som) |
| `estudamais_ia_v1` | Config da IA (`IA`: `{apiKey, modo}`) — **não** versionada |
| `estudamais_dados_v1` | Versão antiga (legado; ignorada) |

- `localStorage` é **por navegador e por origem** (`file://` ≠ `http://127.0.0.1:5500`).
  Os dados não acompanham o arquivo `index.html` ao movê-lo/copiá-lo.
- Bump de `STORAGE_KEY` (ex.: `_v1` → `_v2`) descarta as lições antigas e recria os
  exemplos. Faça isso conscientemente.

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
- Fluxo: `gerarExerciciosIA()` monta o prompt → `fetch` → `parseExerciciosIA()`
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
