// ─── CENTRAL APP STATE ────────────────────────────────────────────────
// Single source of truth. Uses Svelte 5 class runes.
// All persistence goes through the storage adapter — no raw localStorage calls elsewhere.

import { storage } from '../storage/index.js';
import { DEFAULT_PRESETS, DEFAULT_TIMERS, DEFAULT_ACTIVE_PRESET_ID } from '../../data/defaults.js';
import { generateId } from '../utils/uuid.js';
import { todayKey } from '../utils/time.js';

// ── Runtime state for a single timer ─────────────────────────────────
class TimerRuntime {
  status    = $state('idle');   // 'idle' | 'running' | 'paused' | 'complete' | 'overtime'
  remaining = $state(0);        // seconds remaining (counts down)
  overtime  = $state(0);        // seconds past zero (counts up)
  lastTickAt = $state(null);    // performance.now() of last tick
  sessionId = $state(null);     // active TimerSession id
}

// ── Main app state class ──────────────────────────────────────────────
class AppState {
  // — Persistent data —
  presets  = $state([]);
  timers   = $state({});    // { [id]: Timer }
  sessions = $state([]);    // TimerSession[]

  // — UI state —
  activePresetId        = $state(null);
  colorScheme           = $state('system');  // 'system' | 'light' | 'dark'
  editingTimerId        = $state(null);
  showPresetPrompt      = $state(false);
  pendingPresetId       = $state(null);

  // — Runtime (not persisted long-term) —
  runtime = $state({});   // { [timerId]: TimerRuntime }

  // ── Derived ──────────────────────────────────────────────────────
  activePreset = $derived(
    this.presets.find(p => p.id === this.activePresetId) ?? null
  );

  activeTimers = $derived(
    this.activePreset
      ? this.activePreset.timerIds.map(id => this.timers[id]).filter(Boolean)
      : []
  );

  resolvedTheme = $derived.by(() => {
    if (this.colorScheme !== 'system') return this.colorScheme;
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  anyRunning = $derived(
    Object.values(this.runtime).some(r => r.status === 'running' || r.status === 'overtime')
  );

  // ── Init ─────────────────────────────────────────────────────────
  init() {
    const now = new Date().toISOString();

    // Load presets
    const savedPresets = storage.get('presets');
    if (savedPresets?.length) {
      this.presets = savedPresets;
    } else {
      this.presets = DEFAULT_PRESETS.map(p => ({ ...p, createdAt: now, updatedAt: now }));
      storage.set('presets', this.presets);
    }

    // Load timers
    const savedTimers = storage.get('timers');
    if (savedTimers && Object.keys(savedTimers).length) {
      this.timers = savedTimers;
    } else {
      this.timers = Object.fromEntries(
        Object.entries(DEFAULT_TIMERS).map(([k, v]) => [k, { ...v, createdAt: now, updatedAt: now }])
      );
      storage.set('timers', this.timers);
    }

    // Load sessions
    this.sessions = storage.get('sessions') ?? [];

    // Load preferences
    this.colorScheme = storage.get('colorScheme') ?? 'system';

    // Load active preset
    const savedActive = storage.get('activePresetId');
    this.activePresetId = savedActive ?? DEFAULT_ACTIVE_PRESET_ID;

    // Restore runtime state (handles page refresh during active timers)
    const savedRuntime = storage.get('runtimeSnapshot');
    this._initRuntime(savedRuntime);

    // Save runtime on page hide
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this._snapshotRuntime();
    });
  }

  _initRuntime(snapshot) {
    const now = performance.now();
    const nowMs = Date.now();

    // Initialize runtime for all known timers
    for (const id of Object.keys(this.timers)) {
      const rt = new TimerRuntime();
      const timer = this.timers[id];
      rt.remaining = timer.durationSec;

      // Restore from snapshot if it exists
      if (snapshot?.[id]) {
        const s = snapshot[id];
        rt.status    = s.status;
        rt.overtime  = s.overtime ?? 0;
        rt.sessionId = s.sessionId ?? null;

        if (s.status === 'running') {
          // Calc elapsed since snapshot
          const elapsedSec = (nowMs - s.snapshotMs) / 1000;
          const remaining = (s.remaining ?? timer.durationSec) - elapsedSec;
          if (remaining <= 0) {
            rt.status   = 'overtime';
            rt.remaining = 0;
            rt.overtime  = (s.overtime ?? 0) + Math.abs(remaining);
          } else {
            rt.remaining  = remaining;
            rt.lastTickAt = now;
          }
        } else {
          rt.remaining = s.remaining ?? timer.durationSec;
        }
      }

      this.runtime[id] = rt;
    }
  }

