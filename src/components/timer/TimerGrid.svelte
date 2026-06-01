<script>
  import { flip } from 'svelte/animate';
  import { cubicOut } from 'svelte/easing';
  import CircularTimer from './CircularTimer.svelte';
  import { appState } from '../../lib/state/index.svelte.js';
  import { haptics } from '../../lib/utils/haptics.js';
  import { GRID_COLS } from '../../data/defaults.js';

  let { onLongPress } = $props();

  let gridEl  = $state(null);
  let ghostEl = $state(null);

  // ── Visual order (independent during drag) ────────────────────────
  let sortedTimerIds = $state([]);

  $effect(() => {
    if (!draggingId) {
      sortedTimerIds = [...(appState.activePreset?.timerIds ?? [])];
    }
  });

  let sortedTimers = $derived(
    sortedTimerIds.map(id => appState.timers[id]).filter(Boolean)
  );

  let count = $derived(sortedTimerIds.length);
  let cols  = $derived(GRID_COLS[count] ?? 3);

  let editingId = $derived(appState.editingTimerId);

  // ── Drag state ────────────────────────────────────────────────────
  let draggingId    = $state(null);
  let draggingTimer = $derived(draggingId ? appState.timers[draggingId] : null);

  // Ghost geometry (set at drag start, read directly for perf)
  let ghostInitialX = $state(0);
  let ghostInitialY = $state(0);
  let ghostWidth    = $state(0);
  let ghostHeight   = $state(0);

  let dragStartX  = 0;
  let dragStartY  = 0;
  let lastSlotIdx = -1;

  function onDragStart(timerId, event) {
    if (!gridEl) return;

    // Identify source cell
    const cellEl = gridEl.querySelector(`[data-timer-id="${timerId}"]`);
    if (!cellEl) return;

    const cellRect = cellEl.getBoundingClientRect();
    const gridRect = gridEl.getBoundingClientRect();

    ghostInitialX = cellRect.left - gridRect.left;
    ghostInitialY = cellRect.top  - gridRect.top;
    ghostWidth    = cellRect.width;
    ghostHeight   = cellRect.height;

    dragStartX  = event.clientX;
    dragStartY  = event.clientY;
    lastSlotIdx = sortedTimerIds.indexOf(timerId);
    draggingId  = timerId;

    haptics.medium();

    window.addEventListener('pointermove',   onWindowMove,   { passive: false });
    window.addEventListener('pointerup',     onWindowUp);
    window.addEventListener('pointercancel', onWindowUp);
  }

  function onWindowMove(e) {
    if (!draggingId || !ghostEl) return;
    e.preventDefault();

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    // Direct DOM update — avoids Svelte re-render per frame
    ghostEl.style.transform =
      `translate(${ghostInitialX + dx}px, ${ghostInitialY + dy}px) scale(1.07)`;

    updateSlot(e.clientX, e.clientY);
  }

  function updateSlot(clientX, clientY) {
    if (!gridEl || !draggingId) return;

    const cells = Array.from(gridEl.querySelectorAll('.timer-cell'));
    let nearest = lastSlotIdx;
    let nearestDist = Infinity;

    for (let i = 0; i < cells.length; i++) {
      const r = cells[i].getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const d  = Math.sqrt((clientX - cx) ** 2 + (clientY - cy) ** 2);
      if (d < nearestDist) { nearestDist = d; nearest = i; }
    }

    if (nearest !== lastSlotIdx) {
      lastSlotIdx = nearest;
      moveDraggedTo(nearest);
    }
  }

  function moveDraggedTo(targetSlot) {
    const currentSlot = sortedTimerIds.indexOf(draggingId);
    if (currentSlot === -1 || currentSlot === targetSlot) return;

    const newOrder = [...sortedTimerIds];
    newOrder.splice(currentSlot, 1);
    newOrder.splice(targetSlot, 0, draggingId);
    sortedTimerIds = newOrder;  // triggers animate:flip on other cells

    haptics.light();
  }

  function onWindowUp() {
    if (!draggingId) return;

    // Commit order to state
    appState.reorderTimers(appState.activePresetId, [...sortedTimerIds]);

    // Reset
    draggingId  = null;
    lastSlotIdx = -1;

    window.removeEventListener('pointermove',   onWindowMove);
    window.removeEventListener('pointerup',     onWindowUp);
    window.removeEventListener('pointercancel', onWindowUp);

    haptics.light();
  }
</script>

<div
  class="timer-grid"
  class:has-edit={!!editingId}
  style="--cols: {cols};"
  bind:this={gridEl}
  role="list"
  aria-label="Task timers"
>
  {#each sortedTimers as timer (timer.id)}
    <div
      class="timer-cell"
      class:dimmed={editingId && editingId !== timer.id}
      data-timer-id={timer.id}
      role="listitem"
      animate:flip={{ duration: 200, easing: cubicOut }}
    >
      <CircularTimer
        {timer}
        onLongPress={(id) => onLongPress?.(id)}
        {onDragStart}
        isDragSource={timer.id === draggingId}
      />
    </div>
  {/each}

  <!-- Ghost: lifted copy that follows the pointer during drag -->
  {#if draggingId && draggingTimer}
    <div
      bind:this={ghostEl}
      class="drag-ghost"
      style="
        width:     {ghostWidth}px;
        height:    {ghostHeight}px;
        transform: translate({ghostInitialX}px, {ghostInitialY}px) scale(1.07);
      "
      aria-hidden="true"
    >
      <CircularTimer
        timer={draggingTimer}
        onLongPress={() => {}}
        onDragStart={() => {}}
        isDragSource={false}
      />
    </div>
  {/if}
</div>

<style>
  .timer-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    gap: clamp(var(--space-1), 1.2vw, var(--space-4));
    width: 100%;
    height: 100%;
    padding: 62px var(--space-8) 36px;
    align-items: center;
    align-content: center;
    justify-items: center;
    position: relative; /* needed for ghost absolute positioning */
  }

  .timer-cell {
    width: 100%;
    max-width: 300px;
    transition:
      opacity   var(--dur-slow) var(--ease-out),
      transform var(--dur-slow) var(--ease-out);
  }

  .timer-cell.dimmed {
    opacity: 0.28;
    transform: scale(0.97);
    pointer-events: none;
  }

  /* ── Drag ghost — lifted copy that follows pointer ── */
  .drag-ghost {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 50;
    will-change: transform;
    /* Lifted shadow */
    filter: drop-shadow(0 10px 28px rgba(0, 0, 0, 0.20));
    /* No CSS transition — transform updated directly for smooth 60fps */
  }
</style>
