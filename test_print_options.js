const { app, BrowserWindow } = require('electron');
app.whenReady().then(async () => {
  let win = new BrowserWindow({ show: false });
  try {
    await win.loadURL('data:text/html;charset=utf-8,<h1>Test</h1>');
    const printers = await win.webContents.getPrintersAsync();
    let target = printers.find(p => p.name.includes('Ribetec'));
    if (!target) return app.quit();
    
    console.log('Testing with margins/pageSize on', target.name);
    win.webContents.print({ 
      silent: true, 
      deviceName: target.name,
      margins: { marginType: 'none' }
    }, (success, err) => {
      console.log('Print result (margins):', success, err);
      if (!success) {
         win.webContents.print({ 
           silent: true, 
           deviceName: target.name,
           margins: { marginType: 'none' },
           pageSize: 'A4'
         }, (success2, err2) => {
            console.log('Print result (margins+A4):', success2, err2);
            app.quit();
         });
      } else {
         app.quit();
      }
    });
  } catch (e) {
    app.quit();
  }
});
