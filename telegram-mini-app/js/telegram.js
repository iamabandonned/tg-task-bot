/* ============================================
   TELEGRAM - WebApp SDK Integration & Auth
   ============================================ */

// Telegram WebApp instance
let tg = null;

/**
 * Инициализация Telegram WebApp
 */
function initTelegramWebApp() {
  tg = window.Telegram?.WebApp;

  if (!tg) {
    console.warn('Telegram WebApp not available');
    // Для разработки вне Telegram
    if (isDevelopment()) {
      console.log('Development mode: creating mock Telegram user');
      createMockTelegramUser();
      return true;
    }
    return false;
  }

  // 1. Сигнал готовности
  tg.ready();

  // 2. Раскрываем на весь экран
  tg.expand();

  // 3. Цвета хедера
  try {
    tg.setHeaderColor('#2180ce');
    tg.setBackgroundColor(tg.colorScheme === 'dark' ? '#1a1a1a' : '#ffffff');
  } catch (e) {
    console.warn('Could not set header color:', e);
  }

  // 4. Тема (light/dark)
  setTheme(tg.colorScheme || 'light');

  // 5. Подписка на изменение темы
  tg.onEvent('themeChanged', () => {
    setTheme(tg.colorScheme);
  });

  // 6. Кнопка "Назад"
  tg.BackButton.onClick(() => {
    if (typeof navigateBack === 'function') {
      navigateBack();
    }
  });

  // 7. Haptic feedback
  initHapticFeedback();

  return true;
}

/**
 * Авторизация через Telegram
 */
function initTelegramAuth() {
  // Проверяем, что запущено в Telegram (или dev mode)
  if (!tg && !isDevelopment()) {
    showAccessDeniedScreen('not_telegram');
    return false;
  }

  // В dev mode уже создан mock пользователь
  if (isDevelopment() && getState('isAuthenticated')) {
    return true;
  }

  const user = tg?.initDataUnsafe?.user;

  // Проверяем данные пользователя
  if (!user || !user.id) {
    if (isDevelopment()) {
      createMockTelegramUser();
      return true;
    }
    showAccessDeniedScreen('no_user_data');
    return false;
  }

  // ГЛАВНАЯ ПРОВЕРКА: есть ли пользователь в whitelist
  const admin = ALLOWED_ADMINS.find((a) => a.telegramId === user.id);

  if (!admin) {
    // ДОСТУП ЗАПРЕЩЁН — ID не в списке
    showAccessDeniedScreen('not_in_whitelist', user);
    return false;
  }

  // Пользователь в whitelist — ПОЛНЫЙ ДОСТУП

  // Сохраняем данные Telegram пользователя
  setState(
    'telegramUser',
    {
      id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      language_code: user.language_code || 'ru',
      is_premium: user.is_premium || false,
      photo_url: user.photo_url || '',
    },
    true
  );

  // Устанавливаем текущего пользователя
  setState(
    'currentUser',
    {
      telegramId: user.id,
      name: admin.name,
    },
    true
  );

  setState('isAuthenticated', true, true);

  console.log('✅ User authenticated:', admin.name);

  return true;
}

/**
 * Создание mock пользователя для разработки
 */
function createMockTelegramUser() {
  // Берём первого админа из списка для тестирования
  const mockAdmin = ALLOWED_ADMINS[0] || {
    telegramId: 999999999,
    name: 'Dev Admin',
  };

  setState(
    'telegramUser',
    {
      id: mockAdmin.telegramId,
      first_name: 'Dev',
      last_name: 'Admin',
      username: 'dev_admin',
      language_code: 'ru',
      is_premium: false,
      photo_url: '',
    },
    true
  );

  setState(
    'currentUser',
    {
      telegramId: mockAdmin.telegramId,
      name: mockAdmin.name,
    },
    true
  );

  setState('isAuthenticated', true, true);

  console.log('🔧 Mock user created:', mockAdmin.name);
}

/**
 * Проверка режима разработки
 * ВРЕМЕННО: всегда возвращает true для тестирования в браузере
 */
function isDevelopment() {
  // TODO: Вернуть проверку перед деплоем
  // return window.location.hostname === 'localhost' ||
  //        window.location.hostname === '127.0.0.1' ||
  //        window.location.protocol === 'file:';

  return true; // Всегда dev mode для тестирования
}

/**
 * Показать экран "Доступ запрещён"
 */
