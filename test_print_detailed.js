const { app, BrowserWindow } = require('electron');
app.whenReady().then(async () => {
  let win = new BrowserWindow({ show: false });
  try {
    await win.loadURL('data:text/html;charset=utf-8,<h1>Test</h1>');
    const printers = await win.webContents.getPrintersAsync();
    let target = printers.find(p => p.name.toLowerCase().includes('epson') || p.name.toLowerCase().includes('tm-t20') || p.name.toLowerCase().includes('ribetec') || p.name.toLowerCase().includes('rt-420'));
    if (!target) {
      console.log('No ticket printer found among:', printers.map(p => p.name).join(', '));
      app.quit();
      return;
    }
    console.log('Found:', target.name);
    win.webContents.print({ silent: true, deviceName: target.name }, (success, err) => {
      console.log('Print silent result:', success, err);
      app.quit();
    });
  } catch (e) {
    console.error('Exception:', e.message);
    app.quit();
  }
});
