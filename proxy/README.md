# Proxy da OpenAI — Cloudflare Worker (grátis)

Este proxy mantém a **chave da OpenAI no servidor** (não no navegador) e devolve
**CORS correto**, fazendo a geração de IA do EstudaMais funcionar de forma confiável.

## Por que precisa disso
A OpenAI **não envia cabeçalhos CORS nas respostas de erro** (401/429). Chamando
direto do navegador, um erro de chave/sem-créditos é **bloqueado pelo navegador** e
aparece como "Failed to fetch" (parece "sem internet"). O proxy resolve isso e ainda
**esconde a chave**.

## Passo a passo (≈5 min)

1. Crie uma conta grátis em **https://dash.cloudflare.com** (Workers & Pages).
2. **Create application → Create Worker** → dê um nome (ex.: `estudamais-ia`) → **Deploy**.
3. **Edit code**: apague o conteúdo padrão e cole o de [`cloudflare-worker.js`](./cloudflare-worker.js) → **Deploy**.
4. **Settings → Variables and Secrets**:
   - Adicione um **Secret** chamado `OPENAI_API_KEY` com sua chave `sk-...`
     (precisa de **créditos/billing** ativos em platform.openai.com).
   - (Opcional, recomendado) Adicione a variável `ALLOWED_ORIGIN` com
     `https://brenosc2012-dot.github.io` (restringe quem pode usar o proxy).
5. Copie a URL pública do Worker (algo como
   `https://estudamais-ia.SEU-SUBDOMINIO.workers.dev`).

## Ligar no app
1. Abra o app → **⚙️ Administrador** (senha `admin123`).
2. Cole a URL do Worker no campo **"URL do proxy"**.
3. **Deixe o campo da chave da OpenAI vazio** (a chave agora vive no Worker).
4. **Salvar configuração** → **🔌 Testar conexão com a IA** (deve dar "✅ Conexão OK").

Pronto: o app passa a chamar o proxy, sem expor a chave.

## Segurança / custo
- Defina `ALLOWED_ORIGIN` para o seu domínio para evitar que terceiros usem seu proxy.
- Coloque **limite de gasto** na conta da OpenAI (Billing → limits).
- O plano grátis do Cloudflare Workers cobre folgado o uso de uma turma/escola.
