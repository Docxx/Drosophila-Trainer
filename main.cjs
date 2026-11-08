// Electron shell. Serves the app over a private app:// scheme so the renderer
// can fetch() the model files (file:// fetches are blocked).
const { app, BrowserWindow, protocol, net } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = __dirname;
const snapshotArg = process.argv.find((a) => a.startsWith('--snapshot='));
// Optional script file run in the page before the snapshot (e.g. to set the view).
const snapshotJsArg = process.argv.find((a) => a.startsWith('--snapshot-js='));
const snapshotJs = snapshotJsArg && fs.readFileSync(snapshotJsArg.split('=')[1], 'utf8');
if (snapshotArg) {
  const profile = path.join(ROOT, 'tmp', 'snapshot-profile');
  fs.mkdirSync(profile, { recursive: true });
  app.setPath('userData', profile);
}
const sizeArg = snapshotArg && process.argv.find((a) => a.startsWith('--snapshot-size='));
const snapshotSize = sizeArg
  ?.split('=')[1]
  .match(/^(\d+)x(\d+)$/)
  ?.slice(1)
  .map(Number);

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

function createWindow() {
  const win = new BrowserWindow({
    width: snapshotSize ? Math.max(1000, snapshotSize[0]) : 1400,
    height: snapshotSize ? Math.max(700, snapshotSize[1]) : 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#101317',
    title: 'Fly Trainer',
    autoHideMenuBar: true,
    // Snapshot runs stay hidden so they never steal clicks from the desktop.
    show: !snapshotArg,
    // Snapshots render offscreen: no window appears, but frames still paint.
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, offscreen: !!snapshotArg },
  });
  win.webContents.on('console-message', (_e, level, message, line, source) => {
    if (level >= 2) console.error(`[renderer] ${message} (${source}:${line})`);
  });
  // Dev aid: `--open=<lesson id>` starts on that lesson instead of the course hub.
  const openArg = process.argv.find((a) => a.startsWith('--open='))?.split('=')[1];
  win.loadURL(`app://fly/src/index.html${openArg ? `?open=${encodeURIComponent(openArg)}` : ''}`);

  if (snapshotArg) {
    // Dev aid: `electron . --snapshot=out.png` saves the window once the fly has loaded.
    const out = path.resolve(snapshotArg.split('=')[1]);
    win.webContents.once('did-finish-load', () => {
      (async () => {
        // Geometry builds vary with hardware. Wait for actual readiness instead
        // of capturing a loading screen after an arbitrary fixed delay.
        const deadline = Date.now() + 60000;
        while (true) {
          const status = await win.webContents.executeJavaScript('({ready: !!window.scope?.ready, error: window.scope?.error})');
          if (status.error) throw new Error(status.error);
          if (status.ready) break;
          if (Date.now() > deadline) throw new Error('Reference specimens did not become ready within 60 seconds');
          await new Promise((r) => setTimeout(r, 200));
        }
        if (snapshotJs) {
          console.log(`setup: ${await win.webContents.executeJavaScript(snapshotJs)}`);
          await new Promise((r) => setTimeout(r, 500));
        }
        const state = await win.webContents.executeJavaScript(
          'JSON.stringify({q: window.scope?.holder?.quaternion.toArray(), y: window.scope?.holder?.position.y})',
        );
        console.log(`fly state ${state}`);
        fs.writeFileSync(out, (await win.webContents.capturePage()).toPNG());
        console.log(`snapshot saved to ${out}`);
        app.quit();
      })().catch((error) => {
        console.error(error);
        app.exit(1);
      });
    });
  }
}

app.whenReady().then(() => {
  protocol.handle('app', (req) => {
    const rel = decodeURIComponent(new URL(req.url).pathname);
    const file = path.normalize(path.join(ROOT, rel));
    const relative = path.relative(ROOT, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return new Response('Forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
