<script>
  import { clockData, setDefaultClockOut } from './store.js';

  export let open = false;

  let value = $clockData.defaultClockOut;

  $: if (open) value = $clockData.defaultClockOut;

  function save() {
    if (value) {
      setDefaultClockOut(value);
    }
    open = false;
  }

  function close() { open = false; }

  function handleKeydown(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter') save();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="overlay" on:click={close}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="modal" on:click|stopPropagation on:keydown={handleKeydown}>
      <h3 class="modal-title">⚙️ Settings</h3>

      <div class="field-group">
        <label for="default-out">Default Clock-Out Time</label>
        <input
          id="default-out"
          type="time"
          bind:value
          class="input-field"
        />
        <p class="helper">This will be pre-filled when you add a new entry. You can always change it per entry.</p>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" on:click={close}>Cancel</button>
        <button class="btn-save" on:click={save}>Save</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fade-in 0.2s ease;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .modal {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    padding: 28px 24px;
    width: min(360px, 90vw);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    animation: slide-up 0.25s ease;
  }

  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .modal-title {
    margin: 0 0 20px;
    font-size: 1.1rem;
    font-weight: 700;
    color: #e2e8f0;
  }

  .field-group { margin-bottom: 16px; }

  label {
    display: block;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 6px;
  }

  .input-field {
    width: 100%;
    box-sizing: border-box;
    background: rgba(15, 23, 42, 0.8);
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

  .input-field:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
  }

  .helper {
    margin: 6px 0 0;
    font-size: 0.75rem;
    color: #475569;
    line-height: 1.5;
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .btn-cancel, .btn-save {
    padding: 9px 20px;
    border-radius: 10px;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .btn-cancel {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #94a3b8;
  }

  .btn-cancel:hover { background: rgba(255, 255, 255, 0.1); }

  .btn-save {
    background: linear-gradient(135deg, #0ea5e9, #6366f1);
    border: none;
    color: #fff;
    box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
  }

  .btn-save:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
  }
</style>
