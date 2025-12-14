const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'tizenTubeAPI', {
    // Configuration management
    getConfig: (key) => ipcRenderer.invoke('get-config', key),
    setConfig: (key, value) => ipcRenderer.invoke('set-config', key, value),

    // Feature controls
    openSettings: () => ipcRenderer.invoke('open-settings'),

    // Utility functions
    showNotification: (title, message) => {
      // This will be implemented in the renderer process
      if (window.showTizenTubeNotification) {
        window.showTizenTubeNotification(title, message);
      }
    },

    // Version info
    getAppVersion: () => {
      return process.env.npm_package_version || '1.0.0';
    }
  }
);

// Polyfills and global setup
window.addEventListener('DOMContentLoaded', () => {
  // Set up global configuration access
  window.tizenTubeConfig = window.tizenTubeConfig || {};

  // Expose API to window for backward compatibility
  window.tizenTube = {
    config: window.tizenTubeConfig,
    api: window.tizenTubeAPI,
    showSettings: () => {
      if (window.tizenTubeAPI) {
        window.tizenTubeAPI.openSettings();
      }
    }
  };
});