  _snapshotRuntime() {
    const snapshot = {};
    const nowMs = Date.now();
    for (const [id, rt] of Object.entries(this.runtime)) {
      snapshot[id] = {
        status:     rt.status,
        remaining:  rt.remaining,
        overtime:   rt.overtime,
        sessionId:  rt.sessionId,
        snapshotMs: nowMs,
      };
    }
    storage.set('runtimeSnapshot', snapshot);
  }

  // ── Timer actions ─────────────────────────────────────────────────
  startTimer(timerId) {
    const rt = this.runtime[timerId];
    const timer = this.timers[timerId];
    if (!rt || !timer) return;

    if (rt.status === 'idle' || rt.status === 'paused') {
      // Create or reuse session
      if (!rt.sessionId) {
        const session = {
          id:        generateId(),
          timerId,
          presetId:  this.activePresetId,
          date:      todayKey(),
          startedAt: new Date().toISOString(),
          completedAt: null,
          manuallyCompleted: false,
          overtimeSec: 0,
          pauses: [],
        };
        this.sessions = [...this.sessions, session];
        storage.set('sessions', this.sessions);
        rt.sessionId = session.id;
      } else {
        // Closing a pause event
        this._closePause(rt.sessionId);
      }
      rt.status    = 'running';
      rt.lastTickAt = performance.now();
    }
  }

  pauseTimer(timerId) {
    const rt = this.runtime[timerId];
    if (!rt || (rt.status !== 'running' && rt.status !== 'overtime')) return;

    rt.status = 'paused';

    // Record pause event in session
    if (rt.sessionId) {
      this.sessions = this.sessions.map(s => {
        if (s.id !== rt.sessionId) return s;
        return { ...s, pauses: [...s.pauses, { pausedAt: new Date().toISOString(), resumedAt: null }] };
      });
      storage.set('sessions', this.sessions);
    }
  }

  completeTimer(timerId, manual = false) {
    const rt = this.runtime[timerId];
    if (!rt) return;

    rt.status    = 'complete';
    rt.remaining = 0;

    this._recordCompletion(timerId, manual);
  }

  // Records session completion without touching runtime status.
  // Called by the engine when the countdown hits zero (engine manages its own status).
  recordAutoComplete(timerId) {
    this._recordCompletion(timerId, false);
  }

  _recordCompletion(timerId, manual) {
    const rt = this.runtime[timerId];
    if (!rt?.sessionId) return;
    const now = new Date().toISOString();
    this.sessions = this.sessions.map(s => {
      if (s.id !== rt.sessionId) return s;
      return { ...s, completedAt: now, manuallyCompleted: manual, overtimeSec: rt.overtime };
    });
    storage.set('sessions', this.sessions);
  }

  resetTimer(timerId) {
    const rt = this.runtime[timerId];
    const timer = this.timers[timerId];
    if (!rt || !timer) return;

    rt.status    = 'idle';
    rt.remaining  = timer.durationSec;
    rt.overtime   = 0;
    rt.lastTickAt = null;
    rt.sessionId  = null;
  }

  tapTimer(timerId) {
    const rt = this.runtime[timerId];
    if (!rt) return;

    switch (rt.status) {
      case 'idle':
      case 'paused':
        this.startTimer(timerId);
        break;
      case 'running':
      case 'overtime':
        this.pauseTimer(timerId);
        break;
      // complete: do nothing on tap (long-press resets or marks overtime)
    }
  }

  _closePause(sessionId) {
    this.sessions = this.sessions.map(s => {
      if (s.id !== sessionId) return s;
      const pauses = s.pauses.map((p, i) =>
        i === s.pauses.length - 1 && !p.resumedAt
          ? { ...p, resumedAt: new Date().toISOString() }
          : p
      );
      return { ...s, pauses };
    });
    storage.set('sessions', this.sessions);
  }

