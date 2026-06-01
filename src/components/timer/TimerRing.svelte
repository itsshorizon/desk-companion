<script>
  // ── TimerRing — SVG circular progress ring ──────────────────────────
  // progress: 0.0 (empty) → 1.0 (full)
  // color: accent hex string
  // status: 'idle' | 'running' | 'paused' | 'complete' | 'overtime'

  let { progress = 0, color = '#7B9E87', status = 'idle', size = 200 } = $props();

  const R = 44;           // radius
  const CX = 52;          // center x (viewBox 104×104)
  const CY = 52;          // center y
  const CIRCUMFERENCE = 2 * Math.PI * R;  // ≈ 276.46

  let dashOffset = $derived(CIRCUMFERENCE * (1 - Math.min(Math.max(progress, 0), 1)));

  // Glow/pulse for overtime
  let isOvertime  = $derived(status === 'overtime');
  let isComplete  = $derived(status === 'complete' || status === 'overtime');
  let isRunning   = $derived(status === 'running');
</script>

<svg
  viewBox="0 0 104 104"
  width={size}
  height={size}
  aria-hidden="true"
  class="timer-ring"
  class:is-running={isRunning}
  class:is-overtime={isOvertime}
>
  <!-- Outer subtle background circle -->
  <circle
    cx={CX} cy={CY} r={R}
    fill="none"
    stroke="var(--ring-track)"
    stroke-width="5"
    class="ring-track"
  />

  <!-- Progress arc — rotated to start at 12 o'clock -->
  <circle
    cx={CX} cy={CY} r={R}
    fill="none"
    stroke={color}
    stroke-width="5"
    stroke-linecap="round"
    stroke-dasharray={CIRCUMFERENCE}
    stroke-dashoffset={dashOffset}
    transform={`rotate(-90 ${CX} ${CY})`}
    class="ring-progress"
    class:animating={isRunning || isOvertime}
    style="--ring-color: {color};"
  />

  <!-- Overtime pulse dot at the top -->
  {#if isOvertime}
    <circle
      cx={CX} cy={CY - R}
      r="4"
      fill={color}
      class="overtime-dot"
    />
  {/if}
</svg>

<style>
  .timer-ring {
    flex-shrink: 0;
    overflow: visible;
  }

  .ring-track {
    transition: opacity 0.4s ease;
  }

  .ring-progress {
    transition:
      stroke-dashoffset 0.1s linear,
      stroke-width 0.3s var(--ease-out),
      opacity 0.4s ease;
    will-change: stroke-dashoffset;
  }

  /* Smooth completion fill */
  .ring-progress.animating {
    transition: stroke-dashoffset 0.08s linear;
  }

  /* Overtime pulse on the dot */
  .overtime-dot {
    animation: pulse 2s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: center;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1;   transform: scale(1);    }
    50%       { opacity: 0.3; transform: scale(0.75); }
  }
</style>
