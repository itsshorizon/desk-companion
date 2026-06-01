<script>
  import { formatDurationLabel } from '../../lib/utils/time.js';
  import { Plus, Minus } from '@lucide/svelte';

  let { value = 1800, onchange } = $props();

  // Duration steps in seconds
  const STEPS = [300, 600, 900, 1200, 1500, 1800, 2700, 3600, 5400, 7200, 10800];

  let currentIndex = $derived(
    (() => {
      const idx = STEPS.indexOf(value);
      if (idx !== -1) return idx;
      // Find nearest
      return STEPS.reduce((best, s, i) =>
        Math.abs(s - value) < Math.abs(STEPS[best] - value) ? i : best, 0);
    })()
  );

  function decrement() {
    const idx = Math.max(0, currentIndex - 1);
    onchange?.(STEPS[idx]);
  }

  function increment() {
    const idx = Math.min(STEPS.length - 1, currentIndex + 1);
    onchange?.(STEPS[idx]);
  }
</script>

<div class="duration-input" aria-label="Timer duration">
  <button
    class="step-btn"
    onclick={decrement}
    disabled={currentIndex === 0}
    aria-label="Decrease duration"
  >
    <Minus size={16} strokeWidth={2} />
  </button>

  <span class="duration-label" aria-live="polite">
    {formatDurationLabel(value)}
  </span>

  <button
    class="step-btn"
    onclick={increment}
    disabled={currentIndex === STEPS.length - 1}
    aria-label="Increase duration"
  >
    <Plus size={16} strokeWidth={2} />
  </button>
</div>

<style>
  .duration-input {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .duration-label {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 300;
    color: var(--text-primary);
    min-width: 64px;
    text-align: center;
    letter-spacing: 0.01em;
  }

  .step-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    border: 1px solid var(--border-soft);
    color: var(--text-secondary);
    cursor: pointer;
    transition:
      background   var(--dur-fast) var(--ease-out),
      color        var(--dur-fast) var(--ease-out),
      transform    var(--dur-fast) var(--ease-spring);
  }

  .step-btn:hover:not(:disabled) {
    background: var(--border-subtle);
    color: var(--text-primary);
    transform: scale(1.08);
  }

  .step-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }
</style>