function showAccessDeniedScreen(reason, user = null) {
  setState('isAuthenticated', false, true);
  setState('accessDeniedReason', reason, true);

  const messages = {
    not_telegram: {
      title: '⚠️ Ошибка запуска',
      text: 'Приложение работает только в Telegram',
      icon: '📱',
    },
    no_user_data: {
      title: '⚠️ Ошибка авторизации',
      text: 'Не удалось получить данные пользователя',
      icon: '🔐',
    },
    not_in_whitelist: {
      title: '🚫 Доступ запрещён',
      text: `Ваш аккаунт (ID: ${user?.id || 'неизвестен'}) не имеет доступа к этому приложению.\n\nОбратитесь к администратору для получения доступа.`,
      icon: '🔒',
    },
  };

  const config = messages[reason] || messages['not_telegram'];

  // Скрываем loading и app
  const loadingScreen = document.getElementById('loading-screen');
  const appContainer = document.getElementById('app');
  const accessDenied = document.getElementById('access-denied');

  if (loadingScreen) loadingScreen.classList.add('hidden');
  if (appContainer) appContainer.classList.add('hidden');

  if (accessDenied) {
    accessDenied.querySelector('.access-denied__icon').textContent = config.icon;
    accessDenied.querySelector('.access-denied__title').textContent = config.title;
    accessDenied.querySelector('.access-denied__text').textContent = config.text;
    accessDenied.classList.remove('hidden');
  }
}

/**
 * Установка темы
 */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  setState('theme', theme, true);
}

/**
 * Инициализация haptic feedback
 */
function initHapticFeedback() {
  window.haptic = {
    light: () => {
      try {
        tg?.HapticFeedback?.impactOccurred('light');
      } catch (e) {}
    },
    medium: () => {
      try {
        tg?.HapticFeedback?.impactOccurred('medium');
      } catch (e) {}
    },
    heavy: () => {
      try {
        tg?.HapticFeedback?.impactOccurred('heavy');
      } catch (e) {}
    },
    success: () => {
      try {
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
    },
    error: () => {
      try {
        tg?.HapticFeedback?.notificationOccurred('error');
      } catch (e) {}
    },
    warning: () => {
      try {
        tg?.HapticFeedback?.notificationOccurred('warning');
      } catch (e) {}
    },
    selection: () => {
      try {
        tg?.HapticFeedback?.selectionChanged();
      } catch (e) {}
    },
  };
}

/**
 * Показать/скрыть кнопку "Назад"
 */
function showBackButton(show = true) {
  if (!tg) return;

  if (show) {
    tg.BackButton.show();
  } else {
    tg.BackButton.hide();
  }
}

/**
 * Показать главную кнопку
 */
function showMainButton(text, onClick, color = null) {
  if (!tg) return;

  tg.MainButton.setText(text);
  tg.MainButton.onClick(onClick);

  if (color) {
    tg.MainButton.setParams({ color });
  }

  tg.MainButton.show();
}

/**
 * Скрыть главную кнопку
 */
function hideMainButton() {
  if (!tg) return;

  tg.MainButton.hide();
  tg.MainButton.offClick();
}

/**
 * Показать подтверждение закрытия
 */
function enableClosingConfirmation() {
  if (!tg) return;
  tg.enableClosingConfirmation();
}

/**
 * Отключить подтверждение закрытия
 */
function disableClosingConfirmation() {
  if (!tg) return;
  tg.disableClosingConfirmation();
}

/**
 * Закрыть Mini App
 */
function closeMiniApp() {
  if (tg) {
    tg.close();
  } else {
    window.close();
  }
}

/**
 * Открыть ссылку во внешнем браузере
 */
function openLink(url) {
  if (tg) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank');
  }
}

/**
 * Открыть Telegram ссылку
 */
function openTelegramLink(url) {
  if (tg) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
  }
}

/**
 * Получить initData для бэкенда
 */
function getInitData() {
  return tg?.initData || '';
}

/**
 * Получить initDataUnsafe
 */
function getInitDataUnsafe() {
  return tg?.initDataUnsafe || {};
}

// Export for global access
window.tg = tg;
window.initTelegramWebApp = initTelegramWebApp;
window.initTelegramAuth = initTelegramAuth;
window.showBackButton = showBackButton;
window.haptic = window.haptic || {
  light: () => {},
  medium: () => {},
  heavy: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  selection: () => {},
};
