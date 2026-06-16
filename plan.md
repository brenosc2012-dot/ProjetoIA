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
- [x] Persistência total via `localStorage`.
- [x] Design mobile-first (max-width 480px, botões grandes, fontes legíveis).
- [x] Mascote "Estrelinha" em SVG e paleta própria (violeta), distinta do Duolingo.
- [x] Rolagem correta do app-shell (altura fixa + `min-height:0` nos contêineres).

### Histórico de decisões
- Provedor de IA evoluiu: Anthropic → Google Gemini → **Groq** (atual), por causa de
  custo/cota gratuita.
- Recurso de exportar/importar backup `.json` foi **adicionado e depois removido** a
  pedido do usuário.

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

- Manter **arquivo único** `index.html`, **sem frameworks, sem CDNs externos**.
- **Offline-first**: deve funcionar sem internet após o primeiro carregamento
  (exceto a geração por IA, que exige rede).
- **Mobile-first** e foco na **facilidade do professor** cadastrar conteúdo.
- Textos e código em **português (pt-BR)**.
- Sempre validar a sintaxe do JS após mudanças (ver `CLAUDE.md`).

## Riscos conhecidos

- Dados ficam só no `localStorage` (por navegador/origem) — sem backup nativo no momento,
  risco de perda ao limpar o navegador ou trocar de dispositivo.
- Chave da IA exposta no cliente — não publicar com a chave embutida.
- Senha do professor hardcoded — barreira simples, não é segurança real.
- Dependência de cota gratuita do provedor de IA (limites/erros 429).
