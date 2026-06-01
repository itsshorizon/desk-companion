<script>
  import { appState } from '../../lib/state/index.svelte.js';
  import TimerIcon from '../icons/TimerIcon.svelte';
  import { formatTime, formatDurationLabel } from '../../lib/utils/time.js';
  import { ChevronUp } from '@lucide/svelte';

  let completed  = $derived(appState.completedToday());
  let streak     = $derived(appState.streakDays());
  let allTimers  = $derived(appState.timers);
  let presets    = $derived(appState.presets);

  // Build Mon–Sun date keys for the current week
  let weekDays = $derived.by(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun..6=Sat
    const mondayOffset = (dayOfWeek + 6) % 7; // days since Monday
    return days.map((label, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - mondayOffset + i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const hasActivity = appState.sessions.some(s => s.date === key && s.completedAt);
      return { label, key, hasActivity };
    });
  });
</script>

<section class="summary-layer scroll-page" aria-label="Today's summary">
  <!-- Back-to-top hint -->
  <div class="back-hint" aria-hidden="true">
    <ChevronUp size={16} strokeWidth={1.5} />
  </div>

  <div class="summary-inner">
    <!-- Streak -->
    <div class="streak-block">
      <span class="streak-number">{streak}</span>
      <span class="streak-label">{streak === 1 ? 'day streak' : 'day streak'}</span>
    </div>

    <div class="divider" role="separator"></div>

    <!-- Today's completions -->
    <div class="completions">
      <h2 class="section-heading">Today</h2>

      {#if completed.length === 0}
        <p class="empty-state">No completions yet today.</p>
      {:else}
        <ul class="completion-list">
          {#each completed as session (session.id)}
            {@const timer = allTimers[session.timerId]}
            {#if timer}
              <li class="completion-item">
                <div class="item-icon" style="color: {timer.color};">
                  <TimerIcon iconKey={timer.iconKey} size={16} strokeWidth={1.5} />
                </div>
                <div class="item-info">
                  <span class="item-name">{timer.name}</span>
                  {#if session.overtimeSec > 60}
                    <span class="item-overtime">+{formatTime(session.overtimeSec)} overtime</span>
                  {/if}
                </div>
                <div class="item-meta">
                  <span class="item-duration">{formatDurationLabel(timer.durationSec)}</span>
                  {#if session.manuallyCompleted}
                    <span class="item-tag">manual</span>
                  {/if}
                </div>
              </li>
            {/if}
          {/each}
        </ul>
      {/if}
    </div>

    <!-- This week overview — simple dot grid -->
    <div class="week-block">
      <h2 class="section-heading">This week</h2>
      <div class="week-dots">
        {#each weekDays as { label, hasActivity } (label)}
          <div class="day-dot-wrap">
            <div class="day-dot" class:active={hasActivity}></div>
            <span class="day-label">{label}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .summary-layer {
    background: var(--bg-base);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-8) var(--space-8) var(--space-12);
    overflow-y: auto;
    scrollbar-width: none;
  }
  .summary-layer::-webkit-scrollbar { display: none; }

  .back-hint {
    color: var(--text-tertiary);
    opacity: 0.5;
    margin-bottom: var(--space-6);
    animation: breathe 3s ease-in-out infinite;
  }

  @keyframes breathe {
    0%, 100% { transform: translateY(0);    opacity: 0.35; }
    50%       { transform: translateY(-4px); opacity: 0.6;  }
  }

  .summary-inner {
    width: 100%;
    max-width: 560px;
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  /* ── Streak ── */
  .streak-block {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
  }

  .streak-number {
    font-family: var(--font-serif);
    font-size: var(--text-4xl);
    font-weight: 300;
    color: var(--text-primary);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .streak-label {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* ── Divider ── */
  .divider {
    height: 1px;
    background: var(--border-subtle);
  }

  /* ── Headings ── */
  .section-heading {
    font-family: var(--font-serif);
    font-size: var(--text-base);
    font-weight: 400;
    color: var(--text-tertiary);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: var(--space-4);
  }

  /* ── Completion list ── */
  .completion-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .completion-item {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--border-subtle);
  }

  .item-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    opacity: 0.85;
  }

  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .item-name {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    font-weight: 400;
    color: var(--text-primary);
  }

  .item-overtime {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    letter-spacing: 0.02em;
  }

  .item-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex-shrink: 0;
  }

  .item-duration {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-weight: 300;
  }

  .item-tag {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    background: var(--border-subtle);
    padding: 1px 6px;
    border-radius: var(--radius-full);
    letter-spacing: 0.04em;
  }

  .empty-state {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    font-weight: 300;
    color: var(--text-tertiary);
    font-style: italic;
  }

  /* ── Week dots ── */
  .week-dots {
    display: flex;
    gap: var(--space-4);
  }

  .day-dot-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .day-dot {
    width: 10px;
    height: 10px;
    border-radius: var(--radius-full);
    background: var(--border-soft);
    transition: background var(--dur-base) var(--ease-out);
  }

  .day-dot.active {
    background: var(--text-secondary);
  }

  .day-label {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    letter-spacing: 0.04em;
  }
</style>
