import "whatwg-fetch";
import 'core-js/proposals/object-getownpropertydescriptors';
import '@formatjs/intl-getcanonicallocales/polyfill.iife'
import '@formatjs/intl-locale/polyfill.iife'
import '@formatjs/intl-displaynames/polyfill.iife'
import '@formatjs/intl-displaynames/locale-data/en';

// Import configuration system first
import { configRead, configWrite, configChangeEmitter } from './config.js';

// Import core features
import './features/adblock.js';
import './features/sponsorblock.js';

// Import UI components (these will be implemented next)
import './ui/ui.js';
import './ui/ytUI.js';

// Import utility functions
import './utils/tiny-sha256.js';

// Log initialization
// console.log('TizenTube Electron Edition initialized');

// Show welcome message if enabled
if (configRead('showWelcomeToast')) {
  setTimeout(() => {
    if (window.showToast) {
      window.showToast('TizenTube', 'Enhanced YouTube TV experience loaded');
    }
  }, 2000);
}

// Expose global functions for settings UI
window.showTizenTubeSettings = function() {
  // console.log('Opening TizenTube settings...');
  // This will be implemented in the UI components
  if (window.openTizenTubeSettingsModal) {
    window.openTizenTubeSettingsModal();
  } else {
    // console.warn('Settings modal function not available');
  }
};

// Handle configuration changes
configChangeEmitter.addEventListener('configChange', (event) => {
  const { key, value } = event.detail;
  // console.log(`Configuration changed: ${key} = ${value}`);

  // Reload features if critical settings change
  if (['enableAdBlock', 'enableSponsorBlock'].includes(key)) {
    // console.log(`Reloading features due to ${key} change`);
    location.reload();
  }
});

// Export configuration functions to window for debugging
window.tizenTubeConfigRead = configRead;
window.tizenTubeConfigWrite = configWrite;

// Log feature status
// console.log('Features status:');
// console.log('- Ad Blocking:', configRead('enableAdBlock'));
// console.log('- SponsorBlock:', configRead('enableSponsorBlock'));
// console.log('- DeArrow:', configRead('enableDeArrow'));
// console.log('- Preferred Quality:', configRead('preferredVideoQuality'));
// console.log('- Video Codec:', configRead('videoPreferredCodec'));

// Handle errors globally
window.addEventListener('error', (event) => {
  // console.error('TizenTube error:', event.error);
  if (window.showToast) {
    window.showToast('TizenTube Error', 'An error occurred. Check console for details.');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  // console.error('TizenTube unhandled rejection:', event.reason);
  if (window.showToast) {
    window.showToast('TizenTube Error', 'An unhandled promise rejection occurred.');
  }
});

// Check for updates periodically
setInterval(async () => {
  if (window.tizenTubeAPI) {
    try {
      const version = await window.tizenTubeAPI.getAppVersion();
      // console.log(`Current version: ${version}`);
    } catch (e) {
      // console.warn('Failed to check version:', e);
    }
  }
}, 3600000); // Check every hour
