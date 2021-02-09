// @ts-nocheck
const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 700,
    minHeight: 700,
    minWidth: 1050,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false, // false 允许跨域
    },
    // frame: false, // 隐藏状态栏
    // titleBarStyle: 'hidden', //mac隐藏状态栏
  });

  // 开发环境使用 http 协议 生产环境使用 file 协议
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000/');
    // 打开开发者工具，默认不打开
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`file://${__dirname}/index.html`);
  }

  // 关闭window时触发下列事件.
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

ipcMain.on('min', () => mainWindow.minimize());
ipcMain.on('max', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});

ipcMain.on('show', () => {
  mainWindow.show();
  mainWindow.focus();
});

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', () => {
  createWindow();
});

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  mainWindow = null;
});
