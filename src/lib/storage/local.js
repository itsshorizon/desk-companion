// ─── LOCAL STORAGE ADAPTER ────────────────────────────────────────────
// Implements the storage interface using localStorage.
// Swap this for a CloudAdapter in the future without touching state logic.

const PREFIX = 'dc_';

function key(k) { return PREFIX + k; }

export const localAdapter = {
  get(k, fallback = null) {
    try {
      const raw = localStorage.getItem(key(k));
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(k, value) {
    try {
      localStorage.setItem(key(k), JSON.stringify(value));
    } catch (e) {
      console.warn('[storage] write failed:', e);
    }
  },

  remove(k) {
    try { localStorage.removeItem(key(k)); } catch {}
  },

  clear() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  },
};
