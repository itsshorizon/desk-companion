<script>
  import { TIMER_COLORS } from '../../data/defaults.js';

  let { value = '#7B9E87', onchange } = $props();
</script>

<div class="color-picker" role="radiogroup" aria-label="Timer color">
  {#each TIMER_COLORS as c (c.key)}
    <button
      class="swatch"
      class:selected={value === c.value}
      style="background: {c.value};"
      onclick={() => onchange?.(c.value)}
      aria-label={c.label}
      aria-checked={value === c.value}
      role="radio"
      title={c.label}
    >
      {#if value === c.value}
        <span class="check" aria-hidden="true">✓</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .color-picker {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .swatch {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-full);
    border: 2px solid transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      transform    var(--dur-fast) var(--ease-spring),
      border-color var(--dur-fast) var(--ease-out);
    flex-shrink: 0;
  }

  .swatch:hover { transform: scale(1.12); }

  .swatch.selected {
    border-color: var(--text-primary);
    transform: scale(1.08);
  }

  .check {
    font-size: 12px;
    color: white;
    font-weight: 600;
    line-height: 1;
    text-shadow: 0 1px 2px rgba(0,0,0,0.4);
  }
</style>
