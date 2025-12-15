<h1 align="center">PompyTube</h1>

<div align="center">
  <img src="assets/icon.png" alt="PompyTube Icon" style="background-color: transparent;" width="200">
</div>

A cross-platform (desktop only) YouTube TV client with Adblocking and SponsorBlock. This project was created when I setup a home PC to connect to a TV, but Kodi was genuinely just terrible. I just launch this through Steam Big Picture.

## Installation & Setup

### Prerequisites
- **Node.js** 16 or higher
- **pnpm** (you can use yarn or npm too)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/linuxnoodle/PompyTube
cd PompyTube

# Install dependencies
pnpm install

# Start the application
pnpm start

# You should really just build this.
```

## 🔧 Building Executables

This project uses **electron-builder** to create platform-specific executables. Here's how to build for different platforms:

### Build for Current Platform
```bash
pnpm dist
```

### Keyboard Shortcuts
- **F11**: Toggle fullscreen
- **Esc**: Exit fullscreen
- **Arrow Keys**: Navigation
- **Enter**: Select
- **Space**: Play/Pause

### Configuration
The app stores all configuration in a persistent store. You can access settings through:

1. **Settings Menu**: Click the gear icon in the interface
2. **Configuration File**: Located in your system's app data directory
3. **IPC Commands**: Advanced users can use Electron's IPC for configuration

### Feature Configuration
All features can be toggled and configured:
```json
{
  "features": {
    "enableAdBlock": true,
    "enableSponsorBlock": true,
    "sponsorBlockManualSkips": ["intro", "outro", "filler"],
    "enableSponsorBlockSponsor": true,
    "enableSponsorBlockIntro": true,
    "enableSponsorBlockOutro": true,
    "enableSponsorBlockInteraction": true,
    "enableSponsorBlockSelfPromo": true,
    "enableSponsorBlockPreview": true,
    "enableSponsorBlockMusicOfftopic": true,
    "enableSponsorBlockFiller": false,
    "enableDeArrow": true,
    "enableDeArrowThumbnails": false,
    "preferredVideoQuality": "auto",
    "videoPreferredCodec": "vp9",
    "enableChapters": true,
    "enableLongPress": true,
    "enableShorts": true,
    "enablePreviews": true,
    "enableHideWatchedVideos": false,
    "hideWatchedVideosThreshold": 80,
    "enableHideEndScreenCards": false,
    "enableYouThereRenderer": true,
    "enablePaidPromotionOverlay": true
  }
}
```

## 🛠️ Development

### Debugging
```bash
npm run dev
```
This starts the app with remote debugging enabled on port 8315. You can connect Chrome DevTools to debug the renderer process.

### Architecture Overview
```
electron-app/
├── main.js                # Main Electron process (window management, config)
├── preload.js             # Preload script for secure IPC communication
├── pompytube/             # PompyTube feature implementations
│   ├── config.js          # Configuration system
│   ├── features/          # Core feature modules
│   │   ├── adblock.js     # Ad blocking implementation
│   │   └── sponsorblock.js # SponsorBlock integration
│   ├── ui/                # User interface components
│   ├── utils/             # Utility functions
│   └── userScriptSimple.js # Main PompyTube script
├── assets/                # Icons and assets
└── package.json           # Electron configuration and build scripts
```
### Core Technologies
- **[Electron](https://www.electronjs.org/)**: The framework that makes this cross-platform app possible
- **[PompyTube](https://github.com/reis-c/tizentube)**: The original smart TV YouTube enhancement project
- **[SponsorBlock](https://sponsor.ajay.app/)**: The community-driven sponsor skipping database
- **[electron-store](https://github.com/sindresorhus/electron-store)**: Simple data persistence
- **[electron-builder](https://www.electron.build/)**: Professional packaging and distribution


## License

This project is licensed under **GPL-3.0-only**.

## Acknowledgments

- **Reis Can** for the original PompyTube project
- **Ajay Ramachandran** for SponsorBlock
- **The Electron team** for making cross-platform apps accessible
- **All open-source contributors** whose work makes projects like this possible
- **The AI models** that analyzed, understood, and generated this complete solution
