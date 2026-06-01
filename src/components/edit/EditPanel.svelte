<script>
  // ── EditPanel ─────────────────────────────────────────────────────
  // Slides up from bottom when a timer is long-pressed.
  // Edits are applied immediately (live preview on the timer card).

  import ColorPicker from './ColorPicker.svelte';
  import IconPicker from './IconPicker.svelte';
  import DurationInput from './DurationInput.svelte';
  import TimerIcon from '../icons/TimerIcon.svelte';
  import { appState } from '../../lib/state/index.svelte.js';
  import { haptics } from '../../lib/utils/haptics.js';
  import { X, Trash2, Plus } from '@lucide/svelte';

  let { timerId, onclose } = $props();

  let timer = $derived(timerId ? appState.timers[timerId] : null);
  let activePresetId = $derived(appState.activePresetId);

  // Local draft — applied immediately on each field change for live preview
  function update(changes) {
    if (!timerId) return;
    appState.updateTimer(timerId, changes);
  }

  function handleClose() {
    haptics.light();
    onclose?.();
  }

  function handleDelete() {
    if (!confirm(`Remove "${timer?.name}" from this preset?`)) return;
    haptics.medium();
    appState.removeTimerFromPreset(activePresetId, timerId);
    onclose?.();
  }

  function handleAdd() {
    haptics.light();
    appState.addTimerToPreset(activePresetId);
  }

  let canDelete = $derived(
    appState.activePreset?.timerIds?.length > 1
  );

  let canAdd = $derived(
    (appState.activePreset?.timerIds?.length ?? 0) < 8
  );

  // Prevent background scroll when panel is open
  $effect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  });
</script>

<!-- Backdrop -->
<button
  class="backdrop-btn"
  onclick={handleClose}
  aria-label="Close edit panel"
  tabindex="-1"
></button>

<!-- Panel -->
<div class="edit-panel" role="dialog" aria-label="Edit timer" aria-modal="true">
  <div class="panel-handle" aria-hidden="true"></div>

  {#if timer}
    <!-- Header -->
    <div class="panel-header">
      <div class="panel-title-row">
        <div class="title-icon" style="color: {timer.color};">
          <TimerIcon iconKey={timer.iconKey} size={18} strokeWidth={1.5} />
        </div>
        <h2 class="panel-title">{timer.name}</h2>
      </div>
      <div class="header-actions">
        {#if canAdd}
          <button class="action-btn" onclick={handleAdd} title="Add a timer to this preset">
            <Plus size={16} strokeWidth={2} />
          </button>
        {/if}
        {#if canDelete}
          <button class="action-btn danger" onclick={handleDelete} title="Remove timer">
            <Trash2 size={14} strokeWidth={2} />
          </button>
        {/if}
        <button class="action-btn close-btn" onclick={handleClose} aria-label="Close">
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>

    <!-- Name field -->
    <div class="field">
      <label class="field-label" for="timer-name">Name</label>
      <input
        id="timer-name"
        class="name-input"
        type="text"
        value={timer.name}
        maxlength={24}
        oninput={(e) => update({ name: e.target.value })}
        placeholder="Timer name"
        autocomplete="off"
        spellcheck="false"
      />
    </div>

    <!-- Duration -->
    <div class="field">
      <span class="field-label">Duration</span>
      <DurationInput
        value={timer.durationSec}
        onchange={(v) => update({ durationSec: v })}
      />
    </div>

    <!-- Color -->
    <div class="field">
      <span class="field-label">Color</span>
      <ColorPicker
        value={timer.color}
        onchange={(v) => update({ color: v })}
      />
    </div>

    <!-- Icon -->
    <div class="field">
      <span class="field-label">Icon</span>
      <IconPicker
        value={timer.iconKey}
        onchange={(v) => update({ iconKey: v })}
      />
    </div>

    <!-- Reset timer -->
    <div class="panel-footer">
      <button
        class="reset-btn"
        onclick={() => { appState.resetTimer(timerId); handleClose(); }}
      >
        Reset timer
      </button>
    </div>
  {/if}
</div>

<style>
  /* ── Backdrop ── */
  .backdrop-btn {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.40);
    z-index: var(--z-panel);
    cursor: default;
    animation: fadeIn var(--dur-base) var(--ease-out);
    border: none;
  }

  /* ── Panel ── */
  .edit-panel {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: min(540px, 94vw);
    max-height: 88vh;
    overflow-y: auto;
    scrollbar-width: none;
    background: var(--bg-surface);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    border: 1px solid var(--border-subtle);
    border-bottom: none;
    padding: var(--space-3) var(--space-6) var(--space-8);
    z-index: calc(var(--z-panel) + 1);
    animation: slideUp var(--dur-slow) var(--ease-out);
    box-shadow: var(--shadow-lg);
  }

  .edit-panel::-webkit-scrollbar { display: none; }

  /* ── Handle ── */
  .panel-handle {
    width: 36px;
    height: 4px;
    background: var(--border-soft);
    border-radius: var(--radius-full);
    margin: 0 auto var(--space-5);
  }

  /* ── Header ── */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-6);
  }

  .panel-title-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .title-icon {
    display: flex;
    align-items: center;
    opacity: 0.9;
  }

  .panel-title {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    letter-spacing: 0.01em;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    color: var(--text-tertiary);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }

  .action-btn:hover {
    background: var(--border-subtle);
    color: var(--text-secondary);
  }

  .action-btn.danger:hover {
    background: color-mix(in srgb, #C47A7A 15%, transparent);
    color: #C47A7A;
  }

  /* ── Fields ── */
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-5);
  }

  .field-label {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  /* ── Name input ── */
  .name-input {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 300;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-soft);
    padding: var(--space-2) 0;
    width: 100%;
    background: transparent;
    letter-spacing: 0.01em;
    transition: border-color var(--dur-fast) var(--ease-out);
  }

  .name-input:focus {
    border-color: var(--text-secondary);
    outline: none;
  }

  .name-input::placeholder { color: var(--text-tertiary); }

  /* ── Footer ── */
  .panel-footer {
    margin-top: var(--space-6);
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-subtle);
    display: flex;
    justify-content: center;
  }

  .reset-btn {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    cursor: pointer;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }

  .reset-btn:hover {
    background: var(--border-subtle);
    color: var(--text-secondary);
  }

  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(100%); opacity: 0; }
    to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
</style>
