const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
var debug = true;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const path = require('path');

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,
    icon: __dirname + '/dist/pijulcel-frontend/browser/assets/logo.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })
  // and load the index.html of the app.
  //if (debug)


  mainWindow.loadFile(path.join(__dirname, 'dist/pijulcel-frontend/browser/index.html'))
  // const frontendWebUrl = 'http://localhost:4200'
  // mainWindow.loadURL(frontendWebUrl)

  // mainWindow.loadURL(`file://${__dirname}/dist/pijulcel-frontend/browser/index.html`)
  //else
  //mainWindow.loadURL(`file://${__dirname}/index.html`)
  // mainWindow.loadURL(
  //   url.format({
  //     pathname: path.join(__dirname, `/dist/index.html`),
  //     protocol: "file:",
  //     slashes: true
  //   })
  // );
  // Open the DevTools.
  //if (debug) mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})


const { ipcMain } = require('electron');


// main.js
ipcMain.handle('imprimir-varios-tickets', async (event, ticketsHTML) => {
  for (let html of ticketsHTML) {
    await new Promise(async (resolve, reject) => {
      let win = new BrowserWindow({
        show: false,
        width: 400,
        height: 600,
        webPreferences: {
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')
        }
      });

      try {
        await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

        let printers = await win.webContents.getPrintersAsync();
        let targetPrinter = printers.find(p => p.isDefault) ||
          printers.find(p => p.name.toLowerCase().includes('epson') || p.name.toLowerCase().includes('tm-t20') || p.name.toLowerCase().includes('ribetec') || p.name.toLowerCase().includes('rt-420') || p.name.toLowerCase().includes('pos') || p.name.toLowerCase().includes('termic') || p.name.toLowerCase().includes('ticket')) ||
          printers[0];

        let printOptions = { 
          silent: true,
          margins: { marginType: 'none' } 
        };
        if (targetPrinter) {
          printOptions.deviceName = targetPrinter.name;
        }

        try {
          await win.webContents.print(printOptions);
          resolve('ok');
        } catch (printErr) {
          reject(printErr.message || printErr);
        } finally {
          if (win) {
            setTimeout(() => {
              if (!win.isDestroyed()) {
                win.close();
              }
            }, 3000);
          }
        }

      } catch (err) {
        reject(err);
        if (win) {
          win.close();
          win = null;
        }
      }
    });
  }
  return 'done';
});



ipcMain.on('activar-redimension', () => {
  if (mainWindow) {
    mainWindow.setResizable(true);
    mainWindow.maximize();
  }
});

ipcMain.on('desactivar-redimension', () => {
  if (mainWindow) {
    mainWindow.unmaximize(); // Restaurar primero
    mainWindow.setSize(900, 600); // Tamaño original deseado
    mainWindow.setResizable(false)
  }
});

const { dialog } = require('electron');
const fs = require('fs');

ipcMain.on('save-backup', async (event, buffer) => {
  // 📅 Generar fecha actual
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

  // Nombre sugerido
  const defaultName = `backup_${timestamp}.zip`;

  const { filePath } = await dialog.showSaveDialog({
    title: 'Guardar copia de seguridad',
    defaultPath: defaultName,   // 👈 Aquí usamos el nombre con fecha
    buttonLabel: 'Guardar',
    filters: [{ name: 'ZIP', extensions: ['zip'] }],
  });

  if (filePath) {
    try {
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log('✅ Archivo guardado exitosamente en:', filePath);
    } catch (err) {
      console.error('❌ Error guardando archivo:', err?.message);
    }
  }
});

