// Configuration system for PompyTube features
// This provides the same interface as the original PompyTube config system
// but adapted for Electron environment

// Get configuration from the global object injected by main process
const getConfigFromMain = (key) => {
  if (window.pompyTubeConfig && window.pompyTubeConfig.hasOwnProperty(key)) {
    return window.pompyTubeConfig[key];
  }

  // Fallback to localStorage if available
  try {
    const storedConfig = JSON.parse(localStorage.getItem('pompyTubeConfig') || '{}');
    if (storedConfig.hasOwnProperty(key)) {
      return storedConfig[key];
    }
  } catch (e) {
    // console.warn('Failed to read config from localStorage:', e);
  }

  // Return default values for critical settings
  const defaults = {
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
    themeAccentColor: '#4CAF50'
  };

  return defaults[key] !== undefined ? defaults[key] : null;
};

// Set configuration and sync with main process if available
const setConfig = async (key, value) => {
  // Update local config
  window.pompyTubeConfig = window.pompyTubeConfig || {};
  window.pompyTubeConfig[key] = value;

  // Sync with main process if available
  if (window.pompyTubeAPI) {
    try {
      await window.pompyTubeAPI.setConfig(`features.${key}`, value);
    } catch (e) {
      // console.warn('Failed to sync config with main process:', e);
    }
  }

  // Also save to localStorage for persistence
  try {
    const storedConfig = JSON.parse(localStorage.getItem('pompyTubeConfig') || '{}');
    storedConfig[key] = value;
    localStorage.setItem('pompyTubeConfig', JSON.stringify(storedConfig));
  } catch (e) {
    // console.warn('Failed to save config to localStorage:', e);
  }
};

// Configuration change emitter (compatible with PompyTube)
const configChangeEmitter = {
  listeners: {},
  addEventListener(type, callback) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(callback);
  },
  removeEventListener(type, callback) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
  },
  dispatchEvent(event) {
    const type = event.type;
    if (!this.listeners[type]) return;
    this.listeners[type].forEach(cb => cb.call(this, event));
  }
};

// Initialize configuration by loading from main process
const initConfig = async () => {
  if (window.pompyTubeAPI) {
    try {
      const fullConfig = await window.pompyTubeAPI.getConfig('features');
      if (fullConfig) {
        window.pompyTubeConfig = fullConfig;
      }
    } catch (e) {
      // console.warn('Failed to load config from main process, using defaults:', e);
    }
  }

  // Ensure we have a config object
  window.pompyTubeConfig = window.pompyTubeConfig || {};

  // Apply defaults for any missing keys
  const defaults = {
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
    themeAccentColor: '#4CAF50'
  };

  for (const [key, value] of Object.entries(defaults)) {
    if (window.pompyTubeConfig[key] === undefined) {
      window.pompyTubeConfig[key] = value;
    }
  }
};

// Initialize config when script loads
initConfig().catch(() => {});

// Export functions to match PompyTube interface
export function configRead(key) {
  const value = getConfigFromMain(key);
  if (value === undefined || value === null) {
    // console.warn('Config key not found, using default:', key);
    const defaults = {
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
      themeAccentColor: '#4CAF50'
    };
    return defaults[key] || null;
  }
  return value;
}

export function configWrite(key, value) {
  setConfig(key, value).catch(() => {});
  configChangeEmitter.dispatchEvent(new CustomEvent('configChange', { detail: { key, value } }));
}

export { configChangeEmitter };
