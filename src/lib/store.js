import { writable, derived } from 'svelte/store';

const API_BASE = '/api';
export const STANDARD_CLOCK_IN = '08:00';

// ── helpers ─────────────────────────────────────────────────────────────────

export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function formatMinutes(totalMinutes) {
  if (totalMinutes === 0) return '0m';
  const sign = totalMinutes > 0 ? '+' : '-';
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getMonthFromDate(dateStr) {
  return dateStr.slice(0, 7); // "2026-03-11" → "2026-03"
}

export function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleString('default', { month: 'long', year: 'numeric' });
}

export function calculateEntryOvertime(clockIn, clockOut, defaultClockOut) {
  if (!clockIn || !clockOut) return null;
  const worked = parseTimeToMinutes(clockOut) - parseTimeToMinutes(clockIn);
  const expected = parseTimeToMinutes(defaultClockOut) - parseTimeToMinutes(STANDARD_CLOCK_IN);
  return worked - expected;
}

// ── store ────────────────────────────────────────────────────────────────────

export const clockData = writable({ entries: [], defaultClockOut: '17:00' });

// ── initialization ────────────────────────────────────────────────────────────

export async function initializeStore() {
  try {
    const [entriesRes, settingsRes] = await Promise.all([
      fetch(`${API_BASE}/entries`),
      fetch(`${API_BASE}/settings`)
    ]);
    if (!entriesRes.ok || !settingsRes.ok) throw new Error('Failed to load data');
    const entries = await entriesRes.json();
    const settings = await settingsRes.json();
    clockData.set({ entries, defaultClockOut: settings.defaultClockOut });
  } catch (err) {
    console.error('Failed to initialize store:', err);
  }
}

// ── derived ──────────────────────────────────────────────────────────────────

export const currentMonthEntries = derived(clockData, ($d) => {
  const month = getCurrentMonth();
  return $d.entries
    .filter((e) => getMonthFromDate(e.date) === month)
    .sort((a, b) => a.date.localeCompare(b.date));
});

export const currentMonthTotal = derived([clockData, currentMonthEntries], ([$d, $entries]) => {
  return $entries.reduce((sum, e) => {
    const ot = calculateEntryOvertime(e.clockIn, e.clockOut, $d.defaultClockOut);
    return ot !== null ? sum + ot : sum;
  }, 0);
});

// ── actions ──────────────────────────────────────────────────────────────────

export async function addOrUpdateEntry(date, clockIn, clockOut) {
  const res = await fetch(`${API_BASE}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, clockIn, clockOut })
  });
  if (!res.ok) throw new Error(`Failed to save entry: ${res.statusText}`);
  const entry = await res.json();
  clockData.update((d) => {
    const idx = d.entries.findIndex((e) => e.date === date);
    const entries = [...d.entries];
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.push(entry);
    }
    return { ...d, entries };
  });
}

export async function deleteEntry(date) {
  const res = await fetch(`${API_BASE}/entries/${date}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete entry: ${res.statusText}`);
  clockData.update((d) => ({
    ...d,
    entries: d.entries.filter((e) => e.date !== date)
  }));
}

export async function setDefaultClockOut(time) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ defaultClockOut: time })
  });
  if (!res.ok) throw new Error(`Failed to save settings: ${res.statusText}`);
  clockData.update((d) => ({ ...d, defaultClockOut: time }));
}
