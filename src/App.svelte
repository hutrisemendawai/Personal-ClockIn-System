<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import ClockForm from './lib/ClockForm.svelte';
  import MonthStats from './lib/MonthStats.svelte';
  import EntryList from './lib/EntryList.svelte';
  import Settings from './lib/Settings.svelte';
  import { formatMonthLabel, getCurrentMonth } from './lib/store.js';

  let settingsOpen = false;
  let nowDisplay = '';

  function tick() {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    nowDisplay = `${h}:${m}:${s}`;
  }

  onMount(() => {
    tick();
    const interval = setInterval(tick, 1000);

    // GSAP entrance timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.header', { opacity: 0, y: -30, duration: 0.6 })
      .from('.blob-1', { scale: 0, opacity: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' }, '-=0.3')
      .from('.blob-2', { scale: 0, opacity: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' }, '-=1')
      .from('.col-left',  { opacity: 0, x: -40, duration: 0.6 }, '-=0.8')
      .from('.col-right', { opacity: 0, x:  40, duration: 0.6 }, '-=0.5');

    return () => clearInterval(interval);
  });

  function handleEntryAdded() {
    // Nothing extra needed - store reactivity handles everything
  }
</script>

<!-- Animated background blobs -->
<div class="bg-blob blob-1"></div>
<div class="bg-blob blob-2"></div>
<div class="bg-blob blob-3"></div>

<header class="header">
  <div class="header-left">
    <h1 class="site-title">
      <span class="emoji">⏱</span> Clock-In System
    </h1>
    <p class="site-sub">{formatMonthLabel(getCurrentMonth())}</p>
  </div>
  <div class="header-right">
    <div class="live-clock">{nowDisplay}</div>
    <button class="settings-btn" on:click={() => settingsOpen = true} title="Settings">
      ⚙️ Settings
    </button>
  </div>
</header>

<main class="layout">
  <div class="col col-left">
    <ClockForm on:added={handleEntryAdded} />
  </div>
  <div class="col col-right">
    <MonthStats />
    <EntryList />
  </div>
</main>

<Settings bind:open={settingsOpen} />

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    min-height: 100vh;
    background: #040d21;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    overflow-x: hidden;
  }

  :global(#app) {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Animated background blobs */
  .bg-blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
    animation: float 8s ease-in-out infinite;
  }

  .blob-1 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.12), transparent 70%);
    top: -120px;
    left: -100px;
    animation-delay: 0s;
  }

  .blob-2 {
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.12), transparent 70%);
    bottom: -100px;
    right: -80px;
    animation-delay: -3s;
  }

  .blob-3 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(52, 211, 153, 0.08), transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: -6s;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) scale(1); }
    50%       { transform: translateY(-20px) scale(1.05); }
  }

  /* Header */
  .header {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 20px 28px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(4, 13, 33, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .site-title {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: #f1f5f9;
  }

  .emoji { font-size: 1.2rem; }

  .site-sub {
    font-size: 0.78rem;
    color: #64748b;
    margin-top: 1px;
    font-weight: 500;
  }

  .live-clock {
    font-variant-numeric: tabular-nums;
    font-size: 1.35rem;
    font-weight: 700;
    color: #38bdf8;
    letter-spacing: 0.04em;
    text-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
  }

  .settings-btn {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #94a3b8;
    font-size: 0.82rem;
    font-weight: 600;
    padding: 7px 14px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    font-family: inherit;
  }

  .settings-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: #e2e8f0;
  }

  /* Main layout */
  .layout {
    position: relative;
    z-index: 10;
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 20px;
    padding: 24px 28px;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
    flex: 1;
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  @media (max-width: 720px) {
    .layout {
      grid-template-columns: 1fr;
      padding: 16px;
    }

    .header {
      padding: 14px 16px;
    }

    .site-title { font-size: 1.05rem; }
    .live-clock { font-size: 1.1rem; }
  }
</style>
