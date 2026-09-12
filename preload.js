const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("choxDesktop", {
  openExternal(url) {
    return ipcRenderer.invoke("open-external", url);
  }
});
