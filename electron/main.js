import { app, BrowserWindow, shell, dialog } from 'electron';
import { get as httpGet } from 'http';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Resolve the server entry point ────────────────────────────────────────────
// In a packaged app, server.js is bundled inside the asar at the app root.
// During development it lives one level up from this file (the project root).
const serverPath = app.isPackaged
  ? join(app.getAppPath(), 'server.js')
  : join(__dirname, '..', 'server.js');

// ── Start the Express back-end ────────────────────────────────────────────────
async function startServer() {
  // Point the server at the OS user-data directory so the SQLite database
  // is stored in a writable location when running as a packaged app.
  process.env.CLOCKIN_DATA_DIR = app.getPath('userData');

  // Dynamically import server.js; it calls app.listen() on load.
  // Convert the absolute path to a file:// URL for ESM compatibility on Windows.
  const serverUrl = pathToFileURL(serverPath).href;
  await import(serverUrl);
}

// ── Wait for the server to accept connections ──────────────────────────────────
function waitForServer(url, maxRetries = 40, delayMs = 250) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      httpGet(url, (res) => {
        res.resume(); // consume response so the socket is released
        resolve();
      }).on('error', () => {
        if (maxRetries-- > 0) {
          setTimeout(attempt, delayMs);
        } else {
          reject(new Error('Server did not start in time'));
        }
      });
    };
    attempt();
  });
}

// ── Create the main window ────────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 640,
    minHeight: 480,
    title: 'Clock-In System',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL('http://localhost:3000');

  // Open external links in the system browser instead of a new Electron window
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  try {
    await startServer();
    await waitForServer('http://localhost:3000');
    createWindow();
  } catch (err) {
    dialog.showErrorBox(
      'Startup Error',
      `Failed to start the server:\n\n${err?.message ?? err}\n\nStack:\n${err?.stack ?? ''}`
    );
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
