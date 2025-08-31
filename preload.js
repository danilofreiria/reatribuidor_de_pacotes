const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  uploadCSV: (tipo) => ipcRenderer.invoke("upload-csv", tipo),
  searchByBR: (br) => ipcRenderer.invoke("search-by-br", br),
  searchByCEP: (cep) => ipcRenderer.invoke("search-by-cep", cep),
  saveLog: (dados) => ipcRenderer.invoke("save-log", dados),
  exportarRelatorio: () => ipcRenderer.invoke("exportar-relatorio"),
  openManualWindow: () => ipcRenderer.invoke("open-manual-window"),
});
