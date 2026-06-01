<script>
  import './styles/global.css';

  import PresetBar from './components/layout/PresetBar.svelte';
  import TimerGrid from './components/timer/TimerGrid.svelte';
  import ScrollHint from './components/layout/ScrollHint.svelte';
  import ResetAllButton from './components/layout/ResetAllButton.svelte';
  import EditPanel from './components/edit/EditPanel.svelte';
  import PresetSwitchPrompt from './components/modals/PresetSwitchPrompt.svelte';
  import SummaryLayer from './components/summary/SummaryLayer.svelte';

  import { appState } from './lib/state/index.svelte.js';
  import { startEngine } from './lib/engine/timerEngine.js';

  appState.init();
  startEngine();

  // ── Theme ─────────────────────────────────────────────────────────
  $effect(() => {
    document.documentElement.setAttribute('data-theme', appState.resolvedTheme);
  });

  // ── Scroll hint — reactive (shows when scrolled back to top) ──────
  let scrollEl = $state(null);
  let hasScrolled = $state(false);

  function onScroll() {
    // Reactive: hint reappears when user scrolls back to top
    hasScrolled = scrollEl ? scrollEl.scrollTop > 60 : false;
  }

  // ── Edit mode ─────────────────────────────────────────────────────
  function openEdit(timerId) {
    appState.editingTimerId = timerId;
  }

  function closeEdit() {
    appState.editingTimerId = null;
  }
</script>

<div
  class="scroll-root"
  bind:this={scrollEl}
  onscroll={onScroll}
  role="main"
>
  <!-- ── Page 1: Main timer view ─────────────────────────────────── -->
  <div class="scroll-page main-page">
    <!-- Floating island — absolutely positioned, doesn't push grid down -->
    <PresetBar />

    <!-- Grid fills the full page; island floats over it -->
    <div class="grid-area">
      <TimerGrid onLongPress={openEdit} />
      <ResetAllButton />
      <ScrollHint visible={!hasScrolled} />
    </div>
  </div>

  <!-- ── Page 2: Summary / history ──────────────────────────────── -->
  <SummaryLayer />
</div>

{#if appState.editingTimerId}
  <EditPanel timerId={appState.editingTimerId} onclose={closeEdit} />
{/if}

{#if appState.showPresetPrompt}
  <PresetSwitchPrompt />
{/if}

<style>
  .main-page {
    position: relative; /* anchors the absolutely-positioned floating island */
    display: flex;
    flex-direction: column;
    background: var(--bg-base);
    transition: background var(--dur-base) var(--ease-out);
  }

  /* Grid area fills the full scroll-page height since PresetBar is now out of flow */
  .grid-area {
    flex: 1;
    position: relative; /* anchors ScrollHint */
    display: flex;
    align-items: stretch;
    overflow: hidden;
  }

  .grid-area :global(.timer-grid) {
    width: 100%;
  }
</style>
