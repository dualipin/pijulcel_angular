const { app, BrowserWindow } = require('electron');
app.whenReady().then(async () => {
  let win = new BrowserWindow({ show: false });
  try {
    const printers = await win.webContents.getPrintersAsync();
    printers.forEach(p => console.log(p.name, 'isDefault:', p.isDefault));
  } catch (e) {
    console.error('Error:', e.message);
  }
  app.quit();
});
