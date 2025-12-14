// Basic UI components for TizenTube
import { configRead } from '../config.js';
import { showToast, showModal, overlayPanelItemListRenderer, overlayMessageRenderer } from './ytUI.js';

// Settings UI
export function openTizenTubeSettingsModal() {
  const settings = [
    {
      name: 'Ad Blocking',
      icon: 'DOLLAR_SIGN',
      value: 'enableAdBlock'
    },
    {
      name: 'SponsorBlock',
      icon: 'MONEY_HAND',
      value: null,
      options: [
        {
          name: 'Enable SponsorBlock',
          value: 'enableSponsorBlock'
        },
        {
          name: 'Skip Sponsor Segments',
          value: 'enableSponsorBlockSponsor'
        },
        {
          name: 'Skip Intro Segments',
          value: 'enableSponsorBlockIntro'
        },
        {
          name: 'Skip Outro Segments',
          value: 'enableSponsorBlockOutro'
        }
      ]
    },
    {
      name: 'DeArrow',
      icon: 'VISIBILITY_OFF',
      value: 'enableDeArrow'
    },
    {
      name: 'Video Quality',
      icon: 'VIDEO_QUALITY',
      value: null,
      options: {
        title: 'Preferred Video Quality',
        subtitle: 'Choose the preferred video quality',
        content: overlayPanelItemListRenderer(
          ['Auto', '2160p', '1440p', '1080p', '720p'].map((quality) =>
            createQualityButton(quality)
          ),
          getQualityIndex()
        )
      }
    }
  ];

  const buttons = settings.map((setting, index) => {
    const currentVal = configRead(setting.value);
    return createSettingButton(setting, index, currentVal);
  });

  showModal(
    'TizenTube Settings',
    overlayPanelItemListRenderer(buttons, 0),
    'tt-settings'
  );
}

function createSettingButton(setting, index, currentVal) {
  const button = document.createElement('div');
  button.style.padding = '12px';
  button.style.backgroundColor = 'transparent';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'space-between';
  button.style.borderBottom = '1px solid #444';

  const textContainer = document.createElement('div');
  textContainer.style.flex = '1';

  const titleElement = document.createElement('div');
  titleElement.textContent = setting.name;
  titleElement.style.fontWeight = '500';

  if (setting.subtitle) {
    const subtitleElement = document.createElement('div');
    subtitleElement.textContent = setting.subtitle;
    subtitleElement.style.fontSize = '12px';
    subtitleElement.style.color = '#aaa';
    textContainer.appendChild(titleElement);
    textContainer.appendChild(subtitleElement);
  } else {
    textContainer.appendChild(titleElement);
  }

  const statusElement = document.createElement('div');
  if (setting.value) {
    statusElement.textContent = currentVal ? 'ON' : 'OFF';
    statusElement.style.color = currentVal ? '#4CAF50' : '#F44336';
  } else {
    statusElement.textContent = '>';
    statusElement.style.color = '#999';
  }

  button.appendChild(textContainer);
  button.appendChild(statusElement);

  button.onclick = () => {
    if (setting.value) {
      // Toggle boolean setting
      const newValue = !configRead(setting.value);
      window.tizenTubeConfigWrite(setting.value, newValue);
      statusElement.textContent = newValue ? 'ON' : 'OFF';
      statusElement.style.color = newValue ? '#4CAF50' : '#F44336';
      showToast('TizenTube', `${setting.name} ${newValue ? 'enabled' : 'disabled'}`);
    } else if (setting.options) {
      // Show submenu
      if (typeof setting.options === 'function') {
        setting.options();
      } else {
        showOptionsSubmenu(setting);
      }
    }
  };

  return {
    tileRenderer: {
      metadata: {
        tileMetadataRenderer: {
          title: {
            simpleText: setting.name,
            ...(setting.subtitle ? { subtitle: { simpleText: setting.subtitle } } : {})
          }
        }
      },
      onSelectCommand: {
        commands: [{
          customAction: {
            action: 'SETTINGS_UPDATE',
            parameters: [index]
          }
        }]
      },
      style: 'TILE_STYLE_YTLR_DEFAULT'
    },
    element: button
  };
}

