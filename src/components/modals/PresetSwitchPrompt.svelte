<script>
  import { appState } from '../../lib/state/index.svelte.js';

  let pending = $derived(
    appState.presets.find(p => p.id === appState.pendingPresetId)
  );
</script>

<!-- Backdrop -->
<div class="backdrop" role="presentation"></div>

<!-- Dialog -->
<div class="prompt" role="alertdialog" aria-modal="true" aria-label="Timer is running">
  <p class="prompt-text">
    A timer is running. What would you like to do when switching to
    <strong>{pending?.name ?? 'this preset'}</strong>?
  </p>

  <div class="prompt-actions">
    <button
      class="btn btn-keep"
      onclick={() => appState.confirmPresetSwitch(true)}
    >
      Keep running
    </button>
    <button
      class="btn btn-pause"
      onclick={() => appState.confirmPresetSwitch(false)}
    >
      Pause timers
    </button>
    <button
      class="btn btn-cancel"
      onclick={() => appState.cancelPresetSwitch()}
    >
      Cancel
    </button>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.50);
    z-index: var(--z-modal);
    animation: fadeIn var(--dur-base) var(--ease-out);
  }

  .prompt {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: calc(var(--z-modal) + 1);
    background: var(--bg-elevated);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-xl);
    padding: var(--space-8) var(--space-8) var(--space-6);
    width: min(380px, 88vw);
    box-shadow: var(--shadow-lg);
    animation: slideUp var(--dur-base) var(--ease-out);
  }

  .prompt-text {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    font-weight: 300;
    color: var(--text-primary);
    line-height: 1.5;
    margin-bottom: var(--space-6);
    text-align: center;
  }

  .prompt-text strong {
    font-weight: 500;
  }

  .prompt-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .btn {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: 400;
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
    text-align: center;
  }

  .btn-keep {
    background: color-mix(in srgb, var(--text-primary) 90%, transparent);
    color: var(--text-inverse);
  }
  .btn-keep:hover { opacity: 0.9; }

  .btn-pause {
    background: var(--border-subtle);
    color: var(--text-primary);
  }
  .btn-pause:hover { background: var(--border-soft); }

  .btn-cancel {
    color: var(--text-tertiary);
    font-size: var(--text-sm);
    padding: var(--space-2) var(--space-4);
  }
  .btn-cancel:hover { color: var(--text-secondary); }

  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translate(-50%, calc(-50% + 12px)); opacity: 0; }
    to   { transform: translate(-50%, -50%);              opacity: 1; }
  }
</style>
