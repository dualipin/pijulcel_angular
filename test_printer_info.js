const { app, BrowserWindow } = require('electron');
app.whenReady().then(async () => {
  let win = new BrowserWindow({ show: false });
  try {
    const printers = await win.webContents.getPrintersAsync();
    console.log(JSON.stringify(printers.find(p => p.name.includes('Ribetec')), null, 2));
  } catch(e) {}
  app.quit();
});
