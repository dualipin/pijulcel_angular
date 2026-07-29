const { app, BrowserWindow } = require('electron');
app.whenReady().then(async () => {
  let win = new BrowserWindow({ show: false });
  try {
    await win.loadURL('data:text/html;charset=utf-8,<h1>Test</h1>');
    const printers = await win.webContents.getPrintersAsync();
    let target = printers.find(p => p.name.includes('Ribetec'));
    if (!target) return app.quit();
    
    console.log('Testing modern promise API on', target.name);
    try {
      await win.webContents.print({ 
        silent: true, 
        deviceName: target.name 
      });
      console.log('Promise resolved: success');
    } catch (e) {
      console.log('Promise rejected:', e.message);
    }
  } catch (e) {}
  app.quit();
});
