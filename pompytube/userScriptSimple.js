// Simplified PompyTube script without ES modules for better Electron compatibility

// Configuration system
window.pompyTubeConfig = window.pompyTubeConfig || {
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
  showWelcomeToast: true
};

function configRead(key) {
  return window.pompyTubeConfig[key] !== undefined ? window.pompyTubeConfig[key] : null;
}

function configWrite(key, value) {
  window.pompyTubeConfig[key] = value;
  if (window.localStorage) {
    try {
      localStorage.setItem('pompyTubeConfig', JSON.stringify(window.pompyTubeConfig));
    } catch (e) {
      // console.warn('Failed to save config:', e);
    }
  }
}

// Toast notification system
function showToast(title, message, duration = 3000) {
  let toastContainer = document.getElementById('pompytube-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'pompytube-toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    toastContainer.style.maxWidth = '300px';
    toastContainer.style.fontFamily = 'Roboto, Arial, sans-serif';
    toastContainer.style.fontSize = '14px';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.style.backgroundColor = 'rgba(30, 30, 30, 0.9)';
  toast.style.color = 'white';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
  toast.style.marginBottom = '10px';

  const titleElement = document.createElement('div');
  titleElement.style.fontWeight = 'bold';
  titleElement.style.marginBottom = '4px';
  titleElement.textContent = title;

  const messageElement = document.createElement('div');
  messageElement.textContent = message;

  toast.appendChild(titleElement);
  toast.appendChild(messageElement);
  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toastContainer && toastContainer.contains(toast)) {
      toastContainer.removeChild(toast);
    }
  }, duration);
}

// Ad Blocking implementation
(function() {
  const adBlockEnabled = configRead('enableAdBlock');
  if (!adBlockEnabled) return;

  const origParse = JSON.parse;
  JSON.parse = function() {
    try {
      const r = origParse.apply(this, arguments);

      if (r.adPlacements) {
        r.adPlacements = [];
      }

      if (r.playerAds) {
        r.playerAds = false;
      }

      if (r.adSlots) {
        r.adSlots = [];
      }

      if (r.paidContentOverlay && !configRead('enablePaidPromotionOverlay')) {
        r.paidContentOverlay = null;
      }

      if (r?.streamingData?.adaptiveFormats && configRead('videoPreferredCodec') !== 'any') {
        const preferredCodec = configRead('videoPreferredCodec');
        const hasPreferredCodec = r.streamingData.adaptiveFormats.find(format => format.mimeType.includes(preferredCodec));
        if (hasPreferredCodec) {
          r.streamingData.adaptiveFormats = r.streamingData.adaptiveFormats.filter(format => {
            if (format.mimeType.startsWith('audio/')) return true;
            return format.mimeType.includes(preferredCodec);
          });
        }
      }

      if (r?.contents?.tvBrowseRenderer?.content?.tvSurfaceContentRenderer?.content?.sectionListRenderer?.contents) {
        r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content.sectionListRenderer.contents =
          r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content.sectionListRenderer.contents.filter(
            (elm) => !elm.adSlotRenderer
          );

        for (const shelve of r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content.sectionListRenderer.contents) {
          if (shelve.shelfRenderer) {
            shelve.shelfRenderer.content.horizontalListRenderer.items =
              shelve.shelfRenderer.content.horizontalListRenderer.items.filter(
                (item) => !item.adSlotRenderer
              );
          }
        }
      }

      if (r.endscreen && configRead('enableHideEndScreenCards')) {
        r.endscreen = null;
      }

      if (r.messages && Array.isArray(r.messages) && !configRead('enableYouThereRenderer')) {
        r.messages = r.messages.filter(
          (msg) => !msg?.youThereRenderer
        );
      }

      if (!Array.isArray(r) && r?.entries) {
        r.entries = r.entries?.filter(
          (elm) => !elm?.command?.reelWatchEndpoint?.adClientParams?.isAd
        );
      }

      return r;
    } catch (e) {
      // console.error('Ad blocking error:', e);
      return origParse.apply(this, arguments);
    }
  };

  window.JSON.parse = JSON.parse;
  for (const key in window._yttv) {
    if (window._yttv[key] && window._yttv[key].JSON && window._yttv[key].JSON.parse) {
      window._yttv[key].JSON.parse = JSON.parse;
    }
  }

  // console.log('Ad Blocking enabled');
  showToast('PompyTube', 'Ad blocking is active');
})();

