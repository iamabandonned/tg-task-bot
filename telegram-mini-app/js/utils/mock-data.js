/* ============================================
   MOCK DATA - Тестовые данные для разработки
   ============================================ */

/**
 * Генерация уникального ID
 */
let _idCounter = 1000;
function generateId() {
  return ++_idCounter;
}

/**
 * Форматирование даты
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDateTime(date) {
  return date.toISOString();
}

// ===== PROJECTS (Иерархические) =====
const MOCK_PROJECTS = [
  // Корневые проекты
  {
    id: 1,
    parentId: null,
    name: 'ООО "Рога и Копыта"',
    description: 'Главный клиент компании',
    color: '#2180ce',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    order: 1
  },
  {
    id: 2,
    parentId: null,
    name: 'ИП Сидоров',
    description: 'Индивидуальный предприниматель',
    color: '#31a24c',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    order: 2
  },
  {
    id: 3,
    parentId: null,
    name: 'Внутренние проекты',
    description: 'Внутренние задачи компании',
    color: '#f0ad4e',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
    order: 3
  },
  
  // Дочерние проекты для "Рога и Копыта"
  {
    id: 4,
    parentId: 1,
    name: 'Сайт компании',
    description: 'Разработка и поддержка сайта',
    color: '#2180ce',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    order: 1
  },
  {
    id: 5,
    parentId: 1,
    name: 'Мобильное приложение',
    description: 'iOS и Android приложение',
    color: '#2180ce',
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z',
    order: 2
  },
  {
    id: 6,
    parentId: 1,
    name: 'CRM система',
    description: 'Внедрение CRM',
    color: '#2180ce',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
    order: 3
  },
  
  // Под-подпроекты
  {
    id: 7,
    parentId: 4,
    name: 'Редизайн главной',
    description: 'Обновление главной страницы',
    color: '#17a2b8',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
    order: 1
  },
  {
    id: 8,
    parentId: 4,
    name: 'SEO оптимизация',
    description: 'Оптимизация для поисковиков',
    color: '#17a2b8',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z',
    order: 2
  },
  
  // Дочерние для ИП Сидоров
  {
    id: 9,
    parentId: 2,
    name: 'Интернет-магазин',
    description: 'Разработка магазина',
    color: '#31a24c',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    order: 1
  },
  
  // Дочерние для внутренних
  {
    id: 10,
    parentId: 3,
    name: 'Автоматизация',
    description: 'Внутренние инструменты',
    color: '#f0ad4e',
    createdAt: '2024-03-05T10:00:00Z',
    updatedAt: '2024-03-05T10:00:00Z',
    order: 1
  },
  {
    id: 11,
    parentId: 3,
    name: 'Документация',
    description: 'Ведение документации',
    color: '#f0ad4e',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
    order: 2
  }
];

// ===== DEPARTMENTS =====
const MOCK_DEPARTMENTS = [
  {
    id: 1,
    name: 'Отдел разработки',
    description: 'Backend и Frontend разработка',
    managerId: 1,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    order: 1
  },
  {
    id: 2,
    name: 'Отдел дизайна',
    description: 'UI/UX дизайн',
    managerId: 4,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    order: 2
  },
  {
    id: 3,
    name: 'Отдел маркетинга',
    description: 'Продвижение и реклама',
    managerId: 6,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    order: 3
  },
  {
    id: 4,
    name: 'Отдел продаж',
    description: 'Работа с клиентами',
    managerId: 8,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    order: 4
  }
];

// ===== EMPLOYEES =====
const MOCK_EMPLOYEES = [
  // Отдел разработки
  {
    id: 1,
    departmentId: 1,
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan.petrov@company.ru',
    phone: '+7 (999) 123-45-67',
    position: 'Team Lead',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 2,
    departmentId: 1,
    firstName: 'Мария',
    lastName: 'Сидорова',
    email: 'maria.sidorova@company.ru',
    phone: '+7 (999) 234-56-78',
    position: 'Senior Developer',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 3,
    departmentId: 1,
    firstName: 'Алексей',
    lastName: 'Козлов',
    email: 'alexey.kozlov@company.ru',
    phone: '+7 (999) 345-67-89',
    position: 'Middle Developer',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  
  // Отдел дизайна
  {
    id: 4,
    departmentId: 2,
    firstName: 'Елена',
    lastName: 'Волкова',
    email: 'elena.volkova@company.ru',
    phone: '+7 (999) 456-78-90',
    position: 'Lead Designer',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 5,
    departmentId: 2,
    firstName: 'Дмитрий',
    lastName: 'Новиков',
    email: 'dmitry.novikov@company.ru',
    phone: '+7 (999) 567-89-01',
    position: 'UI Designer',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z'
  },
  
  // Отдел маркетинга
  {
    id: 6,
    departmentId: 3,
    firstName: 'Ольга',
    lastName: 'Морозова',
    email: 'olga.morozova@company.ru',
    phone: '+7 (999) 678-90-12',
    position: 'Marketing Manager',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 7,
    departmentId: 3,
    firstName: 'Сергей',
    lastName: 'Белов',
    email: 'sergey.belov@company.ru',
    phone: '+7 (999) 789-01-23',
    position: 'SMM Specialist',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z'
  },
  
  // Отдел продаж
  {
    id: 8,
    departmentId: 4,
    firstName: 'Анна',
    lastName: 'Кузнецова',
    email: 'anna.kuznetsova@company.ru',
    phone: '+7 (999) 890-12-34',
    position: 'Sales Manager',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 9,
    departmentId: 4,
    firstName: 'Павел',
    lastName: 'Смирнов',
    email: 'pavel.smirnov@company.ru',
    phone: '+7 (999) 901-23-45',
    position: 'Account Manager',
    avatar: null,
    isActive: true,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  },
  {
    id: 10,
    departmentId: 4,
    firstName: 'Наталья',
    lastName: 'Федорова',
    email: 'natalia.fedorova@company.ru',
    phone: '+7 (999) 012-34-56',
    position: 'Sales Representative',
    avatar: null,
    isActive: false, // Неактивный сотрудник
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z'
  }
];

// ===== TASKS =====
const today = new Date();
const MOCK_TASKS = [
  {
    id: 1,
    title: 'Разработать модуль авторизации',
    description: 'Необходимо внедрить OAuth 2.0 для мобильного приложения. Включает интеграцию с Google и Apple ID.',
    projectIds: [5],
    assigneeIds: [1, 2],
    creatorId: 1,
    scheduledDate: formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)),
    scheduledTime: '14:00',
    status: 'in_progress',
    priority: 'high',
    remindersEnabled: true,
    lastReminderSent: null,
    nextReminderDate: formatDateTime(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
    completedAt: null,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-25T15:30:00Z'
  },
  {
    id: 2,
    title: 'Создать макеты новой главной страницы',
    description: 'Разработать 3 варианта дизайна главной страницы для утверждения клиентом.',
    projectIds: [7],
    assigneeIds: [4, 5],
    creatorId: 1,
    scheduledDate: formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)),
    scheduledTime: '12:00',
    status: 'pending',
    priority: 'normal',
    remindersEnabled: true,
    lastReminderSent: null,
    nextReminderDate: formatDateTime(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
    completedAt: null,
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z'
  },
  {
    id: 3,
    title: 'Настроить SEO метатеги',
    description: 'Добавить и оптимизировать meta теги на всех страницах сайта.',
    projectIds: [8],
    assigneeIds: [2, 7],
    creatorId: 1,
    scheduledDate: formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)), // Просрочена
    scheduledTime: '10:00',
    status: 'in_progress',
    priority: 'urgent',
    remindersEnabled: true,
    lastReminderSent: formatDateTime(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
    nextReminderDate: formatDateTime(today),
    completedAt: null,
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z'
  },
  {
    id: 4,
    title: 'Провести тестирование интернет-магазина',
    description: 'Полное функциональное тестирование корзины, оплаты и доставки.',
    projectIds: [9],
    assigneeIds: [3],
    creatorId: 1,
    scheduledDate: formatDate(new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)),
    scheduledTime: '16:00',
    status: 'pending',
    priority: 'normal',
    remindersEnabled: true,
    lastReminderSent: null,
    nextReminderDate: formatDateTime(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
    completedAt: null,
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z'
  },
  {
    id: 5,
    title: 'Подготовить рекламную кампанию',
    description: 'Создать креативы и настроить таргетинг для запуска рекламы в социальных сетях.',
    projectIds: [1, 4],
    assigneeIds: [6, 7],
    creatorId: 1,
    scheduledDate: formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
    scheduledTime: '11:00',
    status: 'pending',
    priority: 'high',
    remindersEnabled: true,
    lastReminderSent: null,
    nextReminderDate: formatDateTime(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
    completedAt: null,
    createdAt: '2024-01-26T10:00:00Z',
    updatedAt: '2024-01-26T10:00:00Z'
  },
  {
    id: 6,
    title: 'Обновить документацию API',
    description: 'Актуализировать документацию по всем эндпоинтам API.',
    projectIds: [11],
    assigneeIds: [1, 3],
    creatorId: 1,
    scheduledDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
    scheduledTime: '09:00',
    status: 'completed',
    priority: 'low',
    remindersEnabled: false,
    lastReminderSent: null,
    nextReminderDate: null,
    completedAt: formatDateTime(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-27T14:00:00Z'
  },
  {
    id: 7,
    title: 'Провести встречу с клиентом',
    description: 'Обсудить требования к новому функционалу CRM системы.',
    projectIds: [6],
    assigneeIds: [8, 9],
    creatorId: 1,
    scheduledDate: formatDate(today),
    scheduledTime: '15:00',
    status: 'in_progress',
    priority: 'high',
    remindersEnabled: true,
    lastReminderSent: formatDateTime(new Date(today.getTime() - 2 * 60 * 60 * 1000)),
    nextReminderDate: null,
    completedAt: null,
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z'
  },
  {
    id: 8,
    title: 'Исправить баг в корзине',
    description: 'При добавлении более 10 товаров происходит ошибка расчёта скидки.',
    projectIds: [9],
    assigneeIds: [2],
    creatorId: 1,
    scheduledDate: formatDate(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)),
    scheduledTime: '10:00',
    status: 'pending',
    priority: 'urgent',
    remindersEnabled: true,
    lastReminderSent: null,
    nextReminderDate: formatDateTime(new Date(today.getTime() + 12 * 60 * 60 * 1000)),
    completedAt: null,
    createdAt: '2024-01-29T08:00:00Z',
    updatedAt: '2024-01-29T08:00:00Z'
  }
];

// ===== REMINDERS (Log) =====
const MOCK_REMINDERS = [
  {
    id: 1,
    taskId: 3,
    employeeId: 2,
    type: 'email',
    status: 'sent',
    sentAt: formatDateTime(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
    errorMessage: null,
    createdAt: formatDateTime(new Date(today.getTime() - 24 * 60 * 60 * 1000))
  },
  {
    id: 2,
    taskId: 7,
    employeeId: 8,
    type: 'email',
    status: 'sent',
    sentAt: formatDateTime(new Date(today.getTime() - 2 * 60 * 60 * 1000)),
    errorMessage: null,
    createdAt: formatDateTime(new Date(today.getTime() - 2 * 60 * 60 * 1000))
  }
];

// ===== NOTIFICATION SETTINGS =====
const MOCK_NOTIFICATION_SETTINGS = {
  emailEnabled: true,
  telegramEnabled: false,
  emails: ['admin@company.ru'],
  telegramChatIds: [],
  notifyOnComplete: true,
  notifyOnDeadline: true,
  notifyOnOverdue: true
};

// ===== INITIALIZE MOCK DATA =====
function initMockData() {
  setState('projects', [...MOCK_PROJECTS], true);
  setState('departments', [...MOCK_DEPARTMENTS], true);
  setState('employees', [...MOCK_EMPLOYEES], true);
  setState('tasks', [...MOCK_TASKS], true);
  setState('reminders', [...MOCK_REMINDERS], true);
  setState('notificationSettings', { ...MOCK_NOTIFICATION_SETTINGS }, true);
  
  // Expand root projects and departments by default
  setState('expandedProjects', [1, 2, 3], true);
  setState('expandedDepartments', [1, 2, 3, 4], true);
  setState('expandedProjectSections', ['active'], true);
  
  console.log('📦 Mock data initialized');
}

// Export
window.MOCK_PROJECTS = MOCK_PROJECTS;
window.MOCK_DEPARTMENTS = MOCK_DEPARTMENTS;
window.MOCK_EMPLOYEES = MOCK_EMPLOYEES;
window.MOCK_TASKS = MOCK_TASKS;
window.initMockData = initMockData;
window.generateId = generateId;

