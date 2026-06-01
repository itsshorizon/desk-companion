<script>
  import TimerIcon from '../icons/TimerIcon.svelte';
  import { TIMER_ICONS } from '../../data/defaults.js';

  let { value = 'Timer', onchange } = $props();
</script>

<div class="icon-picker" role="radiogroup" aria-label="Timer icon">
  {#each TIMER_ICONS as icon (icon.key)}
    <button
      class="icon-btn"
      class:selected={value === icon.key}
      onclick={() => onchange?.(icon.key)}
      aria-label={icon.label}
      aria-checked={value === icon.key}
      role="radio"
      title={icon.label}
    >
      <TimerIcon iconKey={icon.key} size={18} strokeWidth={1.5} />
    </button>
  {/each}
</div>

<style>
  .icon-picker {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .icon-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    transition:
      background    var(--dur-fast) var(--ease-out),
      color         var(--dur-fast) var(--ease-out),
      border-color  var(--dur-fast) var(--ease-out),
      transform     var(--dur-fast) var(--ease-spring);
  }

  .icon-btn:hover {
    background: var(--border-subtle);
    color: var(--text-primary);
    transform: scale(1.08);
  }

  .icon-btn.selected {
    background: color-mix(in srgb, var(--text-primary) 10%, transparent);
    border-color: var(--border-soft);
    color: var(--text-primary);
  }
</style>
