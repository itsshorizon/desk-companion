<script>
  import TimerIcon from '../icons/TimerIcon.svelte';
  import { appState } from '../../lib/state/index.svelte.js';
  import { haptics } from '../../lib/utils/haptics.js';
  import { Sun, Moon, Monitor } from '@lucide/svelte';

  let presets = $derived(appState.presets);
  let active  = $derived(appState.activePresetId);
  let theme   = $derived(appState.colorScheme);

  function selectPreset(id) {
    if (id === active) return;
    haptics.presetSwitch();
    appState.requestPresetSwitch(id);
  }

  function cycleTheme() {
    const order = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    appState.setColorScheme(next);
  }
</script>

<!-- Floating island — absolutely positioned, doesn't occupy flow space -->
<header class="preset-island" aria-label="Day preset selector">
  <nav class="preset-list" aria-label="Day presets">
    {#each presets as preset (preset.id)}
      <button
        class="preset-pill"
        class:active={preset.id === active}
        onclick={() => selectPreset(preset.id)}
        aria-current={preset.id === active ? 'true' : undefined}
        aria-label="Switch to {preset.name} preset"
      >
        <span class="preset-icon" aria-hidden="true">
          <TimerIcon iconKey={preset.iconKey} size={12} strokeWidth={1.7} />
        </span>
        <span class="preset-label">{preset.name}</span>
      </button>
    {/each}
  </nav>

  <div class="divider" aria-hidden="true"></div>

  <button
    class="theme-btn"
    onclick={cycleTheme}
    aria-label="Toggle theme: currently {theme}"
    title="Theme: {theme}"
  >
    {#if theme === 'dark'}
      <Moon size={13} strokeWidth={1.7} />
    {:else if theme === 'light'}
      <Sun size={13} strokeWidth={1.7} />
    {:else}
      <Monitor size={13} strokeWidth={1.7} />
    {/if}
  </button>
</header>

<style>
  /* ── Floating island — centered, absolutely positioned, doesn't push content ── */
  .preset-island {
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    z-index: var(--z-top);

    display: flex;
    align-items: center;
    gap: 0;
    padding: 0 var(--space-3);
    height: 38px;
    width: max-content;

    background: var(--preset-bar-bg);
    backdrop-filter: blur(24px) saturate(1.6);
    -webkit-backdrop-filter: blur(24px) saturate(1.6);
    border-radius: var(--radius-full);
    border: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-md);
  }

  /* ── Preset pills ── */
  .preset-list {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .preset-pill {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 5px var(--space-3);
    border-radius: var(--radius-full);
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    white-space: nowrap;
    transition:
      color      var(--dur-base) var(--ease-out),
      background var(--dur-base) var(--ease-out);
  }

  .preset-pill:hover {
    color: var(--text-secondary);
  }

  .preset-pill.active {
    color: var(--text-primary);
    background: color-mix(in srgb, var(--text-primary) 8%, transparent);
  }

  .preset-icon {
    display: flex;
    align-items: center;
    opacity: 0.65;
    transition: opacity var(--dur-base) var(--ease-out);
  }
  .preset-pill.active .preset-icon { opacity: 1; }

  .preset-label {
    font-family: var(--font-serif);
    font-size: 0.82rem;
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  /* ── Divider between presets and theme toggle ── */
  .divider {
    width: 1px;
    height: 18px;
    background: var(--border-soft);
    margin: 0 var(--space-2);
    flex-shrink: 0;
  }

  /* ── Theme toggle ── */
  .theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-full);
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    transition:
      color      var(--dur-base) var(--ease-out),
      background var(--dur-base) var(--ease-out);
    flex-shrink: 0;
  }

  .theme-btn:hover {
    color: var(--text-secondary);
    background: color-mix(in srgb, var(--text-primary) 8%, transparent);
  }
</style>
