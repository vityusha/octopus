// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const path = require('path')

if (require('electron-squirrel-startup')) return app.quit();

/*
Menu template
*/
const netconfigUrll = "/cmd.cgi?cmd=net";
const deviceinfoUrll = "/cmd.cgi?cmd=info";

const template = [
  {
    label: 'Меню',
    submenu: [
      {
        label: 'Информация об устройстве...',
        id: 'menuDeviceInfo',
        enabled: false,
        click() {
          let child = new BrowserWindow({
            parent: BrowserWindow.getFocusedWindow(),
            modal: true,
            minimizable: false,
            maximizable: false,
            resizable: false,
            width: 710, height: 500,
            webPreferences: {
              enableRemoteModule: true,
              nodeIntegration: true,
              preload: path.join(__dirname, 'preload_board.js'),
            },
            icon: path.join(__dirname, './assets/ico/octopus.ico'),
          });
          child.setMenu(null);
          console.log('Opening http://' + boardIP + deviceinfoUrll);
          child.loadURL('http://' + boardIP + deviceinfoUrll);
        }
      },
      {
        label: 'Настройка сети...',
        id: 'menuNetConfig',
        enabled: false,
        click() {
          let child = new BrowserWindow({
            parent: BrowserWindow.getFocusedWindow(),
            modal: true,
            minimizable: false,
            maximizable: false,
            resizable: false,
            width: 710, height: 540,
            webPreferences: {
              enableRemoteModule: true,
              nodeIntegration: true,
              preload: path.join(__dirname, 'preload_board.js'),
            },
            icon: path.join(__dirname, './assets/ico/octopus.ico'),
          });
          child.setMenu(null);
          console.log('Opening http://' + boardIP + netconfigUrll);
          child.loadURL('http://' + boardIP + netconfigUrll);
        }
      },
      { type: 'separator' },
      {
        label: 'Выход',
        click() {
          app.quit()
        },
        accelerator: 'Alt+F4',
      },
    ]
  },
  {
    label: 'О программе',
    click() {
      let details =
        ['Interface to LAIN USB charger\n',
          'Copyright (c) 2024 LAIN LLC',
          'E-Mail: support@dialog.su',
          'Web: http://www.dialog.su'
        ].join('\n');
      dialog.showMessageBox({
        type: 'info',
        title: `About ${app.getName()}`,
        message: `${app.getName()} ${app.getVersion()}`,
        detail: `${details}`,
        buttons: [],
        icon: path.join(__dirname, '..', './assets/ico/octopus.png'),
      });
    }
  }
];

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1235,
    height: 205, // real 190, develop 800
    maximizable: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, './assets/ico/octopus.ico'),
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  //mainWindow.webContents.openDevTools({ mode: 'bottom' })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Recieve data from renderer
ipcMain.on('log-message', (event, arg) => {
  console.log(arg);
})

ipcMain.on('power', (event, arg) => {
  Menu.getApplicationMenu().getMenuItemById('menuNetConfig').enabled = arg;
  Menu.getApplicationMenu().getMenuItemById('menuDeviceInfo').enabled = arg;
})

// Recieve data from renderer
ipcMain.on('show-error', (event, arg) => {
  dialog.showMessageBox({
    type: 'error',
    title: 'Ошибка',
    message: arg,
    detail: 'Проверьте подключение устройства!',
    buttons: [],
  });
})

// RESTfil API
const restful = require('./restful')
ipcMain.on('netconfig', (event, arg) => {
  restful.netconfig(boardIP, arg);
})

ipcMain.on('dataconfig', (event, arg) => {
  restful.dataconfig(boardIP, arg);
})

var boardIP = "192.168.0.1;"

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const poller = require('./poller')

function processData(err, data) {
    if(err == null) {
        mainWindow.webContents.send('data-ready', data);
    } else {
        console.log(err);
    }
}

const finder = require('./finder')
finder.start((error, result) => {
    if(error) {
        mainWindow.webContents.send('board-info', null);
        console.log("Cannot connect to Octopus hardware")
    } else {
        mainWindow.webContents.send('board-info', result);
        poller.start(result.boardIP, processData)
        boardIP = result.boardIP;
    }
})
