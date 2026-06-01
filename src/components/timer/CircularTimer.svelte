<script>
  import TimerRing from './TimerRing.svelte';
  import TimerIcon from '../icons/TimerIcon.svelte';
  import { appState } from '../../lib/state/index.svelte.js';
  import { haptics } from '../../lib/utils/haptics.js';
  import { formatTime } from '../../lib/utils/time.js';

  let { timer, onLongPress, onDragStart, isDragSource = false } = $props();

  const LONG_PRESS_MS = 520;
  const DRAG_THRESHOLD = 8;   // px movement to trigger drag
  const DRAG_MIN_HOLD  = 150; // ms hold before drag can start

  let rt = $derived(appState.runtime[timer.id]);

  let progress = $derived.by(() => {
    if (!rt || timer.durationSec === 0) return 0;
    if (rt.status === 'complete' || rt.status === 'overtime') return 1;
    return 1 - (rt.remaining / timer.durationSec);
  });

  let displayTime = $derived.by(() => {
    if (!rt) return formatTime(timer.durationSec);
    if (rt.status === 'overtime') return formatTime(rt.overtime);
    if (rt.status === 'complete') return '0:00';
    return formatTime(rt.remaining);
  });

  let status     = $derived(rt?.status ?? 'idle');
  let isComplete = $derived(status === 'complete' || status === 'overtime');
  let isRunning  = $derived(status === 'running');
  let isPaused   = $derived(status === 'paused');
  let isIdle     = $derived(status === 'idle');

  // ── Interaction ───────────────────────────────────────────────────
  let pressTimer     = null;
  let longPressFired = false;
  let dragTookOver   = false;
  let isPointerDown  = false;  // true only between pointerdown and pointerup/cancel
  let pressStartX    = 0;
  let pressStartY    = 0;
  let pressStartMs   = 0;

  function onPointerDown(e) {
    isPointerDown  = true;
    longPressFired = false;
    dragTookOver   = false;
    pressStartX    = e.clientX;
    pressStartY    = e.clientY;
    pressStartMs   = Date.now();

    pressTimer = setTimeout(() => {
      if (dragTookOver) return;
      longPressFired = true;
      haptics.medium();
      onLongPress?.(timer.id);
    }, LONG_PRESS_MS);
  }

  function onPointerMove(e) {
    // Guard: only process movement when the pointer is actively pressed
    if (!isPointerDown || longPressFired || dragTookOver) return;
    const dx = e.clientX - pressStartX;
    const dy = e.clientY - pressStartY;
    if (
      Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD &&
      Date.now() - pressStartMs > DRAG_MIN_HOLD
    ) {
      clearTimeout(pressTimer);
      dragTookOver = true;
      onDragStart?.(timer.id, e);
    }
  }

  function onPointerUp(e) {
    isPointerDown = false;
    clearTimeout(pressTimer);
    if (!longPressFired && !dragTookOver) handleTap();
    dragTookOver = false;
  }

  function onPointerCancel() {
    isPointerDown = false;
    clearTimeout(pressTimer);
    dragTookOver = false;
  }

  function handleTap() {
    haptics.light();
    appState.tapTimer(timer.id);
  }
</script>

<button
  class="timer-card"
  class:is-idle={isIdle}
  class:is-running={isRunning}
  class:is-paused={isPaused}
  class:is-complete={isComplete}
  class:is-overtime={status === 'overtime'}
  class:is-drag-source={isDragSource}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerCancel}
  aria-label="{timer.name} timer, {status}"
  style="--accent: {timer.color};"
>
  <!-- Ring layer -->
  <div class="ring-wrap">
    <TimerRing {progress} color={timer.color} {status} />

    <!-- Center content overlaid on ring -->
    <div class="center-content">
      <div class="timer-icon" aria-hidden="true">
        <TimerIcon
          iconKey={timer.iconKey}
          size={24}
          color={isComplete ? timer.color : 'currentColor'}
          strokeWidth={1.75}
        />
      </div>

      <time class="time-display" datetime="">
        {#if status === 'overtime'}
          <span class="overtime-prefix">+</span>
        {/if}
        {displayTime}
      </time>

      <span class="timer-status-label">
        {#if isRunning}running{:else if isPaused}paused{:else if status === 'overtime'}overtime{:else if status === 'complete'}done{:else}&nbsp;{/if}
      </span>
    </div>
  </div>

  <!-- Timer name sits below ring, outside it -->
  <span class="timer-name">{timer.name}</span>
</button>

<style>
  /* ── No tile/card — the circle IS the element ── */
  .timer-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-2);
    background: transparent;
    border: none;
    cursor: pointer;
    transition:
      opacity   var(--dur-slow)  var(--ease-out),
      transform var(--dur-base)  var(--ease-spring);
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    width: 100%;
    aspect-ratio: 1;
    min-width: 0;
  }

  .timer-card:active {
    transform: scale(0.96);
  }

  .timer-card.is-complete {
    opacity: var(--timer-done-opacity);
  }

  .timer-card.is-overtime {
    opacity: 0.75;
  }

  /* Drag source — invisible placeholder holding the grid slot */
  .timer-card.is-drag-source {
    opacity: 0;
    pointer-events: none;
  }

  /* ── Ring wrap — controls rendered circle size ── */
  .ring-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(220px, 82%);
    aspect-ratio: 1;
  }

  .ring-wrap :global(svg) {
    width: 100%;
    height: 100%;
  }

  /* ── Center content overlaid on ring ── */
  .center-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    pointer-events: none;
    color: var(--text-primary); /* explicit — don't rely on inheritance chain */
  }

  /* ── Icon ── */
  .timer-icon {
    opacity: 0.80;
    transition: opacity var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
    line-height: 1;
    color: var(--text-primary);
  }
  .is-running  .timer-icon { opacity: 1; color: var(--accent); }
  .is-paused   .timer-icon { opacity: 0.70; }
  .is-complete .timer-icon { opacity: 0.9; }

  /* ── Time display ── */
  .time-display {
    font-family: var(--font-sans);
    font-size: clamp(1rem, 2.8vw, 1.55rem);
    font-weight: 300;
    letter-spacing: -0.025em;
    color: var(--text-primary);
    line-height: 1;
    display: flex;
    align-items: baseline;
    gap: 1px;
    transition: color var(--dur-base) var(--ease-out);
  }

  .is-overtime .time-display { color: var(--accent); }

  .overtime-prefix {
    font-size: 0.68em;
    opacity: 0.65;
  }

  /* ── Status label ── */
  .timer-status-label {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 400;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    transition: color var(--dur-base) var(--ease-out);
    min-height: 1em;
  }

  .is-running  .timer-status-label { color: var(--accent); opacity: 0.85; }
  .is-overtime .timer-status-label { color: var(--accent); }

  /* ── Timer name ── */
  .timer-name {
    font-family: var(--font-serif);
    font-size: clamp(0.80rem, 1.6vw, 1.05rem);
    font-weight: 400;
    letter-spacing: 0.015em;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.2;
    transition: color var(--dur-base) var(--ease-out);
  }

  .is-running  .timer-name  { color: var(--text-primary); }
  .is-complete .timer-name  { color: var(--text-tertiary); }
</style>
