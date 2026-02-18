/**
 * Offline Asset Caching Strategy (T081)
 *
 * Strategy overview:
 * - Cache-first for static assets (JS, CSS, images, fonts):
 *     Check the cache first; fall back to network only on a cache miss.
 *     Updates happen in the background (stale-while-revalidate pattern).
 *     This ensures fast loads when offline or on slow connections.
 *
 * - Network-first for API requests (/api/*):
 *     Always attempt the network first so the UI gets fresh data.
 *     Fall back to a cached response only when the network is unavailable.
 *     This prevents serving stale data while still allowing offline reads.
 *
 * This service worker file (sw.ts) is compiled separately and served at /sw.js.
 * It is NOT imported by the main application bundle — it runs in its own SW context.
 */

declare const self: ServiceWorkerGlobalScope;

const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

const STATIC_ASSET_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ico'];

function isStaticAsset(url: URL): boolean {
  return STATIC_ASSET_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
}

function isApiRequest(url: URL): boolean {
  return url.pathname.startsWith('/api/');
}

// --- Install: pre-cache the app shell ---
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache =>
      cache.addAll([
        '/',
        '/manifest.json',
      ]),
    ),
  );
  // Take control immediately without waiting for existing tabs to close
  self.skipWaiting();
});

// --- Activate: clean up old caches ---
self.addEventListener('activate', (event: ExtendableEvent) => {
  const currentCaches = [STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => !currentCaches.includes(name))
          .map(name => caches.delete(name)),
      ),
    ),
  );
  // Take control of all open clients
  self.clients.claim();
});

// --- Fetch: route requests to the correct strategy ---
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  if (isApiRequest(url)) {
    // Network-first for API requests
    event.respondWith(networkFirst(event.request, API_CACHE));
  } else if (isStaticAsset(url)) {
    // Cache-first for static assets
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
  }
  // All other requests (e.g., HTML navigation) fall through to the browser default
});

/**
 * Cache-first strategy.
 * Returns cached response if available; otherwise fetches from the network
 * and caches the result for future requests.
 */
async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

/**
 * Network-first strategy.
 * Attempts to fetch from the network first; falls back to the cache
 * if the network is unavailable (TypeError) or returns a non-2xx response.
 */
async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Propagate the network error if no cache entry exists
    throw new Error(`Network request failed and no cached response available for ${request.url}`);
  }
}
