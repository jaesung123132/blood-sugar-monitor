// 혈당 도우미 서비스 워커
// - 같은 주소의 화면 파일(GET 요청)만 저장해 두었다가 인터넷이 끊겼을 때 보여 줍니다.
// - 항상 인터넷에서 먼저 받아 오므로(network-first) 새 버전이 바로 반영됩니다.
// - /api/ 요청과 다른 주소(데이터베이스 등)로 가는 요청은 절대 저장하지 않습니다(건강정보 보호).

const CACHE_NAME = 'bsm-shell-v1';
const SHELL_URLS = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }
  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = (await cache.match(request)) ?? (request.mode === 'navigate' ? await cache.match('/') : undefined);
    if (cached) {
      return cached;
    }
    throw error;
  }
}
