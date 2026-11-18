import { createIcons } from 'lucide';
import { appIcons } from './icons';

export function refreshIcons() {
  const faIcons = document.querySelectorAll('i[class*="fa-"], span[class*="fa-"]');
  faIcons.forEach(el => {
    if (el.hasAttribute('data-lucide')) return;
    const classList = Array.from(el.classList);
    const faClass = classList.find(c =>
      c.startsWith('fa-') &&
      !['fa-solid', 'fa-regular', 'fa-light', 'fa-thin', 'fa-duotone', 'fa-brands',
        'fa-spin', 'fa-pulse', 'fa-bounce', 'fa-beat', 'fa-fade', 'fa-shake', 'fa-flip',
        'fa-2x', 'fa-3x', 'fa-4x', 'fa-lg', 'fa-sm', 'fa-xs', 'fa-fw',
        'fa-modal', 'fa-status-badge', 'fa-icon', 'fa-border', 'fa-pull-left', 'fa-pull-right'].includes(c)
    );
    if (faClass) {
      let lucideName = faClass.replace('fa-', '');
      const remap: Record<string, string> = {
        'headset': 'headset', 'gauge-high': 'gauge', 'gauge': 'gauge',
        'hourglass-empty': 'hourglass', 'hourglass-half': 'hourglass',
        'circle-xmark': 'x-circle', 'clock-rotate-left': 'history',
        'circle-arrow-down': 'arrow-down-circle', 'circle-arrow-up': 'arrow-up-circle',
        'up-right-from-square': 'external-link', 'arrow-up-right-from-square': 'external-link',
        'ticket-simple': 'ticket', 'cube': 'box', 'circle-nodes': 'network',
        'people-carry-box': 'users', 'whatsapp': 'message-circle', 'bullhorn': 'megaphone',
        'telegram': 'send', 'ranking-star': 'trophy', 'arrows-rotate': 'refresh-cw',
        'circle-exclamation': 'alert-circle', 'triangle-exclamation': 'alert-triangle',
        'border-all': 'layout-grid', 'box-open': 'box', 'folder-open': 'folder-open',
        'cloud-arrow-down': 'download', 'cloud-arrow-up': 'upload', 'money-bill-transfer': 'arrow-left-right',
        'money-bill-wave': 'banknote', 'money-bill': 'banknote', 'sack-dollar': 'circle-dollar-sign',
        'hand-holding-dollar': 'hand-coins', 'money-check-dollar': 'credit-card',
        'building-columns': 'landmark', 'magnifying-glass': 'search', 'xmark': 'x',
        'circle-check': 'check-circle', 'shield-halved': 'shield', 'shield-check': 'shield-check',
        'shield-virus': 'shield-alert', 'pen-to-square': 'edit', 'trash-can': 'trash-2',
        'cart-shopping': 'shopping-cart', 'bag-shopping': 'shopping-bag', 'gear': 'settings',
        'gears': 'settings', 'right-from-bracket': 'log-out', 'right-to-bracket': 'log-in',
        'bars': 'menu', 'paper-plane': 'send', 'comments': 'messages-square',
        'comment': 'message-square', 'file-lines': 'file-text', 'bolt-lightning': 'zap',
        'bolt': 'zap', 'user-shield': 'shield-check', 'user-gear': 'user-cog',
        'user-plus': 'user-plus', 'user-check': 'user-check', 'circle-question': 'help-circle',
        'circle-info': 'info', 'signal': 'activity', 'wifi': 'wifi', 'gamepad': 'gamepad-2',
        'rotate-right': 'rotate-cw', 'rotate-left': 'rotate-ccw', 'floppy-disk': 'save',
        'gem': 'gem', 'qrcode': 'qr-code', 'share-nodes': 'share-2', 'icons': 'layout-grid',
        'image': 'image', 'reply': 'corner-up-left', 'arrow-left': 'arrow-left',
        'arrow-right': 'arrow-right', 'lock': 'lock', 'lock-open': 'lock-open',
        'key': 'key', 'bell': 'bell', 'coins': 'coins', 'check': 'check',
        'check-double': 'check-check', 'dice': 'dice-5', 'dice-5': 'dice-5',
        'stopwatch': 'timer', 'link': 'link', 'chart-line': 'trending-up',
        'chart-simple': 'bar-chart-2', 'chart-pie': 'pie-chart', 'sliders': 'sliders',
        'fingerprint': 'fingerprint', 'eye': 'eye', 'eye-slash': 'eye-off',
        'angles-right': 'chevrons-right', 'face-frown': 'frown', 'wifi-slash': 'wifi-off'
      };
      if (remap[lucideName]) lucideName = remap[lucideName];
      el.setAttribute('data-lucide', lucideName);
    }
  });

  document.querySelectorAll('[data-lucide*=" "]').forEach(el => {
    const raw = (el.getAttribute('data-lucide') || '').trim();
    if (!raw) return;
    const [iconName, ...extraClasses] = raw.split(/\s+/);
    el.setAttribute('data-lucide', iconName);
    extraClasses.forEach(cls => { if (cls) el.classList.add(cls); });
  });

  createIcons({ icons: appIcons });
}

export function refreshAllIcons() {
  refreshIcons();
  if (typeof window !== "undefined") {
    (window as any).lucideIconsReady = true;
  }
}

