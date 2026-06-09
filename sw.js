const CACHE_NAME = 'habit-tracker-v4';

// 安装：缓存所有资源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                './',
                './habit-tracker.html',
                './manifest.json',
                './icon-192.png',
                './icon-512.png'
            ]);
        }).then(() => self.skipWaiting())
    );
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// 从缓存中查找 HTML 页面（宽松匹配）
function findHtmlInCache(cache) {
    return cache.keys().then(requests => {
        for (const req of requests) {
            if (req.url.includes('habit-tracker') && req.url.endsWith('.html')) {
                return cache.match(req);
            }
        }
        return null;
    });
}

// 请求拦截：缓存优先，回退到网络
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(resp => {
                if (resp.ok) {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return resp;
            }).catch(() => {
                // 离线时，HTML 请求返回缓存的首页
                const accept = event.request.headers.get('accept') || '';
                if (accept.includes('text/html')) {
                    return caches.open(CACHE_NAME).then(cache => findHtmlInCache(cache));
                }
            });
        })
    );
});
