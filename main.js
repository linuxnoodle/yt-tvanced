const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// Simple configuration store using fs
class ConfigStore {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'pompytube-config.json');
    this.defaults = {
      window: {
        width: 1280,
        height: 720,
        fullscreen: true
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
        enablePaidPromotionOverlay: true,
        enableSpecialTheme: true,
        themePrimaryColor: '#0f0f0f',
        themeSecondaryColor: '#1a1a1a',
        themeBorderColor: '#2a2a2a',
        themeTextPrimary: '#ffffff',
        themeTextSecondary: '#b8b8b8',
        themeAccentColor: '#4CAF50',
        // Microphone settings
        enableMicrophoneAccess: true
      }
    };
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        return { ...this.defaults, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
    return { ...this.defaults };
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  get(key) {
    return key ? this.config[key] : this.config;
  }

  set(key, value) {
    this.config[key] = value;
    this.saveConfig();
  }
}

// Create configuration store
const configStore = new ConfigStore();

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
      partition: 'persist:pompytube',
      // Enable media features for microphone access
      webSecurity: true,
      experimentalFeatures: false,
      enableWebSQL: false,
      enableBlinkFeatures: 'MediaStreamTrack'
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'PompyTube',
    autoHideMenuBar: true
  });

  // Load YouTube TV
  mainWindow.loadURL('https://www.youtube.com/tv#/');

  // Always start in fullscreen mode (force override)
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setFullScreen(true);
      // Also update the config to ensure consistency
      configStore.set('window.fullscreen', true);
    }
  }, 100);

  // Set custom user agent to emulate Smart TV
  mainWindow.webContents.setUserAgent('Mozilla/5.0 (Linux; Android 12; Chromecast HD Build/STTF.220621.013; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/106.0.5249.79 Mobile Safari/537.36');

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

  // Inject PompyTube features when page is loaded
  mainWindow.webContents.on('did-finish-load', () => {
    injectPompyTubeFeatures();
  });

  // Handle navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('https://www.youtube.com/tv')) {
      event.preventDefault();
      mainWindow.loadURL('https://www.youtube.com/tv#/');
    }
  });

  // Handle media permissions for microphone access
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const requestingUrl = webContents.getURL();
    const features = configStore.get('features');

    // Handle microphone permissions for YouTube TV
    if (permission === 'media' && requestingUrl.includes('youtube.com')) {
      if (details.mediaTypes && details.mediaTypes.includes('microphone')) {
        if (features.enableMicrophoneAccess) {
          console.log('Granting microphone permission for YouTube TV');
          callback(true); // Grant permission
          return;
        } else {
          console.log('Microphone access disabled in settings');
          callback(false); // Deny permission
          return;
        }
      }
    }

    // Deny other media permissions by default for security
    console.log(`Denying ${permission} permission for ${requestingUrl}`);
    callback(false);
  });

  // Handle media access events
  mainWindow.webContents.on('media-started-playing', () => {
    console.log('Media playback started');
  });

  mainWindow.webContents.on('media-paused', () => {
    console.log('Media playback paused');
  });
}

// Inject PompyTube features into the page
function injectPompyTubeFeatures() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const features = configStore.get('features');



  // Force enableSpecialTheme for now (will be configurable later)
  features.enableSpecialTheme = true;
  mainWindow.webContents.executeJavaScript(`
    window.pompyTubeConfig = ${JSON.stringify(features)};
  `).catch(err => {
    console.error('Failed to inject configuration:', err);
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

  // Load theme system first
  try {
    const fs = require('fs');
    const themeScriptPath = path.join(__dirname, 'pompytube', 'theme.js');
    let themeScriptContent = fs.readFileSync(themeScriptPath, 'utf8');

    const wrappedThemeScript = `(function() {
      try {
        ${themeScriptContent}
        return true;
      } catch (error) {
        console.error('Theme script error:', error.message);
        console.error('Stack:', error.stack);
        if (window.pompyTubeAPI && window.pompyTubeAPI.showNotification) {
          window.pompyTubeAPI.showNotification('Theme Error', 'Failed to load: ' + error.message);
        }
        return false;
      }
    })();`;

    mainWindow.webContents.executeJavaScript(wrappedThemeScript).catch(err => {
      console.error('Failed to inject theme script:', err);
    });
  } catch (err) {
    console.error('Failed to read theme script file:', err);
  }

  // Load simplified PompyTube script
  try {
    // Read and process the simplified userScript
    const fs = require('fs');
    const pompyTubeScriptPath = path.join(__dirname, 'pompytube', 'userScriptSimple.js');
    let scriptContent = fs.readFileSync(pompyTubeScriptPath, 'utf8');

    // Wrap the script in a try-catch to get better error reporting
    const wrappedScript = `(function() {
      try {
        ${scriptContent}
        // console.log('PompyTube script executed successfully');
        return true;
      } catch (error) {
        // console.error('PompyTube script error:', error.message);
        // console.error('Stack:', error.stack);
        if (window.pompyTubeAPI && window.pompyTubeAPI.showNotification) {
          window.pompyTubeAPI.showNotification('PompyTube Error', 'Failed to load: ' + error.message);
        }
        return false;
      }
    })();`;

    // Inject the script content
    mainWindow.webContents.executeJavaScript(wrappedScript).catch(err => {
      // console.error('Failed to inject PompyTube script:', err);
    });

    // console.log('PompyTube script injection initiated');
  } catch (err) {
    // console.error('Failed to read PompyTube script file:', err);
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
          if (window.showPompyTubeSettings) {
            window.showPompyTubeSettings();
          } else {
            // console.log('PompyTube settings function not available');
          }
        `);
      }
});

// Handle fullscreen toggle requests from renderer process
ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
    return mainWindow.isFullScreen();
  }
  return false;
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

  // Register global shortcut for F11 to toggle fullscreen
  globalShortcut.register('F11', () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Unregister global shortcut when app is closing
  globalShortcut.unregisterAll();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
