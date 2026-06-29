/* ============================================================
   EstudaMais — modelo de configuração do cliente
   ------------------------------------------------------------
   Como o app é estático (sem bundler/servidor), as variáveis do .env
   não podem ser lidas em tempo de execução. Este arquivo é o mecanismo
   client-side equivalente: copie-o para "config.js" (ignorado pelo git)
   e, se quiser, sobrescreva a configuração padrão do Firebase.

   - O index.html FUNCIONA SEM este arquivo: ele já traz a config do
     Firebase embutida como padrão. Use config.js apenas se precisar
     apontar para outro projeto Firebase sem editar o index.html.

   - A chave da OpenAI NÃO fica aqui (seria exposta a qualquer visitante).
     Ela é cadastrada no painel de Administrador do app e salva no
     Firestore (coleção "config"). Deixe OPENAI_API_KEY vazio.
   ============================================================ */
window.CONFIG = {
  FIREBASE: {
    apiKey: "AIzaSyDE5ikPdDSc0-olqnSlV1F1uKiOV-TCofk",
    authDomain: "estudamais-5cb1b.firebaseapp.com",
    projectId: "estudamais-5cb1b",
    storageBucket: "estudamais-5cb1b.firebasestorage.app",
    messagingSenderId: "638423075835",
    appId: "1:638423075835:web:9d1cbf3be714fa20a2595e",
    measurementId: "G-1K93EM8LZ9"
  },
  // Deixe vazio: a chave da OpenAI é configurada no painel Admin (Firestore).
  OPENAI_API_KEY: ""
};
