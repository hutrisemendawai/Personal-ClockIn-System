import express from 'express';
import Database from 'better-sqlite3';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// ── Database setup ────────────────────────────────────────────────────────────

// When running as a packaged Electron app, CLOCKIN_DATA_DIR is set to the
// OS user-data directory so the database is stored in a writable location.
const dbDir = process.env.CLOCKIN_DATA_DIR ?? join(__dirname, 'data');
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

const db = new Database(join(dbDir, 'clockin.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    date      TEXT PRIMARY KEY,
    clock_in  TEXT NOT NULL,
    clock_out TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  INSERT OR IGNORE INTO settings (key, value) VALUES ('defaultClockOut', '17:00');
`);

// ── Express app ───────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

// Rate limiting: 200 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Serve compiled frontend
app.use(express.static(join(__dirname, 'dist')));

// ── Entries API ───────────────────────────────────────────────────────────────

app.get('/api/entries', (_req, res) => {
  const entries = db
    .prepare('SELECT date, clock_in AS clockIn, clock_out AS clockOut FROM entries ORDER BY date')
    .all();
  res.json(entries);
});

app.post('/api/entries', (req, res) => {
  const { date, clockIn, clockOut } = req.body ?? {};
  if (!date || !clockIn || !clockOut) {
    return res.status(400).json({ error: 'date, clockIn and clockOut are required' });
  }
  db.prepare(
    'INSERT OR REPLACE INTO entries (date, clock_in, clock_out) VALUES (?, ?, ?)'
  ).run(date, clockIn, clockOut);
  res.json({ date, clockIn, clockOut });
});

app.delete('/api/entries/:date', (req, res) => {
  db.prepare('DELETE FROM entries WHERE date = ?').run(req.params.date);
  res.json({ ok: true });
});

// ── Settings API ──────────────────────────────────────────────────────────────

app.get('/api/settings', (_req, res) => {
  const row = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get('defaultClockOut');
  res.json({ defaultClockOut: row ? row.value : '17:00' });
});

app.put('/api/settings', (req, res) => {
  const { defaultClockOut } = req.body ?? {};
  if (!defaultClockOut) {
    return res.status(400).json({ error: 'defaultClockOut is required' });
  }
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
    'defaultClockOut',
    defaultClockOut
  );
  res.json({ defaultClockOut });
});

// ── SPA fallback ──────────────────────────────────────────────────────────────

app.get('/{*path}', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Clock-In System running at http://localhost:${PORT}`);
});
