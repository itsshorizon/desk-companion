// ─── TIMER ENGINE ────────────────────────────────────────────────────
// requestAnimationFrame loop. Drives all timer countdowns.
// Drift-corrected using performance.now().
// Calls back into appState to trigger completion logic.

import { appState } from '../state/index.svelte.js';
import { haptics } from '../utils/haptics.js';

let rafId = null;
let running = false;

function tick() {
  const now = performance.now();

  for (const [timerId, rt] of Object.entries(appState.runtime)) {
    if (rt.status !== 'running' && rt.status !== 'overtime') continue;

    const lastTick = rt.lastTickAt ?? now;
    const elapsed = (now - lastTick) / 1000;
    rt.lastTickAt = now;

    if (rt.status === 'running') {
      rt.remaining -= elapsed;

      if (rt.remaining <= 0) {
        // Transition to overtime — engine owns the status change here
        const overshoot = Math.abs(rt.remaining);
        rt.remaining  = 0;
        rt.overtime   = overshoot;
        rt.status     = 'overtime';
        rt.lastTickAt = now;
        haptics.complete();
        // Record session completion without touching runtime status
        appState.recordAutoComplete(timerId);
      }
    } else if (rt.status === 'overtime') {
      rt.overtime += elapsed;
      // Keep session overtime updated periodically
      if (rt.sessionId) {
        // Batch update — only write to storage every ~5s to avoid thrash
        // We update the in-memory session; storage flush happens on pause/complete/hide
        const sessions = appState.sessions;
        const idx = sessions.findIndex(s => s.id === rt.sessionId);
        if (idx !== -1 && sessions[idx]) {
          sessions[idx] = { ...sessions[idx], overtimeSec: rt.overtime };
        }
      }
    }
  }

  rafId = requestAnimationFrame(tick);
}

export function startEngine() {
  if (running) return;
  running = true;
  rafId = requestAnimationFrame(tick);
}

export function stopEngine() {
  running = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
