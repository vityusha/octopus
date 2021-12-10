// preload.js

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  let shell = require('electron').shell
  document.addEventListener('click', function (event) {
    if (event.target.tagName === 'A' && event.target.href.includes('dialog.su')) {
      event.preventDefault()
      shell.openExternal(event.target.href)
    }
  })
})

const {
  contextBridge,
  ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld (
  "api", {
  sendData: (channel, data) => {
    // whitelist channels
    let validChannels = ["data-ready", "power", "log-message", "board-info", "netconfig", "dataconfig", "show-error"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receiveData: (channel, func) => {
    let validChannels = ["data-ready", "log-message", "board-info"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
    }
  }
});
