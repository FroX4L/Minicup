const CACHE = "minicup-offline-v9";

/** Images / sons stables — pas le JS/CSS versionnés (réseau d'abord) */
const PRECACHE = [
  "./ball.png",
  "./bg.png",
  "./cage.png",
  "./hitbox_bg.png",
  "./hitbox_cage.png",
  "./tribune_01.png",
  "./tribune_02.png",
  "./pion_01.png",
  "./pion_02.png",
  "./pion_03.png",
  "./pion_04.png",
  "./pion_05.png",
  "./pion_06.png",
  "./Gardien_walk_bas1.png",
  "./Gardien_walk_bas2.png",
  "./Gardien_head_idle.png",
  "./Gardien_head_souriant.png",
  "./Gardien_head_anxious.png",
  "./Gardien_head_laugh1.png",
  "./Gardien_head_laugh2.png",
  "./Gardien_head_laugh3.png",
  "./Gardien_head_laugh4.png",
  "./Gardien_Goal_hit.png",
  "./Gardien_laugh_bas.png",
  "./Gardien_win1.png",
  "./Gardien_win2.png",
  "./kick.mp3",
  "./filet.mp3",
  "./lose.mp3",
  "./laugh.mp3",
  "./stop.mp3",
  "./metal1.mp3",
  "./metal2.mp3",
  "./win1.mp3",
  "./win2.mp3",
  "./win3.mp3",
  "./win4.mp3",
  "./manifest.webmanifest",
];

function isFreshCode(url) {
  const p = url.pathname;
  return (
    p.endsWith("/") ||
    p.endsWith(".html") ||
    p.endsWith(".js") ||
    p.endsWith(".css") ||
    p.endsWith("sw.js")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => {})))
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML / JS / CSS : réseau d'abord (évite le lag / vieux code après un push)
  if (req.mode === "navigate" || isFreshCode(url)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match("./index.html"))
        )
    );
    return;
  }

  // Images / sons : cache d'abord, refresh en arrière-plan
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            caches.open(CACHE).then((c) => c.put(req, res.clone()));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
