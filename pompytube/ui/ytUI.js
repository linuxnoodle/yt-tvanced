// YouTube TV UI utilities for PompyTube
// This provides toast notifications and other UI helpers

// Toast notification system
let toastContainer = null;
let currentToast = null;

export function showToast(title, message, duration = 3000) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    toastContainer.style.maxWidth = '300px';
    toastContainer.style.fontFamily = 'Roboto, Arial, sans-serif';
    toastContainer.style.fontSize = '14px';
    document.body.appendChild(toastContainer);
  }

  // Remove existing toast if any
  if (currentToast) {
    toastContainer.removeChild(currentToast);
  }

  const toast = document.createElement('div');
  toast.className = 'pompytube-toast';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
  toast.style.marginBottom = '10px';
  toast.style.animation = 'fadeIn 0.3s ease-out';

  const titleElement = document.createElement('div');
  titleElement.style.fontWeight = 'bold';
  titleElement.style.marginBottom = '4px';
  titleElement.textContent = title;

  const messageElement = document.createElement('div');
  messageElement.textContent = message;

  toast.appendChild(titleElement);
  toast.appendChild(messageElement);
  toastContainer.appendChild(toast);

  currentToast = toast;

  // Auto-remove after duration
  setTimeout(() => {
    if (toast === currentToast) {
      toast.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        if (toastContainer && toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
          currentToast = null;
        }
      }, 300);
    }
  }, duration);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

// Modal dialog system
export function showModal(title, content, modalId = 'pompytube-modal', update = false) {
  let modal = document.getElementById(modalId);

  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.flexDirection = 'column';

    const modalContent = document.createElement('div');
    modalContent.className = 'pompytube-modal';
    modalContent.style.borderRadius = '8px';
    modalContent.style.padding = '20px';
    modalContent.style.maxWidth = '80%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    modalContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'pompytube-modal-header';
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.marginBottom = '15px';
    modalHeader.style.paddingBottom = '10px';

    const titleElement = document.createElement('h2');
    titleElement.style.margin = '0';
    titleElement.style.fontSize = '18px';
    titleElement.style.fontWeight = 'normal';

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.borderRadius = '50%';
    closeButton.style.backgroundColor = '#444';
    closeButton.onclick = () => closeModal(modalId);

    modalHeader.appendChild(titleElement);
    modalHeader.appendChild(closeButton);

    const modalBody = document.createElement('div');
    modalBody.style.fontSize = '14px';
    modalBody.style.lineHeight = '1.4';

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }

  const modalContent = modal.querySelector('div');
  const titleElement = modalContent.querySelector('h2');
  const modalBody = modalContent.querySelector('div:last-child');

  titleElement.textContent = title;
  modalBody.innerHTML = '';
  modalBody.appendChild(content);

  // Focus the modal
  modal.style.display = 'flex';
  modalContent.focus();

  // Handle escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal(modalId);
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  // Store cleanup function
  modal.cleanup = () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

export function closeModal(modalId = 'pompytube-modal') {
  const modal = document.getElementById(modalId);
  if (modal) {
    if (modal.cleanup) {
      modal.cleanup();
    }
    modal.style.display = 'none';
  }
}

// UI element creators for YouTube TV compatibility
export function buttonItem(titleObj, iconObj, commands) {
  return {
    tileRenderer: {
      metadata: {
        tileMetadataRenderer: {
          title: {
            simpleText: titleObj.title,
            ...(titleObj.subtitle ? { subtitle: { simpleText: titleObj.subtitle } } : {})
          }
        }
      },
      header: {
        tileHeaderRenderer: {
          thumbnail: {
            thumbnails: [{
              url: iconObj.icon || '',
              width: 48,
              height: 48
            }]
          }
        }
      },
      onSelectCommand: {
        commands: commands || []
      },
      style: 'TILE_STYLE_YTLR_DEFAULT'
    }
  };
}

export function overlayPanelItemListRenderer(items, selectedIndex = 0) {
  const panel = document.createElement('div');
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.gap = '8px';

  items.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.style.padding = '12px';
    itemElement.style.backgroundColor = index === selectedIndex ? '#3a3a3a' : 'transparent';
    itemElement.style.borderRadius = '4px';
    itemElement.style.cursor = 'pointer';
    itemElement.style.display = 'flex';
    itemElement.style.alignItems = 'center';
    itemElement.style.gap = '12px';

    if (item.tileRenderer) {
      const title = item.tileRenderer.metadata.tileMetadataRenderer.title.simpleText;
      const subtitle = item.tileRenderer.metadata.tileMetadataRenderer.title.subtitle?.simpleText;

      const textContainer = document.createElement('div');
      textContainer.style.flex = '1';

      const titleElement = document.createElement('div');
      titleElement.textContent = title;
      titleElement.style.fontWeight = '500';

      if (subtitle) {
        const subtitleElement = document.createElement('div');
        subtitleElement.textContent = subtitle;
        subtitleElement.style.fontSize = '12px';
        subtitleElement.style.color = '#aaa';
        textContainer.appendChild(titleElement);
        textContainer.appendChild(subtitleElement);
      } else {
        textContainer.appendChild(titleElement);
      }

      itemElement.appendChild(textContainer);

      // Handle click
      itemElement.onclick = () => {
        if (item.tileRenderer.onSelectCommand && item.tileRenderer.onSelectCommand.commands) {
          item.tileRenderer.onSelectCommand.commands.forEach(cmd => {
            if (cmd.customAction) {
              handleCustomAction(cmd.customAction);
            }
          });
        }
      };
    }

    panel.appendChild(itemElement);
  });

  return panel;
}

export function overlayMessageRenderer(message) {
  const element = document.createElement('div');
  element.textContent = message;
  element.style.padding = '12px 0';
  element.style.color = '#ccc';
  element.style.fontSize = '14px';
  return element;
}

function handleCustomAction(action) {
  switch (action.action) {
    case 'SHOW_TOAST':
      showToast('PompyTube', action.parameters);
      break;
    case 'SETTINGS_UPDATE':
      // Handle settings update
      break;
    case 'OPTIONS_SHOW':
      // Handle options show
      break;
    default:
      // console.log('Unhandled custom action:', action);
  }
}

// Export for compatibility with PompyTube
window.showToast = showToast;
window.showModal = showModal;
window.closeModal = closeModal;
window.buttonItem = buttonItem;
window.overlayPanelItemListRenderer = overlayPanelItemListRenderer;
window.overlayMessageRenderer = overlayMessageRenderer;
