# Personal Clock-In System

A personal time-tracking web app to log clock-in / clock-out times, calculate overtime and undertime, and accumulate totals per calendar month.

## ✨ Features

- **Manual clock-in** — type your clock-in time yourself each day
- **Auto-filled clock-out** — defaults to 17:00 (changeable in Settings at any time)
- **Overtime / Undertime tracking** — calculated down to the minute based on standard work hours (08:00 – default clock-out)
- **Monthly accumulation** — totals reset automatically when the month changes
- **Entries only count when both clock-in and clock-out are filled**

## 🖥️ Desktop App (Recommended)

Run the app as a native desktop window — no browser required.  Data is persisted in a SQLite database stored in your OS user-data folder.

### Build the installer / executable

```bash
npm install
npm run dist
```

The packaged output lands in the `release/` folder:

| Platform | Output |
|----------|--------|
| Windows  | NSIS installer (`.exe`) |
| macOS    | Disk image (`.dmg`) |
| Linux    | AppImage (`.AppImage`) |

### Launch without packaging (dev preview)

```bash
npm install
npm run electron
```

This builds the frontend and opens the Electron window in one step.

## 🌐 Web / Server Mode

### No-server (localStorage) mode

Open `dist/index.html` directly in any browser:

```
double-click dist/index.html
```

All data is saved locally in your browser's `localStorage`.

### Server mode (SQLite backend)

```bash
npm install
npm run start
```

Then open `http://localhost:3000` in your browser.

## 🛠️ Development

```bash
npm install
npm run dev     # Vite hot-reload dev server (proxies /api → localhost:3000)
npm run server  # Start Express/SQLite backend separately
npm run build   # Rebuild dist/index.html
```

## 📐 Overtime Calculation

```
worked minutes   = clock-out − clock-in
expected minutes = default clock-out (17:00) − 08:00
overtime         = worked − expected  (positive = OT, negative = UT)
```

Entries where clock-in **or** clock-out is missing are ignored.
