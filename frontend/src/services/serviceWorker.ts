/**
 * Service Worker registration.
 *
 * Registers the service worker for PWA offline support.
 * Must be called once at application startup (e.g. in index.tsx).
 */

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.info('[ServiceWorker] Registered:', registration.scope);
        })
        .catch(error => {
          console.error('[ServiceWorker] Registration failed:', error);
        });
    });
  }
}

export function unregisterServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error('[ServiceWorker] Unregister failed:', error);
      });
  }
}
