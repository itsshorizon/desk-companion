<script>
  import { appState } from '../../lib/state/index.svelte.js';
  import { haptics } from '../../lib/utils/haptics.js';

  let stage     = $state('idle');  // 'idle' | 'confirm'
  let countdown = $state(3);
  let timeout   = null;
  let interval  = null;

  function handleClick() {
    if (stage === 'idle') {
      stage     = 'confirm';
      countdown = 3;
      interval  = setInterval(() => {
        countdown--;
        if (countdown <= 0) cancel();
      }, 1000);
      timeout = setTimeout(cancel, 3200);
    } else {
      execute();
    }
  }

  function cancel() {
    stage = 'idle';
    clearTimeout(timeout);
    clearInterval(interval);
  }

  function execute() {
    cancel();
    haptics.medium();
    appState.resetAllTimers();
  }
</script>

<div class="reset-wrap">
  <button
    class="reset-btn"
    class:confirming={stage === 'confirm'}
    onclick={handleClick}
    onblur={cancel}
    aria-label={stage === 'confirm' ? 'Tap again to confirm reset' : 'Reset all timers'}
  >
    {#if stage === 'idle'}
      reset all
    {:else}
      tap again to confirm&ensp;({countdown})
    {/if}
  </button>
</div>

<style>
  .reset-wrap {
    position: absolute;
    bottom: 46px;     /* sits just above the scroll hint at bottom: 18px */
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none; /* don't block grid interactions */
  }

  .reset-btn {
    pointer-events: all;
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    cursor: pointer;
    background: none;
    border: none;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    transition:
      color      var(--dur-base) var(--ease-out),
      background var(--dur-base) var(--ease-out),
      opacity    var(--dur-base) var(--ease-out);
    white-space: nowrap;
  }

  .reset-btn:hover {
    color: var(--text-secondary);
    background: color-mix(in srgb, var(--text-primary) 6%, transparent);
  }

  /* Confirm state — slightly more present, still very subtle */
  .reset-btn.confirming {
    color: var(--text-secondary);
    background: color-mix(in srgb, var(--text-primary) 8%, transparent);
    animation: confirmPulse 1s ease-in-out infinite;
  }

  @keyframes confirmPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.7; }
  }
</style>
