<script>
  import { createEventDispatcher } from 'svelte';
  import {
    clockData,
    addOrUpdateEntry,
    getTodayDate,
    getCurrentMonth,
    getMonthFromDate
  } from './store.js';

  const dispatch = createEventDispatcher();

  let date = getTodayDate();
  let clockIn = '';
  let clockOut = '';
  let error = '';
  let success = false;

  $: defaultClockOut = $clockData.defaultClockOut;

  // Pre-fill clockOut with default when it changes or on mount
  $: if (!clockOut) clockOut = defaultClockOut;

  function validate() {
    if (!date) { error = 'Please select a date.'; return false; }
    if (!clockIn) { error = 'Please enter a clock-in time.'; return false; }
    if (!clockOut) { error = 'Please enter a clock-out time.'; return false; }
    const [ih, im] = clockIn.split(':').map(Number);
    const [oh, om] = clockOut.split(':').map(Number);
    if (oh * 60 + om <= ih * 60 + im) {
      error = 'Clock-out must be after clock-in.';
      return false;
    }
    error = '';
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await addOrUpdateEntry(date, clockIn, clockOut);
    success = true;
    dispatch('added', { date, clockIn, clockOut });
    setTimeout(() => { success = false; }, 2000);
    // Reset clock-in; keep date and clockOut for quick re-entry
    clockIn = '';
    clockOut = defaultClockOut;
    date = getTodayDate();
  }

  function handleClockInKeydown(e) {
    if (e.key === 'Enter') handleSubmit();
  }
</script>

<div class="form-card">
  <h2 class="form-title">
    <span class="icon">🕐</span> Log Entry
  </h2>

  <div class="field-group">
    <label for="entry-date">Date</label>
    <input
      id="entry-date"
      type="date"
      bind:value={date}
      class="input-field"
    />
  </div>

  <div class="field-group">
    <label for="clock-in">Clock In <span class="hint">(manual)</span></label>
    <input
      id="clock-in"
      type="time"
      bind:value={clockIn}
      class="input-field glow"
      placeholder="08:00"
      on:keydown={handleClockInKeydown}
    />
  </div>

  <div class="field-group">
    <label for="clock-out">
      Clock Out
      <span class="hint">(default: {defaultClockOut})</span>
    </label>
    <input
      id="clock-out"
      type="time"
      bind:value={clockOut}
      class="input-field"
    />
  </div>

  {#if error}
    <p class="error-msg">{error}</p>
  {/if}

  <button
    class="submit-btn"
    class:success
    on:click={handleSubmit}
  >
    {#if success}
      <span>✓ Saved!</span>
    {:else}
      <span>Save Entry</span>
    {/if}
    <div class="btn-shimmer"></div>
  </button>
</div>

<style>
  .form-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 28px 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .form-title {
    margin: 0 0 22px;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon { font-size: 1.3rem; }

  .field-group {
    margin-bottom: 16px;
  }

  label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 6px;
  }

  .hint {
    font-size: 0.72rem;
    color: #64748b;
    text-transform: none;
    letter-spacing: 0;
    font-weight: 400;
  }

  .input-field {
    width: 100%;
    box-sizing: border-box;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.4);
    border-radius: 10px;
    padding: 10px 14px;
    color: #e2e8f0;
    font-size: 0.95rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s;
    color-scheme: dark;
  }

  .input-field:focus,
  .input-field.glow:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15), 0 0 12px rgba(56, 189, 248, 0.2);
  }

  .input-field.glow {
    border-color: rgba(56, 189, 248, 0.35);
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.1);
  }

  .error-msg {
    color: #f87171;
    font-size: 0.82rem;
    margin: -8px 0 12px;
    padding: 8px 12px;
    background: rgba(248, 113, 113, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(248, 113, 113, 0.2);
  }

  /* uiverse.io-style shimmer button */
  .submit-btn {
    position: relative;
    width: 100%;
    padding: 12px 0;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #0ea5e9, #6366f1);
    color: #fff;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.15s, box-shadow 0.2s, background 0.3s;
    box-shadow: 0 4px 20px rgba(14, 165, 233, 0.35);
    font-family: inherit;
    margin-top: 4px;
  }

  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 28px rgba(14, 165, 233, 0.5);
  }

  .submit-btn:active {
    transform: translateY(0);
  }

  .submit-btn.success {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  }

  .btn-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.25),
      transparent
    );
    animation: shimmer 2.5s infinite;
  }

  @keyframes shimmer {
    0%   { left: -100%; }
    60%  { left: 150%; }
    100% { left: 150%; }
  }
</style>
