const { app, BrowserWindow } = require('electron');
app.whenReady().then(async () => {
  let win = new BrowserWindow({ show: false });
  try {
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent('<h1>Ticket de Prueba</h1><p>Esto es una prueba de impresion</p>'));
    const printers = await win.webContents.getPrintersAsync();
    let target = printers.find(p => p.name.includes('Ribetec'));
    if (!target) return app.quit();
    
    console.log('Printing to:', target.name);
    try {
      await win.webContents.print({ 
        silent: true, 
        deviceName: target.name,
        margins: { marginType: 'none' }
      });
      console.log('Promise resolved. Waiting 3s before closing to prevent job cancellation...');
      setTimeout(() => {
         app.quit();
      }, 3000);
    } catch (e) {
      console.log('Promise rejected:', e.message);
      app.quit();
    }
  } catch (e) {
    app.quit();
  }
});
