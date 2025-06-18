const { contextBridge, ipcRenderer } = require('electron')

// Güvenli API'yi renderer process'e aç
contextBridge.exposeInMainWorld('electronAPI', {
  // Uygulama bilgileri
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  
  // Platform bilgisi
  platform: process.platform,
  
  // Dosya işlemleri (ileride gerekirse)
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data)
})

// Console logları için (development)
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('electronDev', {
    log: (message) => console.log('[Renderer]:', message)
  })
} 