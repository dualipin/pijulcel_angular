const { app, BrowserWindow } = require('electron');
app.whenReady().then(async () => {
  let win = new BrowserWindow({ show: false });
  try {
    const printers = await win.webContents.getPrintersAsync();
    let targetPrinter = printers.find(p => p.name.toLowerCase().includes('ribetec') || p.name.toLowerCase().includes('rt-420'));
    if (targetPrinter) {
      console.log('Found ticket printer:', targetPrinter.name);
      win.webContents.print({ silent: true, deviceName: targetPrinter.name }, (success, error) => {
         console.log('Print result:', success, error);
         app.quit();
      });
    } else {
      console.log('No ticket printer found');
      app.quit();
    }
  } catch (e) {
    console.error('Error:', e.message);
    app.quit();
  }
});
