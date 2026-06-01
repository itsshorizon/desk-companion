<script>
  import { ChevronDown } from '@lucide/svelte';
  let { visible = true } = $props();
</script>

{#if visible}
  <div class="scroll-hint" aria-hidden="true">
    <ChevronDown size={15} strokeWidth={1.5} />
  </div>
{/if}

<style>
  .scroll-hint {
    position: absolute;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--text-tertiary);
    /* Fades in after 1s, then breathes indefinitely */
    opacity: 0;
    animation:
      hintFadeIn 0.8s var(--ease-out)  1s  forwards,
      breathe    2.8s ease-in-out      1.8s infinite;
    pointer-events: none;
  }

  @keyframes hintFadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(4px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
  }

  @keyframes breathe {
    0%, 100% { transform: translateX(-50%) translateY(0);   opacity: 0.40; }
    50%       { transform: translateX(-50%) translateY(5px); opacity: 0.65; }
  }
</style>
