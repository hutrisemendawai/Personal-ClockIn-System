<script>
  import { onMount, afterUpdate } from 'svelte';
  import { gsap } from 'gsap';
  import {
    currentMonthTotal,
    currentMonthEntries,
    formatMinutes,
    formatMonthLabel,
    getCurrentMonth,
    clockData
  } from './store.js';

  let displayValue = 0;
  let tweenObj = { val: 0 };
  let statEl;
  let prevTotal = 0;

  $: label = formatMonthLabel(getCurrentMonth());
  $: total = $currentMonthTotal;
  $: entryCount = $currentMonthEntries.filter(e => e.clockIn && e.clockOut).length;

  $: if (statEl && total !== prevTotal) {
    gsap.to(tweenObj, {
      val: total,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => { displayValue = Math.round(tweenObj.val); }
    });
    prevTotal = total;
  }

  onMount(() => {
    tweenObj.val = total;
    displayValue = total;
    prevTotal = total;
    gsap.from('.stats-card', {
      opacity: 0,
      scale: 0.95,
      duration: 0.6,
      ease: 'back.out(1.4)',
      delay: 0.15
    });
  });
</script>

<div class="stats-card">
  <p class="stats-month">{label}</p>
  <p class="stats-label">Monthly Overtime / Undertime</p>

  <div class="stats-value" class:positive={displayValue > 0} class:negative={displayValue < 0} bind:this={statEl}>
    {formatMinutes(displayValue)}
  </div>

  <p class="stats-sub">
    {#if entryCount === 0}
      No valid entries this month yet
    {:else}
      Based on {entryCount} {entryCount === 1 ? 'entry' : 'entries'} · Resets next month
    {/if}
  </p>

  <div class="legend">
    <span class="dot positive-dot"></span><span>Overtime</span>
    <span class="dot negative-dot"></span><span>Undertime</span>
  </div>
</div>

<style>
  .stats-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 28px 24px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .stats-month {
    margin: 0 0 4px;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #64748b;
  }

  .stats-label {
    margin: 0 0 16px;
    font-size: 0.88rem;
    color: #94a3b8;
  }

  .stats-value {
    font-size: 2.8rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 12px;
    transition: color 0.3s;
    color: #e2e8f0;
  }

  .stats-value.positive {
    color: #34d399;
    text-shadow: 0 0 20px rgba(52, 211, 153, 0.4);
  }

  .stats-value.negative {
    color: #f87171;
    text-shadow: 0 0 20px rgba(248, 113, 113, 0.4);
  }

  .stats-sub {
    margin: 0 0 14px;
    font-size: 0.78rem;
    color: #64748b;
  }

  .legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .positive-dot { background: #34d399; margin-left: 8px; }
  .negative-dot { background: #f87171; }
</style>
