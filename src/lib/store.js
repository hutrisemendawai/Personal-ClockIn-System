import { writable, derived, get } from 'svelte/store';

const STORAGE_KEY = 'clockin_system_v1';
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

// ── persistence ──────────────────────────────────────────────────────────────

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { entries: [], defaultClockOut: '17:00' };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

// ── store ────────────────────────────────────────────────────────────────────

const initial = loadData();

export const clockData = writable(initial);

// Auto-save on every change
clockData.subscribe((val) => saveData(val));

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

export function addOrUpdateEntry(date, clockIn, clockOut) {
  clockData.update((d) => {
    const idx = d.entries.findIndex((e) => e.date === date);
    const entry = { id: date, date, clockIn, clockOut };
    if (idx >= 0) {
      d.entries[idx] = entry;
    } else {
      d.entries = [...d.entries, entry];
    }
    return { ...d };
  });
}

export function deleteEntry(date) {
  clockData.update((d) => ({
    ...d,
    entries: d.entries.filter((e) => e.date !== date)
  }));
}

export function setDefaultClockOut(time) {
  clockData.update((d) => ({ ...d, defaultClockOut: time }));
}