  // ── Preset actions ────────────────────────────────────────────────
  requestPresetSwitch(presetId) {
    if (presetId === this.activePresetId) return;

    if (this.anyRunning) {
      this.pendingPresetId = presetId;
      this.showPresetPrompt = true;
    } else {
      this._applyPresetSwitch(presetId);
    }
  }

  confirmPresetSwitch(keepRunning) {
    if (!this.pendingPresetId) return;

    if (!keepRunning) {
      // Pause all running timers
      for (const [id, rt] of Object.entries(this.runtime)) {
        if (rt.status === 'running' || rt.status === 'overtime') {
          this.pauseTimer(id);
        }
      }
    }

    this._applyPresetSwitch(this.pendingPresetId);
    this.pendingPresetId = null;
    this.showPresetPrompt = false;
  }

  cancelPresetSwitch() {
    this.pendingPresetId = null;
    this.showPresetPrompt = false;
  }

  _applyPresetSwitch(presetId) {
    this.activePresetId = presetId;
    storage.set('activePresetId', presetId);

    // Init runtime for any timers in this preset that don't have one
    const preset = this.presets.find(p => p.id === presetId);
    if (preset) {
      for (const timerId of preset.timerIds) {
        if (!this.runtime[timerId]) {
          const rt = new TimerRuntime();
          rt.remaining = this.timers[timerId]?.durationSec ?? 0;
          this.runtime[timerId] = rt;
        }
      }
    }
  }

  // ── Timer CRUD ────────────────────────────────────────────────────
  updateTimer(timerId, changes) {
    const now = new Date().toISOString();
    const updated = { ...this.timers[timerId], ...changes, updatedAt: now };
    this.timers = { ...this.timers, [timerId]: updated };
    storage.set('timers', this.timers);

    // If duration changed and timer is idle, reset remaining
    if (changes.durationSec !== undefined) {
      const rt = this.runtime[timerId];
      if (rt && rt.status === 'idle') {
        rt.remaining = changes.durationSec;
      }
    }
  }

  addTimerToPreset(presetId) {
    const now = new Date().toISOString();
    const id = 't-' + generateId().slice(0, 8);
    const newTimer = {
      id, name: 'New Timer', iconKey: 'Timer', color: '#7B9E87',
      durationSec: 1800, createdAt: now, updatedAt: now,
    };
    this.timers = { ...this.timers, [id]: newTimer };

    // Init runtime
    const rt = new TimerRuntime();
    rt.remaining = newTimer.durationSec;
    this.runtime[id] = rt;

    this.presets = this.presets.map(p =>
      p.id === presetId ? { ...p, timerIds: [...p.timerIds, id], updatedAt: now } : p
    );

    storage.set('timers', this.timers);
    storage.set('presets', this.presets);

    return id;
  }

  removeTimerFromPreset(presetId, timerId) {
    const now = new Date().toISOString();
    this.presets = this.presets.map(p =>
      p.id === presetId
        ? { ...p, timerIds: p.timerIds.filter(id => id !== timerId), updatedAt: now }
        : p
    );
    storage.set('presets', this.presets);
  }

  // ── Preferences ───────────────────────────────────────────────────
  setColorScheme(scheme) {
    this.colorScheme = scheme;
    storage.set('colorScheme', scheme);
  }

  // ── Summary helpers ───────────────────────────────────────────────
  todaySessions() {
    const today = todayKey();
    return this.sessions.filter(s => s.date === today);
  }

  completedToday() {
    return this.todaySessions().filter(s => s.completedAt !== null);
  }

  streakDays() {
    const completed = new Set(
      this.sessions.filter(s => s.completedAt).map(s => s.date)
    );
    let streak = 0;
    const d = new Date();
    while (true) {
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (!completed.has(k)) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  // ── Reorder ───────────────────────────────────────────────────────
  reorderTimers(presetId, newTimerIds) {
    const now = new Date().toISOString();
    this.presets = this.presets.map(p =>
      p.id === presetId ? { ...p, timerIds: [...newTimerIds], updatedAt: now } : p
    );
    storage.set('presets', this.presets);
  }

  // ── Reset all ─────────────────────────────────────────────────────
  resetAllTimers() {
    const preset = this.activePreset;
    if (!preset) return;
    for (const timerId of preset.timerIds) {
      this.resetTimer(timerId);
    }
  }
}

export const appState = new AppState();
