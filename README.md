# Personal Clock-In System

A personal time-tracking web app to log clock-in / clock-out times, calculate overtime and undertime, and accumulate totals per calendar month.

## ✨ Features

- **Manual clock-in** — type your clock-in time yourself each day
- **Auto-filled clock-out** — defaults to 17:00 (changeable in Settings at any time)
- **Overtime / Undertime tracking** — calculated down to the minute based on standard work hours (08:00 – default clock-out)
- **Monthly accumulation** — totals reset automatically when the month changes
- **Entries only count when both clock-in and clock-out are filled**
- **No server required** — open `dist/index.html` directly in any browser

## 🚀 Usage (No Server Required)

Simply open `dist/index.html` in your browser:

```
double-click dist/index.html
```

That's it! All your data is saved locally in your browser's `localStorage`.

## 🛠️ Development

```bash
npm install
npm run dev     # hot-reload dev server
npm run build   # rebuild dist/index.html
```

## 📐 Overtime Calculation

```
worked minutes   = clock-out − clock-in
expected minutes = default clock-out (17:00) − 08:00
overtime         = worked − expected  (positive = OT, negative = UT)
```

Entries where clock-in **or** clock-out is missing are ignored.
