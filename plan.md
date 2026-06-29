# Plano do Projeto — EstudaMais

App web de estudos gamificado para o 5º ano (Sistema Positivo), inspirado no Duolingo.
Arquivo único `index.html` (HTML + CSS + JS puro, sem build/dependências, offline-first).

> Documentação técnica de manutenção: ver `CLAUDE.md`.

## Objetivo

Permitir que uma criança de ~10 anos estude as 9 disciplinas de forma divertida
(XP, vidas, streak, níveis, medalhas) e que o professor/responsável cadastre conteúdo
com facilidade — manualmente ou com geração automática de exercícios por IA.

## Status atual — Concluído ✅

### Experiência do aluno
- [x] Tela inicial com seleção das 9 disciplinas (ícone + cor temática própria).
- [x] Lista de lições por disciplina.
- [x] Fluxo por lição: conteúdo (com rolagem) → "Iniciar Atividades" → exercícios em
      sequência com feedback imediato → tela de conclusão com confete (CSS).
- [x] Tipos de exercício: múltipla escolha, verdadeiro/falso, completar lacunas.
- [x] Gamificação: XP, 3 vidas (corações), streak diário, nível por disciplina,
      barra de progresso.
- [x] Sistema de medalhas/conquistas (11 medalhas).
- [x] Áudio de feedback (acerto/erro/celebração) via Web Audio API, com liga/desliga.
- [x] Perfil do aluno com progresso por disciplina e nome editável.

### Painel do professor
- [x] Área protegida por senha simples (`professor123`).
- [x] Cadastro de lições (disciplina, título, texto explicativo).
- [x] Cadastro/edição/exclusão de exercícios e lições.
- [x] Visualização do progresso do aluno por disciplina.
- [x] Geração automática de exercícios por IA (provedor **Groq**, gratuito).
- [x] **Tela de resumo por IA antes das atividades** (estudo), com barra de leitura e
      botão liberado após 10s; cache por sessão e fallback para o conteúdo original.
- [x] **Explicação automática por IA ao errar** uma questão, com tom acolhedor e
      fallback para mensagem padrão.

### Conteúdo e técnico
- [x] Conteúdo de exemplo pré-cadastrado (3 lições por disciplina = 27 lições).
- [x] **Lições no Firebase Firestore** (coleção `licoes`) — professor cria/edita/exclui
      na nuvem; aluno acessa de qualquer dispositivo. Tela de "Carregando lições..." e
      erro de conexão com retry. `localStorage` mantém só progresso/XP e config da IA.
- [x] Design mobile-first (max-width 480px, botões grandes, fontes legíveis).
- [x] Mascote "Estrelinha" em SVG e paleta própria (violeta), distinta do Duolingo.
- [x] Rolagem correta do app-shell (altura fixa + `min-height:0` nos contêineres).

### Histórico de decisões
- Provedor de IA evoluiu: Anthropic → Google Gemini → Groq → **OpenAI gpt-4o-mini** (atual).
- Recurso de exportar/importar backup `.json` foi **adicionado e depois removido** a
  pedido do usuário.

## Versão 2.0 — Multiusuário (Concluído ✅)

- [x] **Multi-faixa etária** (1º ano EF ao 3º ano EM); prompts da IA adaptados por
      ano/nível/idade do aluno (ou da lição, na geração).
- [x] **Contas de aluno e professor** (login/cadastro), senha com hash simples (SHA-256);
      sessão local persistida; progresso do aluno na nuvem (sincroniza entre aparelhos).
- [x] **Escopo de lições por turma/ano/nível** — aluno só vê as da sua turma/ano.
- [x] **15 exercícios em 3 níveis** (5F/5I/5D), em ordem crescente; XP 10/20/30.
- [x] **Painel de rendimento do professor** — ranking por XP, gráfico de barras CSS,
      lista de alunos com % e acertos, filtros por turma/disciplina/período (coleção `progresso`).
