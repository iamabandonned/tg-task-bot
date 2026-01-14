/* ============================================
   MAIN - Application Entry Point & Router
   ============================================ */

// Page titles
const PAGE_TITLES = {
  tasks: 'Новая задача',
  projects: 'Проекты',
  employees: 'Сотрудники',
  analytics: 'Аналитика',
  'tasks-list': 'Задачи',
};

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  console.log('🚀 Initializing Task Manager...');

  // 1. Initialize Telegram WebApp
  const tgInitialized = initTelegramWebApp();

  // 2. Authenticate user
  const isAuthed = initTelegramAuth();

  if (!isAuthed) {
    console.log('❌ Authentication failed');
    return;
  }

  // 3. Load mock data
  initMockData();

  // 4. Setup routing
  setupRouting();

  // 5. Setup event listeners
  setupEventListeners();

  // 6. Hide loading, show app
  showApp();

  // 7. Navigate to initial page
  const initialPage = window.location.hash.slice(1) || 'tasks';
  navigateTo(initialPage);

  // Some environments may have a tiny race between script load and render
  // (especially when many modules modify state). Ensure page is rendered
  // after the call stack finishes to avoid an initially-empty view.
  setTimeout(() => {
    try {
      renderCurrentPage();
    } catch (e) {
      console.warn('Render retry failed:', e);
    }
  }, 20);

  console.log('✅ App initialized');
}

function showApp() {
  const loadingScreen = document.getElementById('loading-screen');
  const appContainer = document.getElementById('app');

  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }

  if (appContainer) {
    appContainer.classList.remove('hidden');
    appContainer.classList.add('fade-in');
  }
}

// ===== ROUTING =====

function setupRouting() {
  window.addEventListener('hashchange', handleRouteChange);
}

function handleRouteChange() {
  const hash = window.location.hash.slice(1) || 'tasks';
  navigateTo(hash);
}

function navigateTo(page) {
  const validPages = ['tasks', 'projects', 'employees', 'analytics', 'tasks-list'];

  if (!validPages.includes(page)) {
    page = 'tasks';
  }

  // Update hash without triggering hashchange
  if (window.location.hash !== '#' + page) {
    history.pushState(null, '', '#' + page);
  }

  // Save previous page
  const previousPage = getState('currentPage');
  if (previousPage && previousPage !== page) {
    setState('previousPage', previousPage, true);
  }

  // Update state
  setState('currentPage', page, true);

  // Update page title
  updatePageTitle(page);

  // Update navigation
  updateNavigation(page);

  // Update back button visibility
  updateBackButton(page);

  // Render page - всегда перерисовываем
  renderCurrentPage();

  // Scroll to top
  const mainContent = document.getElementById('main-content');
  if (mainContent) mainContent.scrollTop = 0;

  // Haptic feedback
  haptic.light();
}

function navigateBack() {
  const previousPage = getState('previousPage');
  if (previousPage) {
    navigateTo(previousPage);
  } else {
    navigateTo('tasks');
  }
}

function updatePageTitle(page) {
  const titleElement = document.getElementById('page-title');
  if (titleElement) {
    titleElement.textContent = PAGE_TITLES[page] || 'Task Manager';
  }

  document.title = PAGE_TITLES[page] || 'Task Manager';
}

function updateNavigation(page) {
  const navItems = document.querySelectorAll('.bottom-nav__item');

  navItems.forEach((item) => {
    const itemPage = item.dataset.page;
    item.classList.toggle('active', itemPage === page);
  });
}

function updateBackButton(page) {
  // Show back button on all pages except 'tasks'
  if (page !== 'tasks' && typeof showBackButton === 'function') {
    showBackButton(true);
  } else if (typeof showBackButton === 'function') {
    showBackButton(false);
  }
}

// ===== RENDERING =====

function renderCurrentPage() {
  const page = getState('currentPage');
  const mainContent = document.getElementById('main-content');

  if (!mainContent) return;

  let html = '';

  switch (page) {
    case 'tasks':
      html = renderTasksPage();
      break;
    case 'projects':
      html = renderProjectsPage();
      break;
    case 'employees':
      html = renderEmployeesPage();
      break;
    case 'analytics':
      html = renderAnalyticsPage();
      break;
    case 'tasks-list':
      html = renderTasksListPage();
      break;
    default:
      html = renderTasksPage();
  }

  // Просто обновляем контент без анимации
  mainContent.innerHTML = html;
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
  // Bottom navigation
  const navItems = document.querySelectorAll('.bottom-nav__item');
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) {
        navigateTo(page);
      }
    });
  });

  // Notification settings button
  const notifBtn = document.getElementById('btn-notifications');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      showNotificationSettingsModal();
    });
  }

  // Close modals on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Handle clicks outside modal
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  });

  // Prevent pull-to-refresh on mobile
  document.body.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
}

// ===== GLOBAL ERROR HANDLER =====

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showToast('Произошла ошибка', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showToast('Произошла ошибка', 'error');
});

// ===== EXPORTS =====

window.navigateTo = navigateTo;
window.navigateBack = navigateBack;
window.renderCurrentPage = renderCurrentPage;
