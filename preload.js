const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  activarRedimension: () => ipcRenderer.send('activar-redimension'),
  desactivarRedimension: () => ipcRenderer.send('desactivar-redimension'),
  saveBackup: (data) => ipcRenderer.send('save-backup', data),
  imprimirVariosTickets: (tickets) => ipcRenderer.invoke('imprimir-varios-tickets', tickets)
});
