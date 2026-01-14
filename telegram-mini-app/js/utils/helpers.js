/* ============================================
   HELPERS - Utility Functions
   ============================================ */

/**
 * Debounce функция
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle функция
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Форматирование даты
 */
function formatDate(dateStr, format = 'short') {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return dateStr;

  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    weekday: { weekday: 'short', day: 'numeric', month: 'short' },
  };

  return date.toLocaleDateString('ru-RU', options[format] || options.short);
}

/**
 * Форматирование времени
 */
function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
}

/**
 * Форматирование даты и времени
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Относительное время (сегодня, вчера, завтра)
 */
function getRelativeDate(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Завтра';
  if (diff === -1) return 'Вчера';
  if (diff > 1 && diff <= 7) return `Через ${diff} дн.`;
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)} дн. назад`;

  return formatDate(dateStr);
}

/**
 * Дней до даты
 */
function daysUntil(dateStr) {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return Math.floor((date - today) / (1000 * 60 * 60 * 24));
}

/**
 * Проверка просрочки
 */
function isOverdue(dateStr) {
  const days = daysUntil(dateStr);
  return days !== null && days < 0;
}

/**
 * Получить полное имя сотрудника
 */
function getEmployeeFullName(employee) {
  if (!employee) return '';
  return `${employee.firstName} ${employee.lastName}`.trim();
}

/**
 * Получить инициалы
 */
function getInitials(firstName, lastName) {
  const first = firstName ? firstName[0].toUpperCase() : '';
  const last = lastName ? lastName[0].toUpperCase() : '';
  return first + last;
}

/**
 * Pluralize (склонение слов)
 */
function pluralize(count, words) {
  // words = ['задача', 'задачи', 'задач']
  const cases = [2, 0, 1, 1, 1, 2];
  const index = count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)];
  return words[index];
}

/**
 * Подсчёт задач по статусу
 */
function countByStatus(tasks) {
  return tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Фильтрация задач
 */
function filterTasks(tasks, filters) {
  return tasks.filter((task) => {
    // Status filter
    if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const title = task.title.toLowerCase();
      const description = (task.description || '').toLowerCase();

      if (!title.includes(query) && !description.includes(query)) {
        return false;
      }
    }

    // Date range
    if (filters.dateFrom && task.scheduledDate < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && task.scheduledDate > filters.dateTo) {
      return false;
    }

    // Projects
    if (filters.projectIds && filters.projectIds.length > 0) {
      const hasProject = task.projectIds.some((id) => filters.projectIds.includes(id));
      if (!hasProject) return false;
    }

    // Employees
    if (filters.employeeIds && filters.employeeIds.length > 0) {
      const hasEmployee = task.assigneeIds.some((id) => filters.employeeIds.includes(id));
      if (!hasEmployee) return false;
    }

    return true;
  });
}

/**
 * Сортировка задач
 */
function sortTasks(tasks, sortBy, sortOrder) {
  return [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
      case 'scheduledDate':
        comparison = new Date(a.scheduledDate) - new Date(b.scheduledDate);
        break;
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'status':
        const statusOrder = { new: 0, in_progress: 1, completed: 2, cancelled: 3 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title, 'ru');
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Генерация случайного цвета
 */
function randomColor() {
  const colors = [
    '#2180ce',
    '#31a24c',
    '#f0ad4e',
    '#d33f49',
    '#17a2b8',
    '#6c757d',
    '#9c27b0',
    '#ff5722',
    '#795548',
    '#607d8b',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Проверка мобильного устройства
 */
function isMobile() {
  return window.innerWidth <= 768;
}

/**
 * Копировать в буфер обмена
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Генерация UUID
 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Получить статус на русском
 */
function getStatusLabel(status) {
  const labels = {
    pending: 'Ожидает',
    in_progress: 'В работе',
    completed: 'Завершена',
  };
  return labels[status] || status;
}

/**
 * Получить приоритет на русском
 */
function getPriorityLabel(priority) {
  const labels = {
    low: 'Низкий',
    normal: 'Обычный',
    high: 'Высокий',
    urgent: 'Срочный',
  };
  return labels[priority] || priority;
}

// Export
window.debounce = debounce;
window.throttle = throttle;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.formatDateTime = formatDateTime;
window.getRelativeDate = getRelativeDate;
window.daysUntil = daysUntil;
window.isOverdue = isOverdue;
window.getEmployeeFullName = getEmployeeFullName;
window.getInitials = getInitials;
window.pluralize = pluralize;
window.countByStatus = countByStatus;
window.filterTasks = filterTasks;
window.sortTasks = sortTasks;
window.escapeHtml = escapeHtml;
window.randomColor = randomColor;
window.isMobile = isMobile;
window.copyToClipboard = copyToClipboard;
window.uuid = uuid;
window.getStatusLabel = getStatusLabel;
window.getPriorityLabel = getPriorityLabel;
