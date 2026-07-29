const { app, BrowserWindow } = require('electron');
app.whenReady().then(async () => {
  let win = new BrowserWindow({ show: false });
  try {
    const printers = await win.webContents.getPrintersAsync();
    console.log(JSON.stringify(printers, null, 2));
  } catch (e) {
    console.error(e);
  }
  app.quit();
});