function showOptionsSubmenu(setting) {
  const buttons = setting.options.map((option, index) => {
    if (option.value) {
      const currentVal = configRead(option.value);
      return createBooleanOptionButton(option, index, currentVal);
    } else if (option.options) {
      return createSubmenuOptionButton(option, index);
    }
  });

  showModal(
    setting.name,
    overlayPanelItemListRenderer(buttons.map(b => b.element), 0),
    `tt-settings-${setting.value || 'submenu'}`
  );
}

function createBooleanOptionButton(option, index, currentVal) {
  const button = document.createElement('div');
  button.style.padding = '12px';
  button.style.backgroundColor = 'transparent';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'space-between';

  const textContainer = document.createElement('div');
  textContainer.style.flex = '1';

  const titleElement = document.createElement('div');
  titleElement.textContent = option.name;
  titleElement.style.fontWeight = '500';

  textContainer.appendChild(titleElement);

  const statusElement = document.createElement('div');
  statusElement.textContent = currentVal ? 'ON' : 'OFF';
  statusElement.style.color = currentVal ? '#4CAF50' : '#F44336';

  button.appendChild(textContainer);
  button.appendChild(statusElement);

  button.onclick = () => {
    const newValue = !currentVal;
    window.tizenTubeConfigWrite(option.value, newValue);
    statusElement.textContent = newValue ? 'ON' : 'OFF';
    statusElement.style.color = newValue ? '#4CAF50' : '#F44336';
    showToast('TizenTube', `${option.name} ${newValue ? 'enabled' : 'disabled'}`);
  };

  return {
    tileRenderer: {
      metadata: {
        tileMetadataRenderer: {
          title: {
            simpleText: option.name
          }
        }
      },
      onSelectCommand: {
        commands: [{
          customAction: {
            action: 'SETTINGS_UPDATE',
            parameters: [index]
          }
        }]
      },
      style: 'TILE_STYLE_YTLR_DEFAULT'
    },
    element: button
  };
}

function createSubmenuOptionButton(option, index) {
  const button = document.createElement('div');
  button.style.padding = '12px';
  button.style.backgroundColor = 'transparent';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'space-between';

  const textContainer = document.createElement('div');
  textContainer.style.flex = '1';

  const titleElement = document.createElement('div');
  titleElement.textContent = option.name;
  titleElement.style.fontWeight = '500';

  textContainer.appendChild(titleElement);

  const arrowElement = document.createElement('div');
  arrowElement.textContent = '>';
  arrowElement.style.color = '#999';

  button.appendChild(textContainer);
  button.appendChild(arrowElement);

  button.onclick = () => {
    if (typeof option.options === 'function') {
      option.options();
    } else {
      showOptionsSubmenu(option);
    }
  };

  return {
    tileRenderer: {
      metadata: {
        tileMetadataRenderer: {
          title: {
            simpleText: option.name
          }
        }
      },
      onSelectCommand: {
        commands: [{
          customAction: {
            action: 'OPTIONS_SHOW',
            parameters: {
              options: option.options,
              selectedIndex: 0
            }
          }
        }]
      },
      style: 'TILE_STYLE_YTLR_DEFAULT'
    },
    element: button
  };
}

function createQualityButton(quality) {
  const button = document.createElement('div');
  button.style.padding = '12px';
  button.style.backgroundColor = 'transparent';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';

  const titleElement = document.createElement('div');
  titleElement.textContent = quality;
  titleElement.style.fontWeight = '500';

  button.appendChild(titleElement);

  button.onclick = () => {
    const qualityValue = quality === 'Auto' ? 'auto' : quality.toLowerCase();
    window.tizenTubeConfigWrite('preferredVideoQuality', qualityValue);
    showToast('TizenTube', `Preferred quality set to ${quality}`);
    closeModal('tt-settings-videoQuality');
  };

  return {
    tileRenderer: {
      metadata: {
        tileMetadataRenderer: {
          title: {
            simpleText: quality
          }
        }
      },
      onSelectCommand: {
        commands: [{
          customAction: {
            action: 'SHOW_TOAST',
            parameters: `Preferred quality set to ${quality}`
          }
        }]
      },
      style: 'TILE_STYLE_YTLR_DEFAULT'
    },
    element: button
  };
}

function getQualityIndex() {
  const currentQuality = configRead('preferredVideoQuality');
  const qualities = ['auto', '2160p', '1440p', '1080p', '720p'];
  return Math.max(0, qualities.indexOf(currentQuality));
}

// Expose settings function
window.openTizenTubeSettingsModal = openTizenTubeSettingsModal;