- [x] **Premiações** — medalhas automáticas + premiações personalizadas (CRUD do
      professor, coleção `premiacoes`/`premiacoes_alunos`), troféus no perfil do aluno.
- [x] **IA: OpenAI gpt-4o-mini**; chave compartilhada via Firestore (`config`), painel Admin.
- [x] **Cache `licoes_geradas`** — resumo/exercícios reaproveitados entre dispositivos;
      botão "Regenerar conteúdo com IA" no editor.
- [x] Chave da OpenAI lida só do Firestore (`config/openai.apiKey`, painel Admin); `firestore.rules` no repo. (O mecanismo `config.js`/`.env` foi removido — gerava 404 no GitHub Pages.)
- [x] Usabilidade: contador "Questão X/Y" + acertos, revisão de erros, login tolerante (nomeNorm), mostrar senha 👁️, pré-visualizar lição, leitura em voz alta (TTS), gestão de alunos (redefinir senha/remover).
- [x] **PWA**: `manifest.json` + `sw.js` (service worker) + `icon.svg`; instalável e abre offline (HTML em network-first; lições via cache do Firestore).

### Riscos/limitações da v2.0
- Auth por hash simples (sem Firebase Auth) + regras de Firestore abertas → dados
  legíveis; chave da OpenAI (paga) exposta. Aceitável só em contexto fechado.
- Senhas de barreira hardcoded: `ADMIN_PASSWORD` = `admin123`.

## Backlog / Possíveis próximos passos 🔭

Itens candidatos (nenhum confirmado ainda — priorizar conforme o uso real):

- [ ] **Seletor de modelo de IA** no painel (ex.: outros modelos do Groq) para o
      professor escolher/testar.
- [ ] **Regenerar exercício individual** (em vez de regenerar o conjunto todo).
- [ ] **Indicador "gerado por IA"** nos exercícios, para o professor revisar.
- [ ] **Tela dedicada de Conquistas** com progresso de cada medalha.
- [ ] **Sons adicionais** (subir de nível, abrir disciplina) e/ou música de fundo opcional.
- [ ] **Múltiplos perfis de aluno** (vários filhos/turmas no mesmo dispositivo).
- [ ] **Relatório de desempenho** mais detalhado para o responsável (acertos por lição,
      tempo, histórico).
- [ ] **Acessibilidade**: navegação por teclado, leitor de tela, alto contraste.
- [ ] **PWA**: manifest + service worker para "instalar" e garantir offline robusto.
- [ ] **Backend opcional (proxy de IA)** para não expor a chave no navegador, caso o app
      seja publicado.

## Restrições / princípios de design

- Manter **arquivo único** `index.html`, **sem bundler** (Firebase via CDN compat).
- **Mobile-first** e foco na **facilidade do professor** cadastrar conteúdo.
- Lições na nuvem (Firestore); progresso/XP local (localStorage).
- Textos e código em **português (pt-BR)**.
- Sempre validar a sintaxe do JS após mudanças (ver `CLAUDE.md`).

## Riscos conhecidos

- **Lições exigem internet** (Firestore + CDN do Firebase). Há cache offline best-effort
  (`enablePersistence`), mas o 1º carregamento precisa de rede.
- **Regras do Firestore** precisam permitir leitura/escrita em `licoes`; do contrário o
  app cai na tela de erro de conexão. A `apiKey` do Firebase no client é normal/pública,
  mas a segurança real depende das regras (hoje provavelmente em modo de teste).
- Progresso do aluno fica só no `localStorage` (por navegador/origem) — não sincroniza
  entre dispositivos e se perde ao limpar o navegador.
- Chave da IA (Groq) exposta no cliente — não publicar com a chave embutida.
- Senha do professor hardcoded — barreira simples, não é segurança real.
- Dependência de cota gratuita do provedor de IA (limites/erros 429).
