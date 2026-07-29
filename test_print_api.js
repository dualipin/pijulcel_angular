const { app, BrowserWindow } = require('electron');
app.whenReady().then(async () => {
  let win = new BrowserWindow({ show: false });
  try {
    let callbackCalled = false;
    const res = win.webContents.print({ silent: true }, (success, error) => {
      console.log('callback:', success, error);
      callbackCalled = true;
    });
    console.log('Result is promise?', res instanceof Promise);
    if (res instanceof Promise) {
      await res;
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
  app.quit();
});
