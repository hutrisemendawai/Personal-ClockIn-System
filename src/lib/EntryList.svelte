<script>
  import { onMount, tick } from 'svelte';
  import { gsap } from 'gsap';
  import {
    currentMonthEntries,
    clockData,
    deleteEntry,
    calculateEntryOvertime,
    formatMinutes,
    formatMonthLabel,
    getCurrentMonth
  } from './store.js';

  $: entries = $currentMonthEntries;
  $: defaultClockOut = $clockData.defaultClockOut;

  let prevLength = 0;
  let tableBody;
  let mounted = false;

  onMount(() => {
    mounted = true;
    prevLength = entries.length;
    // Stagger-animate any existing rows on load
    tick().then(() => {
      if (tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        if (rows.length > 0) {
          gsap.from(rows, { opacity: 0, y: 8, duration: 0.35, stagger: 0.06, ease: 'power2.out', delay: 0.4 });
        }
      }
    });
  });

  $: if (mounted && tableBody && entries.length > prevLength) {
    tick().then(() => {
      const rows = tableBody.querySelectorAll('tr');
      if (rows.length > 0) {
        gsap.from(rows[rows.length - 1], { opacity: 0, x: -20, duration: 0.4, ease: 'power2.out' });
      }
      prevLength = entries.length;
    });
  } else if (mounted) {
    prevLength = entries.length;
  }

  function handleDelete(date) {
    if (confirm(`Delete entry for ${date}?`)) {
      deleteEntry(date);
    }
  }

  function overtimeClass(minutes) {
    if (minutes === null) return '';
    if (minutes > 0) return 'ot-positive';
    if (minutes < 0) return 'ot-negative';
    return 'ot-zero';
  }

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
  }
</script>

<div class="list-card">
  <h2 class="list-title">
    <span class="icon">📋</span>
    {formatMonthLabel(getCurrentMonth())} — Entries
  </h2>

  {#if entries.length === 0}
    <div class="empty-state">
      <span class="empty-icon">📭</span>
      <p>No entries yet. Add your first clock-in above!</p>
    </div>
  {:else}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>In</th>
            <th>Out</th>
            <th>OT / UT</th>
            <th></th>
          </tr>
        </thead>
        <tbody bind:this={tableBody}>
          {#each entries as entry (entry.date)}
            {@const ot = calculateEntryOvertime(entry.clockIn, entry.clockOut, defaultClockOut)}
            <tr>
              <td class="td-date">{formatDate(entry.date)}</td>
              <td class="td-time">{entry.clockIn || '—'}</td>
              <td class="td-time">{entry.clockOut || '—'}</td>
              <td class="td-ot {overtimeClass(ot)}">
                {ot !== null ? formatMinutes(ot) : '—'}
              </td>
              <td class="td-del">
                <button class="del-btn" on:click={() => handleDelete(entry.date)} title="Delete">✕</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .list-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 28px 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .list-title {
    margin: 0 0 20px;
    font-size: 1.05rem;
    font-weight: 700;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon { font-size: 1.1rem; }

  .empty-state {
    text-align: center;
    padding: 32px 0;
    color: #475569;
  }

  .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 10px; }
  .empty-state p { font-size: 0.88rem; }

  .table-wrap {
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.07);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;
  }

  thead tr {
    background: rgba(255, 255, 255, 0.04);
  }

  th {
    padding: 10px 14px;
    text-align: left;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #64748b;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }

  tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.15s;
  }

  tbody tr:last-child { border-bottom: none; }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  td {
    padding: 11px 14px;
    color: #cbd5e1;
  }

  .td-date { font-weight: 500; color: #e2e8f0; white-space: nowrap; }
  .td-time { font-variant-numeric: tabular-nums; color: #94a3b8; }

  .td-ot {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .ot-positive { color: #34d399; }
  .ot-negative { color: #f87171; }
  .ot-zero { color: #94a3b8; }

  .td-del { text-align: right; padding-right: 10px; }

  .del-btn {
    background: none;
    border: 1px solid rgba(248, 113, 113, 0.3);
    color: #f87171;
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 0.7rem;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .del-btn:hover {
    background: rgba(248, 113, 113, 0.12);
    border-color: rgba(248, 113, 113, 0.6);
  }
</style>
