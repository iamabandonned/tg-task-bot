/* ============================================
   STATE - Global Application State Management
   ============================================ */

const AppState = {
  // ===== TELEGRAM USER (из WebApp.initDataUnsafe.user) =====
  telegramUser: {
    id: null,
    first_name: '',
    last_name: '',
    username: '',
    language_code: 'ru',
    is_premium: false,
    photo_url: '',
  },

  // ===== APP USER (админ из whitelist) =====
  currentUser: {
    telegramId: null,
    name: '',
  },

  // ===== АВТОРИЗАЦИЯ =====
  isAuthenticated: false,
  accessDeniedReason: null,

  // ===== NAVIGATION =====
  currentPage: 'tasks',
  previousPage: null,

  // ===== PAGE 1: ПОСТАНОВКА ЗАДАЧ =====
  taskForm: {
    selectedProjects: [],
    selectedEmployees: [],
    allProjectsSelected: false,
    selectedDepartmentsAll: [], // Departments where all employees are selected
    scheduledDate: '',
    scheduledTime: '',
    title: '',
    description: '',
    priority: 'normal',
    editingTaskId: null,
    projectSearchQuery: '',
    employeeSearchQuery: '',
  },
  showTaskPreview: false,

  // ===== PAGE 2: ПРОЕКТЫ =====
  projects: [],
  projectsEditMode: false,
  selectedProjectsForDelete: [],
  projectSearchQuery: '',
  expandedProjects: [],
  showAddProjectModal: false,
  editingProject: null,

  // ===== PAGE 3: СОТРУДНИКИ =====
  departments: [],
  employees: [],
  employeesEditMode: false,
  selectedEmployeesForDelete: [],
  selectedDepartmentsForDelete: [],
  employeeSearchQuery: '',
  expandedDepartments: [],
  showAddDepartmentModal: false,
  showAddEmployeeModal: false,
  editingDepartment: null,
  editingEmployee: null,

  // ===== PAGE 4: АНАЛИТИКА =====
  analyticsFilters: {
    dateFrom: '',
    dateTo: '',
    selectedDepartments: [],
    selectedEmployees: [],
    selectedProjects: [],
    status: 'all',
  },
  analyticsData: {
    totalTasks: 0,
    completedTasks: 0,
    averageCompletionTime: 0,
    tasksByStatus: {},
    tasksByEmployee: [],
    tasksByProject: [],
  },

  // ===== PAGE 5: СПИСОК ЗАДАЧ =====
  tasks: [],
  tasksSearchQuery: '',
  tasksFilter: {
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  selectedTasksForDelete: [],
  expandedTasks: [],
  showDeleteConfirmModal: false,
  taskToDelete: null,

  // ===== УВЕДОМЛЕНИЯ =====
  notificationSettings: {
    emailEnabled: true,
    telegramEnabled: false,
    emails: [],
    telegramChatIds: [],
    notifyOnComplete: true,
    notifyOnDeadline: true,
    notifyOnOverdue: true,
  },
  notificationRules: null, // Инициализируется по умолчанию в компоненте
  reminders: [],

  // ===== GLOBAL UI =====
  theme: 'auto',
  loading: false,
  error: null,
  toast: {
    show: false,
    message: '',
    type: 'info',
  },
};

// ===== STATE MANAGEMENT FUNCTIONS =====

/**
 * Обновление состояния по пути
 * @param {string} path - Путь к свойству (например, 'taskForm.title')
 * @param {*} value - Новое значение
 * @param {boolean} skipRender - Пропустить перерисовку
 */
function setState(path, value, skipRender = false) {
  const keys = path.split('.');
  let obj = AppState;

  for (let i = 0; i < keys.length - 1; i++) {
    if (obj[keys[i]] === undefined) {
      obj[keys[i]] = {};
    }
    obj = obj[keys[i]];
  }

  obj[keys[keys.length - 1]] = value;

  // Notify subscribers
  notifySubscribers(path, value);

  // Trigger re-render (if not skipped)
  if (!skipRender && typeof renderCurrentPage === 'function') {
    renderCurrentPage();
  }
}

/**
 * Получение состояния по пути
 * @param {string} path - Путь к свойству
 * @returns {*} Значение
 */
function getState(path) {
  if (!path) return AppState;
  return path.split('.').reduce((obj, key) => obj?.[key], AppState);
}

/**
 * Обновление объекта в состоянии (merge)
 * @param {string} path - Путь к объекту
 * @param {object} updates - Объект с обновлениями
 */
function updateState(path, updates) {
  const current = getState(path);
  if (typeof current === 'object' && current !== null) {
    setState(path, { ...current, ...updates });
  } else {
    setState(path, updates);
  }
}

/**
 * Добавление элемента в массив
 * @param {string} path - Путь к массиву
 * @param {*} item - Элемент для добавления
 */
function addToArray(path, item) {
  const arr = getState(path) || [];
  setState(path, [...arr, item]);
}

/**
 * Удаление элемента из массива по id
 * @param {string} path - Путь к массиву
 * @param {number|string} id - ID элемента
 */
function removeFromArray(path, id) {
  const arr = getState(path) || [];
  setState(
    path,
    arr.filter((item) => item.id !== id)
  );
}

/**
 * Обновление элемента в массиве по id
 * @param {string} path - Путь к массиву
 * @param {number|string} id - ID элемента
 * @param {object} updates - Объект с обновлениями
 */
function updateInArray(path, id, updates) {
  const arr = getState(path) || [];
  setState(
    path,
    arr.map((item) => (item.id === id ? { ...item, ...updates } : item))
  );
}

/**
 * Поиск элемента в массиве по id
 * @param {string} path - Путь к массиву
 * @param {number|string} id - ID элемента
 * @returns {*} Найденный элемент или undefined
 */
function findInArray(path, id) {
  const arr = getState(path) || [];
  return arr.find((item) => item.id === id);
}

/**
 * Toggle элемента в массиве
 * @param {string} path - Путь к массиву
 * @param {*} item - Элемент
 */
function toggleInArray(path, item) {
  const arr = getState(path) || [];
  const index = arr.indexOf(item);
  if (index === -1) {
    setState(path, [...arr, item]);
  } else {
    setState(
      path,
      arr.filter((_, i) => i !== index)
    );
  }
}

// ===== SUBSCRIBERS (optional reactive updates) =====
const subscribers = new Map();

function subscribe(path, callback) {
  if (!subscribers.has(path)) {
    subscribers.set(path, []);
  }
  subscribers.get(path).push(callback);

  // Return unsubscribe function
  return () => {
    const callbacks = subscribers.get(path);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  };
}

function notifySubscribers(path, value) {
  // Exact path match
  if (subscribers.has(path)) {
    subscribers.get(path).forEach((cb) => cb(value));
  }

  // Parent path notifications
  const parts = path.split('.');
  for (let i = 1; i < parts.length; i++) {
    const parentPath = parts.slice(0, i).join('.');
    if (subscribers.has(parentPath)) {
      subscribers.get(parentPath).forEach((cb) => cb(getState(parentPath)));
    }
  }
}

// ===== RESET FUNCTIONS =====

function resetTaskForm() {
  setState('taskForm', {
    selectedProjects: [],
    selectedEmployees: [],
    allProjectsSelected: false,
    selectedDepartmentsAll: [],
    scheduledDate: '',
    scheduledTime: '',
    title: '',
    description: '',
    priority: 'normal',
    editingTaskId: null,
    projectSearchQuery: '',
    employeeSearchQuery: '',
  });
  setState('showTaskPreview', false);
}

function resetFilters() {
  setState('analyticsFilters', {
    dateFrom: '',
    dateTo: '',
    selectedDepartments: [],
    selectedEmployees: [],
    selectedProjects: [],
    status: 'all',
  });
  setState('tasksSearchQuery', '');
  setState('tasksFilter', {
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  setState('projectSearchQuery', '');
  setState('employeeSearchQuery', '');
}

function resetEditMode() {
  setState('projectsEditMode', false);
  setState('employeesEditMode', false);
  setState('selectedProjectsForDelete', []);
  setState('selectedEmployeesForDelete', []);
  setState('selectedDepartmentsForDelete', []);
  setState('selectedTasksForDelete', []);
}

// ===== DEBUG =====
function logState() {
  console.log('Current AppState:', JSON.parse(JSON.stringify(AppState)));
}

// Make state available globally for debugging
window.AppState = AppState;
window.setState = setState;
window.getState = getState;
window.logState = logState;
window.findInArray = findInArray;
window.resetTaskForm = resetTaskForm;
window.resetEditMode = resetEditMode;
