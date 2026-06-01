// ─── HAPTICS ──────────────────────────────────────────────────────────
// Wraps Web Vibration API. Patterns are named for intent.
// On iPad Safari, vibration support is limited — this degrades gracefully.
// Architecture is ready for native haptic bridge (Capacitor, etc.) later.

const supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

function vibrate(pattern) {
  if (!supported) return;
  try { navigator.vibrate(pattern); } catch (_) {}
}

export const haptics = {
  /** Light tap — start, minor confirm */
  light() { vibrate(10); },

  /** Medium tap — pause, edit open */
  medium() { vibrate(20); },

  /** Completion — two pulses */
  complete() { vibrate([20, 60, 30]); },

  /** Preset switch — single medium */
  presetSwitch() { vibrate(18); },

  /** Error / denied */
  error() { vibrate([10, 40, 10]); },
};