// SponsorBlock implementation with comprehensive error handling
(function() {
  try {
          const sponsorBlockEnabled = configRead('enableSponsorBlock');
          if (!sponsorBlockEnabled) {
            return;
          }

    // SHA-256 implementation from PompyTube (proper implementation)
    var sha256 = function sha256(ascii) {
      function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
      };

      var mathPow = Math.pow;
      var maxWord = mathPow(2, 32);
      var lengthProperty = 'length';
      var i, j; // Used as a counter across the whole file
      var result = '';

      var words = [];
      var asciiBitLength = ascii[lengthProperty] * 8;

      //* caching results is optional - remove/add slash from front of this line to toggle
      // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
      // (we actually calculate the first 64, but extra values are just ignored)
      var hash = sha256.h = sha256.h || [];
      // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
      var k = sha256.k = sha256.k || [];
      var primeCounter = k[lengthProperty];
      /*/
      var hash = [], k = [];
      var primeCounter = 0;
      //*/

      var isComposite = {};
      for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
          for (i = 0; i < 313; i += candidate) {
            isComposite[i] = candidate;
          }
          hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
          k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
      }

      ascii += '\x80'; // Append '1' bit (plus zero padding)
      while (ascii[lengthProperty] % 64 - 56) ascii += '\x00'; // More zero padding
      for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return; // ASCII check: only accept characters in range 0-255
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
      }
      words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
      words[words[lengthProperty]] = (asciiBitLength)

      // process each chunk
      for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
        var oldHash = hash;
        // This is now the "working hash", often labelled as variables a...g
        // (we have to truncate as well, otherwise extra entries at the end accumulate
        hash = hash.slice(0, 8);

        for (i = 0; i < 64; i++) {
          var i2 = i + j;
          // Expand the message into 64 words
          // Used below if 
          var w15 = w[i - 15], w2 = w[i - 2];

          // Iterate
          var a = hash[0], e = hash[4];
          var temp1 = hash[7]
            + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
            + ((e & hash[5]) ^ ((~e) & hash[6])) // ch
            + k[i]
            // Expand the message schedule if needed
            + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) // s0
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) // s1
            ) | 0
            );
          // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
          var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
            + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

          hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
          hash[4] = (hash[4] + temp1) | 0;
        }

        for (i = 0; i < 8; i++) {
          hash[i] = (hash[i] + oldHash[i]) | 0;
        }
      }

      for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
          var b = (hash[i] >> (j * 8)) & 255;
          result += ((b < 16) ? 0 : '') + b.toString(16);
        }
      }
      return result;
    };

    // Bar types configuration
    const barTypes = {
      sponsor: {
        color: '#00d400',
        opacity: '0.7',
        name: 'sponsored segment'
      },
      intro: {
        color: '#00ffff',
        opacity: '0.7',
        name: 'intro'
      },
      outro: {
        color: '#0202ed',
        opacity: '0.7',
        name: 'outro'
      },
      interaction: {
        color: '#cc00ff',
        opacity: '0.7',
        name: 'interaction reminder'
      },
      selfpromo: {
        color: '#ffff00',
        opacity: '0.7',
        name: 'self-promotion'
      },
      preview: {
        color: '#008fd6',
        opacity: '0.7',
        name: 'recap or preview'
      },
      filler: {
        color: "#7300FF",
        opacity: "0.9",
        name: 'tangents'
      },
      music_offtopic: {
        color: '#ff9900',
        opacity: '0.7',
        name: 'non-music part'
      }
    };

    const sponsorblockAPI = 'https://sponsor.ajay.app/api';

    class SponsorBlockHandler {
      video = null;
      active = true;

      attachVideoTimeout = null;
      nextSkipTimeout = null;
      sliderInterval = null;

      observer = null;
      scheduleSkipHandler = null;
      durationChangeHandler = null;
      segments = null;
      skippableCategories = [];
      manualSkippableCategories = [];
      skippedCategories = new Map();

      constructor(videoID) {
        this.videoID = videoID;
        // console.log(`SponsorBlock: Created handler for video ${videoID}`);
      }

      async init() {
        try {
      // console.log(`SponsorBlock: Initializing for video ${this.videoID}`);
      const videoHash = sha256(this.videoID).substring(0, 4);
      // console.log(`SponsorBlock: Generated hash ${videoHash} for video ${this.videoID}`);

      const categories = [
        'sponsor',
        'intro',
        'outro',
        'interaction',
        'selfpromo',
        'preview',
        'filler',
        'music_offtopic'
      ];

      // console.log(`SponsorBlock: Fetching segments from API for hash ${videoHash}`);
          const resp = await fetch(
            `${sponsorblockAPI}/skipSegments/${videoHash}?categories=${encodeURIComponent(
              JSON.stringify(categories)
            )}`
          );

          if (!resp.ok) {
            throw new Error(`SponsorBlock: API request failed with status ${resp.status}`);
          }

          const results = await resp.json();
          // console.log(`SponsorBlock: Received API response:`, results);

          const result = results.find((v) => v.videoID === this.videoID);
          // console.info(this.videoID, 'API Result:', result);

          if (!result || !result.segments || !result.segments.length) {
            // console.info(this.videoID, 'No segments found.');
            return;
          }

          // console.log(`SponsorBlock: Found ${result.segments.length} segments for video ${this.videoID}`);
          this.segments = result.segments;
          this.manualSkippableCategories = configRead('sponsorBlockManualSkips');
          this.skippableCategories = this.getSkippableCategories();

          // console.log(`SponsorBlock: Skippable categories:`, this.skippableCategories);
          // console.log(`SponsorBlock: Manual skip categories:`, this.manualSkippableCategories);

      this.scheduleSkipHandler = () => {
        try {
          // console.log('SponsorBlock: scheduleSkipHandler called');
          const slider = document.querySelector('div[idomkey="slider"]');
          // console.log('SponsorBlock: Slider element found:', slider);
          if (slider) {
            const sliderRect = slider.getBoundingClientRect();
            // console.log('SponsorBlock: Slider rect:', sliderRect);
          }
          const isOldUI = !document.querySelector('div[idomkey="Metadata-Section"]');
          // console.log('SponsorBlock: Using old UI:', isOldUI);

          if (this.segmentsoverlay) {
            // console.log('SponsorBlock: Segment overlay exists:', this.segmentsoverlay);
            // console.log('SponsorBlock: Overlay children:', this.segmentsoverlay.children.length);
            // console.log('SponsorBlock: Overlay style:', this.segmentsoverlay.style.cssText);
            // console.log('SponsorBlock: Overlay computed style:', window.getComputedStyle(this.segmentsoverlay));

            // Check if overlay is actually in DOM
            const overlayInDOM = document.body.contains(this.segmentsoverlay);
            // console.log('SponsorBlock: Overlay in DOM:', overlayInDOM);
          } else {
            // console.log('SponsorBlock: Segment overlay is null');
          }

          if (slider && isOldUI) {
            this.segmentsoverlay.style.setProperty('top', `${sliderRect.top}px`, 'important');
          }
          this.scheduleSkip();
        } catch (error) {
          // console.error('SponsorBlock: Error in scheduleSkipHandler:', error);
        }
      };

          this.durationChangeHandler = () => {
            try {
              this.buildOverlay();
            } catch (error) {
              // console.error('SponsorBlock: Error in durationChangeHandler:', error);
            }
          };

          this.attachVideo();
          this.buildOverlay();
        } catch (error) {
          // console.error('SponsorBlock: Error during initialization:', error);
          showToast('SponsorBlock Error', `Initialization failed: ${error.message}`);
        }
      }

      getSkippableCategories() {
        const skippableCategories = [];
        if (configRead('enableSponsorBlockSponsor')) {
          skippableCategories.push('sponsor');
        }
        if (configRead('enableSponsorBlockIntro')) {
          skippableCategories.push('intro');
        }
        if (configRead('enableSponsorBlockOutro')) {
          skippableCategories.push('outro');
        }
        if (configRead('enableSponsorBlockInteraction')) {
          skippableCategories.push('interaction');
        }
        if (configRead('enableSponsorBlockSelfPromo')) {
          skippableCategories.push('selfpromo');
        }
        if (configRead('enableSponsorBlockPreview')) {
          skippableCategories.push('preview');
        }
        if (configRead('enableSponsorBlockFiller')) {
          skippableCategories.push('filler');
        }
        if (configRead('enableSponsorBlockMusicOfftopic')) {
          skippableCategories.push('music_offtopic');
        }
        return skippableCategories;
      }

      attachVideo() {
        try {
          clearTimeout(this.attachVideoTimeout);
          this.attachVideoTimeout = null;

          this.video = document.querySelector('video');
          if (!this.video) {
            // console.info(this.videoID, 'No video yet...');
            this.attachVideoTimeout = setTimeout(() => this.attachVideo(), 100);
            return;
          }

          // console.info(this.videoID, 'Video found, binding...');
          // console.info(this.videoID, 'Video found, binding...');

          this.video.addEventListener('play', this.scheduleSkipHandler);
          this.video.addEventListener('pause', this.scheduleSkipHandler);
          this.video.addEventListener('timeupdate', this.scheduleSkipHandler);
          this.video.addEventListener('durationchange', this.durationChangeHandler);
        } catch (error) {
          // console.error('SponsorBlock: Error in attachVideo:', error);
        }
      }

      buildOverlay() {
        try {
          if (this.segmentsoverlay) {
            // console.info('Overlay already built');
            return;
          }

          if (!this.video || !this.video.duration) {
            // console.info('No video duration yet');
            return;
          }

          // console.log(`SponsorBlock: Building overlay for ${this.segments.length} segments`);
          const videoDuration = this.video.duration;
          const slider = document.querySelector('div[idomkey="slider"]');

          this.segmentsoverlay = document.createElement('div');

          this.segmentsoverlay.classList.add('ytLrProgressBarSlider', 'ytLrProgressBarSliderRectangularProgressBar');
          this.segmentsoverlay.style.setProperty('z-index', '10', 'important');
          this.segmentsoverlay.style.setProperty('background-color', 'rgba(0, 0, 0, 0)', 'important');
          this.segmentsoverlay.style.setProperty('width', '72rem', 'important');
          this.segmentsoverlay.style.setProperty('left', '4rem', 'important');
          const sliderRect = slider.getBoundingClientRect();
          // console.log('SponsorBlock: Slider rect dimensions:', sliderRect.width, 'x', sliderRect.height);

          // Use a reasonable default height if slider is too small or missing
          const overlayHeight = sliderRect.height > 10 ? sliderRect.height : 20;
          // console.log('SponsorBlock: Using overlay height:', overlayHeight);

          if (!slider.classList.contains('ytLrProgressBarSlider')) {
            for (let i = 0; i < slider.classList.length; i++) {
              this.segmentsoverlay.classList.add(slider.classList[i]);
            }
          }

          // Set proper positioning and visibility
          this.segmentsoverlay.style.setProperty('height', `${overlayHeight}px`, 'important');
          this.segmentsoverlay.style.setProperty('position', 'absolute', 'important');
          this.segmentsoverlay.style.setProperty('bottom', `${sliderRect.bottom - sliderRect.top}px`, 'important');
          this.segmentsoverlay.style.setProperty('pointer-events', 'none', 'important');

          // Fix for Windows rendering issue: ensure overlay doesn't affect video content
          // Use isolation to prevent color blending with video content
          this.segmentsoverlay.style.setProperty('isolation', 'isolate', 'important');
          this.segmentsoverlay.style.setProperty('mix-blend-mode', 'normal', 'important');
          this.segmentsoverlay.style.setProperty('backdrop-filter', 'none', 'important');

          // Add debug styling temporarily to make overlay visible
          this.segmentsoverlay.style.setProperty('outline', '2px solid lightgrey', 'important');

          this.segments.forEach((segment, index) => {
            const [start, end] = segment.segment;
            const barType = barTypes[segment.category] || {
              color: 'blue',
              opacity: 0.7
            };

            const leftPercent = videoDuration ? (100.0 * start) / videoDuration : 0;
            const widthPercent = videoDuration ? (100.0 * (end - start)) / videoDuration : 0;

            // console.log(`SponsorBlock: Creating overlay for segment ${index}: ${segment.category} at ${leftPercent}% for ${widthPercent}%`);

            const elm = document.createElement('div');
            elm.style.setProperty('background-color', barType.color, 'important');
            elm.style.setProperty('opacity', barType.opacity, 'important');
            elm.style.setProperty('height', '100%', 'important');
            elm.style.setProperty('width', `${widthPercent}%`, 'important');
            elm.style.setProperty('left', `${leftPercent}%`, 'important');
            elm.style.setProperty('position', 'absolute', 'important');
            this.segmentsoverlay.appendChild(elm);
          });

          this.observer = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
              if (m.removedNodes) {
                for (const node of m.removedNodes) {
        if (node === this.segmentsoverlay) {
          // console.info('bringing back segments overlay');
          this.slider.appendChild(this.segmentsoverlay);
        }
          }
        }

        // Always keep overlay visible - the hybridnavfocusable check was hiding it during scrubbing
        this.segmentsoverlay.style.setProperty('display', 'block', 'important');

        // Adjust overlay height if progress bar height changed (e.g., when progress bar is selected/highlighted)
        const progressBarElement = document.querySelector('ytlr-redux-connect-ytlr-progress-bar ytlr-progress-bar ytlr-multi-markers-player-bar-renderer');
        if (progressBarElement) {
          const progressBarRect = progressBarElement.getBoundingClientRect();
          const currentOverlayHeight = parseFloat(this.segmentsoverlay.style.height);
          const newOverlayHeight = progressBarRect.height;
          if (Math.abs(currentOverlayHeight - newOverlayHeight) > 0.5) { // Allow small tolerance for floating point
            this.segmentsoverlay.style.setProperty('height', `${newOverlayHeight}px`, 'important');
          }
        }
      });
    });

          this.sliderInterval = setInterval(() => {
            this.slider = document.querySelector('ytlr-redux-connect-ytlr-progress-bar');
            if (this.slider) {
              clearInterval(this.sliderInterval);
              this.sliderInterval = null;
              this.observer.observe(this.slider, {
                childList: true,
                subtree: true
              });
              this.slider.appendChild(this.segmentsoverlay);
              // console.log('SponsorBlock: Overlay successfully added to DOM');
            }
          }, 500);
        } catch (error) {
          // console.error('SponsorBlock: Error in buildOverlay:', error);
        }
      }

      scheduleSkip() {
        try {
          clearTimeout(this.nextSkipTimeout);
          this.nextSkipTimeout = null;

          if (!this.active) {
            // console.info(this.videoID, 'No longer active, ignoring...');
            return;
          }

          if (this.video.paused) {
            // console.info(this.videoID, 'Currently paused, ignoring...');
            return;
          }

          // Sometimes timeupdate event (that calls scheduleSkip) gets fired right before
          // already scheduled skip routine below. Let's just look back a little bit
          // and, in worst case, perform a skip at negative interval (immediately)...
          const nextSegments = this.segments.filter(
            (seg) =>
              seg.segment[0] > this.video.currentTime - 0.3 &&
              seg.segment[1] > this.video.currentTime - 0.3
          );
          nextSegments.sort((s1, s2) => s1.segment[0] - s2.segment[0]);

          if (!nextSegments.length) {
            // console.info(this.videoID, 'No more segments');
            return;
          }

          const [segment] = nextSegments;
          const [start, end] = segment.segment;
          // console.info(
          //   this.videoID,
          //   'Scheduling skip of',
          //   segment,
          //   'in',
          //   start - this.video.currentTime,
          //   'seconds'
          // );

          this.nextSkipTimeout = setTimeout(() => {
            try {
              if (this.video.paused) {
                // console.info(this.videoID, 'Currently paused, ignoring...');
                return;
              }
              if (!this.skippableCategories.includes(segment.category)) {
                // console.info(
                //   this.videoID,
                //   'Segment',
                //   segment.category,
                //   'is not skippable, ignoring...'
                // );
                return;
              }

              const skipName = barTypes[segment.category]?.name || segment.category;
              // console.info(this.videoID, 'Skipping', segment);
              if (!this.manualSkippableCategories.includes(segment.category)) {
                const wasSkippedBefore = this.skippedCategories.get(segment.UUID)
                if (wasSkippedBefore) {
                  wasSkippedBefore.count++;
                  wasSkippedBefore.lastSkipped = Date.now();
                  this.skippedCategories.set(segment.UUID, wasSkippedBefore);

                  if (wasSkippedBefore.lastSkipped - wasSkippedBefore.firstSkipped < 1000) {
                    if (!wasSkippedBefore.hasShownToast) {
                      showToast('SponsorBlock', `Not skipping ${skipName} (was skipped ${wasSkippedBefore.count} times)`);
                      wasSkippedBefore.hasShownToast = true;
                      this.skippedCategories.set(segment.UUID, wasSkippedBefore);
                    }
                    return;
                  }
                } else {
                  this.skippedCategories.set(segment.UUID, {
                    count: 1,
                    firstSkipped: Date.now(),
                    lastSkipped: Date.now(),
                    hasShownToast: false
                  });
                }

                // console.log(`SponsorBlock: Skipping ${skipName} segment`);
                // console.log(`SponsorBlock: Current time before skip: ${this.video.currentTime}`);
                // console.log(`SponsorBlock: Skipping to: ${end}`);
                // console.log(`SponsorBlock: Video duration: ${this.video.duration}`);
                // console.log(`SponsorBlock: Video paused: ${this.video.paused}`);

                showToast('SponsorBlock', `Skipping ${skipName}`);

                // Debug video element properties
                // console.log('SponsorBlock: Video element:', this.video);
                // console.log('SponsorBlock: Video readyState:', this.video.readyState);
                // console.log('SponsorBlock: Video networkState:', this.video.networkState);
                // console.log('SponsorBlock: Video error:', this.video.error);

                const oldTime = this.video.currentTime;
                if (this.video.duration - end < 1) {
                  this.video.currentTime = end - 1;
                } else {
                  this.video.currentTime = end;
                }

                // Check if the skip actually happened
                setTimeout(() => {
                  // console.log(`SponsorBlock: Current time after skip: ${this.video.currentTime}`);
                  // console.log(`SponsorBlock: Skip successful: ${Math.abs(this.video.currentTime - oldTime) > 0.1}`);
                }, 100);

                this.scheduleSkip();
              }
            } catch (error) {
              // console.error('SponsorBlock: Error during segment skip:', error);
            }
          }, (start - this.video.currentTime) * 1000);
        } catch (error) {
          // console.error('SponsorBlock: Error in scheduleSkip:', error);
        }
      }

      destroy() {
        try {
          // console.info(this.videoID, 'Destroying');

          this.active = false;

          if (this.nextSkipTimeout) {
            clearTimeout(this.nextSkipTimeout);
            this.nextSkipTimeout = null;
          }

          if (this.attachVideoTimeout) {
            clearTimeout(this.attachVideoTimeout);
            this.attachVideoTimeout = null;
          }

          if (this.sliderInterval) {
            clearInterval(this.sliderInterval);
            this.sliderInterval = null;
          }

          if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
          }

          if (this.segmentsoverlay) {
            this.segmentsoverlay.remove();
            this.segmentsoverlay = null;
          }

          if (this.video) {
            this.video.removeEventListener('play', this.scheduleSkipHandler);
            this.video.removeEventListener('pause', this.scheduleSkipHandler);
            this.video.removeEventListener('timeupdate', this.scheduleSkipHandler);
            this.video.removeEventListener(
              'durationchange',
              this.durationChangeHandler
            );
          }

          this.skippedCategories.clear();
        } catch (error) {
          // console.error('SponsorBlock: Error in destroy:', error);
        }
      }
    }

    // When this global variable was declared using let and two consecutive hashchange
    // events were fired (due to bubbling? not sure...) the second call handled below
    // would not see the value change from first call, and that would cause multiple
    // SponsorBlockHandler initializations... This has been noticed on Chromium 38.
    // This either reveals some bug in chromium/webpack/babel scope handling, or
    // shows my lack of understanding of javascript. (or both)
    window.sponsorblock = null;

    window.addEventListener(
      'hashchange',
      () => {
        try {
          const newURL = new URL(location.hash.substring(1), location.href);
          // A hack, but it works, so...
          const videoID = newURL.search.replace('?v=', '').split('&')[0];
          const needsReload =
            videoID &&
            (!window.sponsorblock || window.sponsorblock.videoID != videoID);

          // console.info(
          //   'hashchange',
          //   videoID,
          //   window.sponsorblock,
          //   window.sponsorblock ? window.sponsorblock.videoID : null,
          //   needsReload
          // );

          if (needsReload) {
            if (window.sponsorblock) {
              try {
                window.sponsorblock.destroy();
              } catch (err) {
                // console.warn('window.sponsorblock.destroy() failed!', err);
              }
              window.sponsorblock = null;
            }

            if (configRead('enableSponsorBlock')) {
              window.sponsorblock = new SponsorBlockHandler(videoID);
              window.sponsorblock.init();
            } else {
              // console.info('SponsorBlock disabled, not loading');
            }
          }
        } catch (error) {
          // console.error('SponsorBlock: Error in hashchange handler:', error);
        }
      },
      false
    );

    // Log SponsorBlock status
    // console.log(`SponsorBlock ${configRead('enableSponsorBlock') ? 'enabled' : 'disabled'}`);

    if (configRead('enableSponsorBlock')) {
      showToast('PompyTube', 'SponsorBlock is active');
    }
  } catch (error) {
    // console.error('SponsorBlock: Critical error in main block:', error);
    showToast('SponsorBlock Error', `Failed to load: ${error.message}`);
  }
})();


// console.log('PompyTube Electron Edition initialized');

// Show welcome message
if (configRead('showWelcomeToast')) {
  setTimeout(() => {
    showToast('PompyTube', 'Enhanced YouTube TV experience loaded');
  }, 2000);
}

// Expose global functions
window.showPompyTubeSettings = function() {
  showToast('PompyTube', 'Settings will be implemented in next version');
};

// Handle errors globally with better logging
window.addEventListener('error', (event) => {
  // console.error('PompyTube Global Error:', event.error);
  // console.error('Error stack:', event.error?.stack);
  // console.error('Error message:', event.error?.message);
  // console.error('Error file:', event.filename);
  // console.error('Error line:', event.lineno);
  // console.error('Error column:', event.colno);
  showToast('PompyTube Error', `An error occurred: ${event.error?.message || 'Unknown error'}`);
});

window.addEventListener('unhandledrejection', (event) => {
  // console.error('PompyTube Unhandled Rejection:', event.reason);
  // console.error('Rejection stack:', event.reason?.stack);
  // console.error('Rejection message:', event.reason?.message);
  showToast('PompyTube Error', `Unhandled rejection: ${event.reason?.message || 'Unknown error'}`);
});
