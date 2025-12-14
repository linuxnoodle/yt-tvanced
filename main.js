const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ElectronStore = require('electron-store');
const { autoUpdater } = require('electron-updater');

// Create configuration store
const configStore = new ElectronStore({
  name: 'youtube-tv-config',
  defaults: {
    window: {
      width: 1280,
      height: 720,
      fullscreen: false
    },
    features: {
      enableAdBlock: true,
      enableSponsorBlock: true,
      sponsorBlockManualSkips: ['intro', 'outro', 'filler'],
      enableSponsorBlockSponsor: true,
      enableSponsorBlockIntro: true,
      enableSponsorBlockOutro: true,
      enableSponsorBlockInteraction: true,
      enableSponsorBlockSelfPromo: true,
      enableSponsorBlockPreview: true,
      enableSponsorBlockMusicOfftopic: true,
      enableSponsorBlockFiller: false,
      enableDeArrow: true,
      enableDeArrowThumbnails: false,
      preferredVideoQuality: 'auto',
      videoPreferredCodec: 'vp9',
      enableChapters: true,
      enableLongPress: true,
      enableShorts: true,
      enablePreviews: true,
      enableHideWatchedVideos: false,
      hideWatchedVideosThreshold: 80,
      hideWatchedVideosPages: [],
      enableHideEndScreenCards: false,
      enableYouThereRenderer: true,
      enablePaidPromotionOverlay: true
    }
  }
});

// Global reference to main window
let mainWindow;

function createWindow() {
  // Create the browser window
  const windowConfig = configStore.get('window');

  mainWindow = new BrowserWindow({
    width: windowConfig.width,
    height: windowConfig.height,
    fullscreen: windowConfig.fullscreen,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webviewTag: false,
      partition: 'persist:youtubetv'
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'YouTube TV Enhanced',
    autoHideMenuBar: true
  });

  // Load YouTube TV
  mainWindow.loadURL('https://www.youtube.com/tv#/');

  // Set custom user agent to emulate Smart TV
  mainWindow.webContents.setUserAgent('Mozilla/5.0 (WebOS; SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5283.0 Safari/537.36');

  // Handle window events
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('resize', () => {
    if (mainWindow) {
      const [width, height] = mainWindow.getSize();
      configStore.set('window.width', width);
      configStore.set('window.height', height);
    }
  });

  mainWindow.on('enter-full-screen', () => {
    configStore.set('window.fullscreen', true);
  });

  mainWindow.on('leave-full-screen', () => {
    configStore.set('window.fullscreen', false);
  });

  // Inject TizenTube features when page is loaded
  mainWindow.webContents.on('did-finish-load', () => {
    injectTizenTubeFeatures();
  });

  // Handle navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('https://www.youtube.com/tv')) {
      event.preventDefault();
      mainWindow.loadURL('https://www.youtube.com/tv#/');
    }
  });
}

// Inject TizenTube features into the page
function injectTizenTubeFeatures() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const features = configStore.get('features');

  // Inject configuration first
  mainWindow.webContents.executeJavaScript(`
    window.tizenTubeConfig = ${JSON.stringify(features)};
    // console.log('TizenTube configuration injected');
  `).catch(err => {
    // console.error('Failed to inject configuration:', err);
  });

  // Inject core polyfills
  mainWindow.webContents.executeJavaScript(`
    // DOMRect polyfill
    if (typeof DOMRect === 'undefined') {
      class DOMRect {
        constructor(x = 0, y = 0, width = 0, height = 0) {
          this.x = x;
          this.y = y;
          this.width = width;
          this.height = height;
          this.top = y;
          this.right = x + width;
          this.bottom = y + height;
          this.left = x;
        }

        static fromRect(other) {
          return new DOMRect(other.x, other.y, other.width, other.height);
        }

        toJSON() {
          return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            top: this.top,
            right: this.right,
            bottom: this.bottom,
            left: this.left
          };
        }
      }

      window.DOMRect = DOMRect;
    }
  `).catch(err => {
    // console.error('Failed to inject polyfills:', err);
  });

// Load simplified TizenTube script
try {
  // Read and process the simplified userScript
  const fs = require('fs');
  const tizenTubeScriptPath = path.join(__dirname, 'tizentube', 'userScriptSimple.js');
  let scriptContent = fs.readFileSync(tizenTubeScriptPath, 'utf8');

  // Wrap the script in a try-catch to get better error reporting
  const wrappedScript = `(function() {
    try {
      ${scriptContent}
      // console.log('TizenTube script executed successfully');
      return true;
    } catch (error) {
      // console.error('TizenTube script error:', error.message);
      // console.error('Stack:', error.stack);
      if (window.tizenTubeAPI && window.tizenTubeAPI.showNotification) {
        window.tizenTubeAPI.showNotification('TizenTube Error', 'Failed to load: ' + error.message);
      }
      return false;
    }
  })();`;

  // Inject the script content
  mainWindow.webContents.executeJavaScript(wrappedScript).catch(err => {
    // console.error('Failed to inject TizenTube script:', err);
  });

  // console.log('TizenTube script injection initiated');
} catch (err) {
  // console.error('Failed to read TizenTube script file:', err);
}
}

// Handle IPC messages
ipcMain.handle('get-config', (event, key) => {
  return configStore.get(key);
});

ipcMain.handle('set-config', (event, key, value) => {
  configStore.set(key, value);
  return true;
});

ipcMain.handle('open-settings', () => {
      if (mainWindow) {
        mainWindow.webContents.executeJavaScript(`
          if (window.showTizenTubeSettings) {
            window.showTizenTubeSettings();
          } else {
            // console.log('TizenTube settings function not available');
          }
        `);
      }
});

// Handle auto-updates
function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    // console.log('Update available');
  });

  autoUpdater.on('update-downloaded', () => {
    // console.log('Update downloaded, will install on restart');
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded');
    }
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  // console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  // console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
