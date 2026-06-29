/* EstudaMais — Service Worker (PWA)
   Estratégia:
   - HTML/navegação: network-first (online sempre pega a versão fresca;
     offline cai no app shell em cache). Evita ficar preso em versão antiga.
   - Outros GET same-origin (manifest, ícone): stale-while-revalidate.
   - Cross-origin (Firebase/Firestore/CDN): não intercepta — vai direto à rede.
   Bump a versão do cache quando os assets em ASSETS mudarem. */
const CACHE = "estudamais-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (e)=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()).catch(()=>{})
  );
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", (e)=>{
  const req = e.request;
  if(req.method !== "GET") return;
  let url;
  try{ url = new URL(req.url); }catch(_){ return; }
  // só lida com o próprio domínio; Firebase/Firestore/CDN seguem direto à rede
  if(url.origin !== self.location.origin) return;

  // Navegação (abrir o app): network-first com fallback ao shell em cache
  if(req.mode === "navigate"){
    e.respondWith(
      fetch(req).then(resp=>{
        const cp = resp.clone();
        caches.open(CACHE).then(c=>c.put("./index.html", cp)).catch(()=>{});
        return resp;
      }).catch(()=> caches.match("./index.html").then(r=> r || caches.match("./")))
    );
    return;
  }

  // Demais assets same-origin: stale-while-revalidate
  e.respondWith(
    caches.match(req).then(cached=>{
      const net = fetch(req).then(resp=>{
        if(resp && resp.status === 200 && resp.type === "basic"){
          const cp = resp.clone();
          caches.open(CACHE).then(c=>c.put(req, cp)).catch(()=>{});
        }
        return resp;
      }).catch(()=> cached);
      return cached || net;
    })
  );
});
