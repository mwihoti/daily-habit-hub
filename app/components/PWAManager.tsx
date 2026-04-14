'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker silently in the background.
 * If the user has already granted Notification permission, it
 * re-syncs the push subscription so it stays valid after SW updates.
 *
 * Render this once inside RootLayout — it returns null (no UI).
 */
export function PWAManager() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async (reg) => {
        // Re-subscribe automatically if permission was previously granted
        if ('PushManager' in window && Notification.permission === 'granted') {
          const existing = await reg.pushManager.getSubscription();
          if (existing) {
            // Refresh the subscription on the server in case it rotated
            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(existing.toJSON()),
            }).catch(() => {});
          }
        }
      })
      .catch((err) => console.warn('[SW] Registration failed:', err));
  }, []);

  return null;
}
