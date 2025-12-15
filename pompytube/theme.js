// Special Theme System for PompyTube
// Applies dark theme colors to both PompyTube UI and YouTube TV elements

// CSS variables for theming
const THEME_CSS = `
  :root {
    --pompytube-primary-bg: #1a1a1a;
    --pompytube-secondary-bg: #222222;
    --pompytube-border: #333333;
    --pompytube-text-primary: #ffffff;
    --pompytube-text-secondary: #cccccc;
    --pompytube-accent: #4CAF50;
  }

  /* PompyTube UI Overrides */
  .pompytube-modal {
    background-color: var(--pompytube-primary-bg) !important;
    color: var(--pompytube-text-primary) !important;
    border: 1px solid var(--pompytube-border) !important;
  }

  .pompytube-modal-header {
    border-bottom: 1px solid var(--pompytube-border) !important;
  }

  .pompytube-button {
    background-color: transparent !important;
    border: 1px solid var(--pompytube-border) !important;
    color: var(--pompytube-text-primary) !important;
  }

  .pompytube-button:hover {
    background-color: var(--pompytube-secondary-bg) !important;
  }

  .pompytube-toast {
    background-color: rgba(26, 26, 26, 0.95) !important;
    color: var(--pompytube-text-primary) !important;
    border: 1px solid var(--pompytube-border) !important;
  }

  /* YouTube TV Interface Overrides */
  /* Dark backgrounds */
  ytd-app,
  #content.ytd-app,
  ytd-browse,
  ytd-watch,
  ytd-watch-flexy {
    background-color: var(--pompytube-primary-bg) !important;
  }

  /* Hide YouTube branding elements */
  .yt-spec-button-shape-next--mono.yt-spec-button-shape-next--text,
  .ytp-chrome-top .ytp-title-channel,
  .ytp-chrome-top .ytp-title-text {
    color: var(--pompytube-text-secondary) !important;
  }

  /* Progress bar and controls */
  .ytp-chrome-bottom {
    background: linear-gradient(to top, var(--pompytube-primary-bg), transparent) !important;
  }

  /* Video player area */
  .html5-video-player {
    background-color: #000000 !important;
  }

  /* Search and navigation */
  #masthead,
  #search-input input,
  ytd-searchbox {
    background-color: var(--pompytube-secondary-bg) !important;
    border-color: var(--pompytube-border) !important;
  }

  /* Cards and thumbnails */
  ytd-rich-grid-media,
  ytd-video-meta-block,
  ytd-compact-video-renderer {
    background-color: transparent !important;
  }

  /* Text colors */
  ytd-rich-grid-media #video-title,
  ytd-compact-video-renderer #video-title,
  .ytd-video-meta-block .ytd-video-meta-block {
    color: var(--pompytube-text-primary) !important;
  }

  /* Secondary text */
  .ytd-video-meta-block #metadata-line,
  .ytd-compact-video-renderer #metadata-line {
    color: var(--pompytube-text-secondary) !important;
  }

  /* Sidebar */
  #guide-content,
  ytd-guide-section-renderer {
    background-color: var(--pompytube-primary-bg) !important;
  }

  /* Comments section */
  ytd-comments {
    background-color: var(--pompytube-primary-bg) !important;
  }

  /* Player controls */
  .ytp-button {
    color: var(--pompytube-text-primary) !important;
  }

  /* Volume and progress bars */
  .ytp-volume-slider,
  .ytp-progress-bar {
    background-color: var(--pompytube-border) !important;
  }


`;

let themeStyleElement = null;
let isThemeApplied = false;

// Apply the special theme
function applySpecialTheme() {
  if (isThemeApplied) return;

  // Update CSS variables with config values
  const primaryColor = window.pompyTubeConfig?.themePrimaryColor || '#0f0f0f';
  const secondaryColor = window.pompyTubeConfig?.themeSecondaryColor || '#1a1a1a';
  const borderColor = window.pompyTubeConfig?.themeBorderColor || '#2a2a2a';
  const textPrimary = window.pompyTubeConfig?.themeTextPrimary || '#ffffff';
  const textSecondary = window.pompyTubeConfig?.themeTextSecondary || '#b8b8b8';
  const accentColor = window.pompyTubeConfig?.themeAccentColor || '#4CAF50';

  let cssWithVars = THEME_CSS
    .replace('--pompytube-primary-bg: #1a1a1a', `--pompytube-primary-bg: ${primaryColor}`)
    .replace('--pompytube-secondary-bg: #222222', `--pompytube-secondary-bg: ${secondaryColor}`)
    .replace('--pompytube-border: #333333', `--pompytube-border: ${borderColor}`)
    .replace('--pompytube-text-primary: #ffffff', `--pompytube-text-primary: ${textPrimary}`)
    .replace('--pompytube-text-secondary: #cccccc', `--pompytube-text-secondary: ${textSecondary}`)
    .replace('--pompytube-accent: #4CAF50', `--pompytube-accent: ${accentColor}`);

  // Inject CSS
  themeStyleElement = document.createElement('style');
  themeStyleElement.id = 'pompytube-special-theme';
  themeStyleElement.textContent = cssWithVars;
  document.head.appendChild(themeStyleElement);

  isThemeApplied = true;
}

// Remove the special theme
function removeSpecialTheme() {
  if (!isThemeApplied) return;

  if (themeStyleElement && themeStyleElement.parentNode) {
    themeStyleElement.parentNode.removeChild(themeStyleElement);
    themeStyleElement = null;
  }

  isThemeApplied = false;
}

// Toggle theme based on config
function updateThemeFromConfig() {
  const enabled = window.pompyTubeConfig?.enableSpecialTheme;
  if (enabled) {
    applySpecialTheme();
  } else {
    removeSpecialTheme();
  }
}

// Initialize theme on load
function initTheme() {
  // Apply theme immediately if enabled
  updateThemeFromConfig();

  // Listen for config changes
  if (window.pompyTubeConfigChangeEmitter) {
    window.pompyTubeConfigChangeEmitter.addEventListener('configChange', (event) => {
      const { key } = event.detail;
      if (key === 'enableSpecialTheme' || key.startsWith('theme')) {
        updateThemeFromConfig();
      }
    });
  }
}

// Initialize theme when config is ready
if (window.pompyTubeConfig) {
  initTheme();
} else {
  // Wait for config to be available
  const checkConfig = setInterval(() => {
    if (window.pompyTubeConfig) {
      clearInterval(checkConfig);
      initTheme();
    }
  }, 100);
}



// Expose functions globally for compatibility
window.applySpecialTheme = applySpecialTheme;
window.removeSpecialTheme = removeSpecialTheme;
window.updateThemeFromConfig = updateThemeFromConfig;