export function refreshIconsForContainer(container: HTMLElement) {
  if (!container) return;
  const faIcons = container.querySelectorAll('i[class*="fa-"], span[class*="fa-"]');
  faIcons.forEach(el => {
    if (el.hasAttribute('data-lucide')) return;
    const classList = Array.from(el.classList);
    const faClass = classList.find(c =>
      c.startsWith('fa-') &&
      !['fa-solid', 'fa-regular', 'fa-light', 'fa-thin', 'fa-duotone', 'fa-brands',
        'fa-spin', 'fa-pulse', 'fa-bounce', 'fa-beat', 'fa-fade', 'fa-shake', 'fa-flip',
        'fa-2x', 'fa-3x', 'fa-4x', 'fa-lg', 'fa-sm', 'fa-xs', 'fa-fw',
        'fa-modal', 'fa-status-badge', 'fa-icon', 'fa-border', 'fa-pull-left', 'fa-pull-right'].includes(c)
    );
    if (faClass) {
      let lucideName = faClass.replace('fa-', '');
      const remap: Record<string, string> = {
        'headset': 'headset', 'gauge-high': 'gauge', 'gauge': 'gauge',
        'hourglass-empty': 'hourglass', 'hourglass-half': 'hourglass',
        'circle-xmark': 'x-circle', 'clock-rotate-left': 'history',
        'circle-arrow-down': 'arrow-down-circle', 'circle-arrow-up': 'arrow-up-circle',
        'up-right-from-square': 'external-link', 'arrow-up-right-from-square': 'external-link',
        'ticket-simple': 'ticket', 'cube': 'box', 'circle-nodes': 'network',
        'people-carry-box': 'users', 'whatsapp': 'message-circle', 'bullhorn': 'megaphone',
        'telegram': 'send', 'ranking-star': 'trophy', 'arrows-rotate': 'refresh-cw',
        'circle-exclamation': 'alert-circle', 'triangle-exclamation': 'alert-triangle',
        'border-all': 'layout-grid', 'box-open': 'box', 'folder-open': 'folder-open',
        'cloud-arrow-down': 'download', 'cloud-arrow-up': 'upload', 'money-bill-transfer': 'arrow-left-right',
        'money-bill-wave': 'banknote', 'money-bill': 'banknote', 'sack-dollar': 'circle-dollar-sign',
        'hand-holding-dollar': 'hand-coins', 'money-check-dollar': 'credit-card',
        'building-columns': 'landmark', 'magnifying-glass': 'search', 'xmark': 'x',
        'circle-check': 'check-circle', 'shield-halved': 'shield', 'shield-check': 'shield-check',
        'shield-virus': 'shield-alert', 'pen-to-square': 'edit', 'trash-can': 'trash-2',
        'cart-shopping': 'shopping-cart', 'bag-shopping': 'shopping-bag', 'gear': 'settings',
        'gears': 'settings', 'right-from-bracket': 'log-out', 'right-to-bracket': 'log-in',
        'bars': 'menu', 'paper-plane': 'send', 'comments': 'messages-square',
        'comment': 'message-square', 'file-lines': 'file-text', 'bolt-lightning': 'zap',
        'bolt': 'zap', 'user-shield': 'shield-check', 'user-gear': 'user-cog',
        'user-plus': 'user-plus', 'user-check': 'user-check', 'circle-question': 'help-circle',
        'circle-info': 'info', 'signal': 'activity', 'wifi': 'wifi', 'gamepad': 'gamepad-2',
        'rotate-right': 'rotate-cw', 'rotate-left': 'rotate-ccw', 'floppy-disk': 'save',
        'gem': 'gem', 'qrcode': 'qr-code', 'share-nodes': 'share-2', 'icons': 'layout-grid',
        'image': 'image', 'reply': 'corner-up-left', 'arrow-left': 'arrow-left',
        'arrow-right': 'arrow-right', 'lock': 'lock', 'lock-open': 'lock-open',
        'key': 'key', 'bell': 'bell', 'coins': 'coins', 'check': 'check',
        'check-double': 'check-check', 'dice': 'dice-5', 'dice-5': 'dice-5',
        'stopwatch': 'timer', 'link': 'link', 'chart-line': 'trending-up',
        'chart-simple': 'bar-chart-2', 'chart-pie': 'pie-chart', 'sliders': 'sliders',
        'fingerprint': 'fingerprint', 'eye': 'eye', 'eye-slash': 'eye-off',
        'angles-right': 'chevrons-right', 'face-frown': 'frown', 'wifi-slash': 'wifi-off'
      };
      if (remap[lucideName]) lucideName = remap[lucideName];
      el.setAttribute('data-lucide', lucideName);
    }
  });
  container.querySelectorAll('[data-lucide*=" "]').forEach(el => {
    const raw = (el.getAttribute('data-lucide') || '').trim();
    if (!raw) return;
    const [iconName, ...extraClasses] = raw.split(/\s+/);
    el.setAttribute('data-lucide', iconName);
    extraClasses.forEach(cls => { if (cls) el.classList.add(cls); });
  });

  try {
    createIcons({ 
      icons: appIcons,
      nameAttr: 'data-lucide',
      root: container
    });
  } catch (e) {
    console.warn("Container createIcons error:", e);
  }
}
