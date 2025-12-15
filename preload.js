const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'pompyTubeAPI', {
    // Configuration management
    getConfig: (key) => ipcRenderer.invoke('get-config', key),
    setConfig: (key, value) => ipcRenderer.invoke('set-config', key, value),

    // Feature controls
    openSettings: () => ipcRenderer.invoke('open-settings'),

    // Utility functions
    showNotification: (title, message) => {
      // This will be implemented in the renderer process
      if (window.showPompyTubeNotification) {
        window.showPompyTubeNotification(title, message);
      }
    },

    // Version info
    getAppVersion: () => {
      return process.env.npm_package_version || '1.0.0';
    },

    // Fullscreen control
    toggleFullscreen: () => {
      return ipcRenderer.invoke('toggle-fullscreen');
    }
  }
);

// Polyfills and global setup
window.addEventListener('DOMContentLoaded', () => {
  // Set up global configuration access
  window.pompyTubeConfig = window.pompyTubeConfig || {};

  // Expose API to window for backward compatibility
  window.pompyTube = {
    config: window.pompyTubeConfig,
    api: window.pompyTubeAPI,
    showSettings: () => {
      if (window.pompyTubeAPI) {
        window.pompyTubeAPI.openSettings();
      }
    },
    toggleFullscreen: () => {
      if (window.pompyTubeAPI) {
        // This will be implemented to call the main process
        return window.pompyTubeAPI.toggleFullscreen();
      }
      return false;
    }
  };

  // Add F11 key handling for fullscreen toggle
  document.addEventListener('keydown', (event) => {
    if (event.key === 'F11') {
      event.preventDefault();
      if (window.pompyTube && window.pompyTube.toggleFullscreen) {
        window.pompyTube.toggleFullscreen();
      }
    }
  });
});
