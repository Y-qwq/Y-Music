// 引入electron并创建一个Browserwindow
const {app, BrowserWindow, ipcMain, Menu, globalShortcut } = require('electron')

// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;

const GLOBAL_SHORTCUT = {
  'CommandOrControl+Alt+Right': 'nextMusic',
  'CommandOrControl+Alt+Left': 'prevMusic',
  'CommandOrControl+Alt+Up': 'volumeUp',
  'CommandOrControl+Alt+Down': 'volumeDown',
  'CommandOrControl+Alt+Space': 'changePlayingStatus',
  'CommandOrControl+Alt+L': 'like'
};

const template = [
  {
    label: '编辑',
    submenu: [
      {
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: '查看',
    submenu: [
      {
        label: '重载',
        accelerator: 'CmdOrCtrl+R',
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            // 重载之后, 刷新并关闭所有的次要窗体
            if (focusedWindow.id === 1) {
              BrowserWindow.getAllWindows().forEach(function (win) {
                if (win.id > 1) {
                  win.close();
                }
              });
            }
            focusedWindow.reload();
          }
        }
      },
      {
        label: '切换开发者工具',
        accelerator: (function () {
          if (process.platform === 'darwin') {
            return 'Alt+Command+I';
          } else {
            return 'Ctrl+Shift+I';
          }
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        }
      }
    ]
  }
];

ipcMain.on('min', () => mainWindow.minimize());
ipcMain.on('max', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('show', () => {
  mainWindow.show();
  mainWindow.focus();
});

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 700,
    minHeight:700,
    minWidth:1050,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false  // false 允许跨域
    },
    frame:false,  // 隐藏状态栏
    titleBarStyle: 'hidden'  //mac隐藏状态栏
  })

  // 开发环境使用 http 协议 生产环境使用 file 协议
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5000/');
    // 打开开发者工具，默认不打开
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(`file://${__dirname}/index.html`);
  }


  // 关闭window时触发下列事件.
  mainWindow.on('closed', function () {
    mainWindow = null
  })

  Object.keys(GLOBAL_SHORTCUT).forEach((key) => {
    globalShortcut.register(key, () => {
      mainWindow.webContents.send('store-data', GLOBAL_SHORTCUT[key]);
    });
  });

  // 检测注册事件
  // globalShortcut.isRegistered('CommandOrControl+Alt+Space')
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', ()=>{
  createWindow();
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
})

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
 if (mainWindow === null) {
   createWindow()
 }
})

app.on('before-quit', (e) => {
  mainWindow = null;
});
