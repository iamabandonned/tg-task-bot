# 📋 PROJECT PLAN: Telegram Mini App Task Manager

## 🎯 Обзор проекта

**Название:** Task Manager Mini App  
**Платформа:** Telegram Mini App (WebApp)  
**Технологии:** Vanilla JavaScript, CSS3, HTML5  
**Архитектура:** Single Page Application (SPA)

### ⚠️ Модель доступа

```
┌─────────────────────────────────────────────────────────────┐
│                    РАЗГРАНИЧЕНИЕ ДОСТУПА                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👔 АДМИНИСТРАТОРЫ (Mini App)       👷 СОТРУДНИКИ (Email)   │
│  ─────────────────────────          ─────────────────────   │
│  ✅ ПОЛНЫЙ доступ к Mini App        ❌ НЕТ доступа к App    │
│  ✅ Создание задач                  ✅ Получают email       │
│  ✅ Управление проектами            ✅ Ссылка в письме      │
│  ✅ Управление сотрудниками         ✅ Web-страница отчёта  │
│  ✅ Аналитика                       ✅ Отметка выполнения   │
│  ✅ Список всех задач               (реализуем позже)       │
│  ✅ Управление админами                                     │
│                                                             │
│  Проверка: Telegram ID в whitelist  Взаимодействие: Email   │
│  Роли: НЕТ (все админы равны)                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Telegram ID в whitelist → ПОЛНЫЙ ДОСТУП**  
**Telegram ID НЕ в whitelist → Экран "Доступ запрещён"**

---

## 🏗️ Frontend SPA Архитектура

### Навигация

```
┌─────────────────────────────────────────────────┐
│              BOTTOM NAVIGATION BAR              │
├─────────┬─────────┬─────────┬─────────┬─────────┤
│  📝     │  📁     │  👥     │  📊     │  📋     │
│ Задача  │ Проекты │Сотрудн. │Аналитика│ Задачи  │
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

### 5 Основных Страниц

| #   | Страница         | URL Hash      | Описание                                                   |
| --- | ---------------- | ------------- | ---------------------------------------------------------- |
| 1   | Постановка задач | `#tasks`      | Создание новой задачи с выбором проекта, сотрудников, даты |
| 2   | Проекты          | `#projects`   | CRUD операции с иерархией проектов                         |
| 3   | Сотрудники       | `#employees`  | CRUD операции с отделами и сотрудниками                    |
| 4   | Аналитика        | `#analytics`  | Фильтры и статистика по задачам                            |
| 5   | Список задач     | `#tasks-list` | Просмотр, поиск, редактирование задач                      |

---

## 🧩 Компоненты и Иерархия

### Дерево компонентов

```
App
├── AccessDeniedScreen (если не авторизован)
│   ├── Icon
│   ├── Title
│   ├── Message
│   └── CloseButton
│
├── Header (только если авторизован)
│   ├── PageTitle
│   ├── NotificationSettingsButton (🔔)
│   └── ThemeToggle
├── MainContent
│   ├── Page: Tasks (Постановка задач)
│   │   ├── ProjectTreeSelector
│   │   │   ├── TreeNode (recursive)
│   │   │   └── Checkbox
│   │   ├── EmployeeSelector
│   │   │   ├── DepartmentGroup
│   │   │   │   ├── SelectAllCheckbox
│   │   │   │   └── EmployeeCheckbox[]
│   │   ├── DateTimePicker
│   │   │   ├── DateInput
│   │   │   └── TimeInput
│   │   ├── TaskForm
│   │   │   ├── Input (title)
│   │   │   └── Textarea (description)
│   │   ├── PreviewModal
│   │   └── ActionButtons
│   │
│   ├── Page: Projects (Проекты)
│   │   ├── SearchBar
│   │   ├── EditModeToggle
│   │   ├── ProjectTree
│   │   │   └── ProjectNode (recursive)
│   │   │       ├── CollapseButton
│   │   │       ├── Checkbox (edit mode)
│   │   │       ├── ProjectName
│   │   │       └── ActionButtons
│   │   ├── AddProjectModal
│   │   └── BulkActionsBar
│   │
│   ├── Page: Employees (Сотрудники)
│   │   ├── SearchBar
│   │   ├── EditModeToggle
│   │   ├── DepartmentTree
│   │   │   └── DepartmentNode
│   │   │       ├── DepartmentHeader
│   │   │       └── EmployeeList
│   │   │           └── EmployeeCard
│   │   ├── AddDepartmentModal
│   │   ├── AddEmployeeModal
│   │   └── BulkActionsBar
│   │
│   ├── Page: Analytics (Аналитика)
│   │   ├── FilterPanel
│   │   │   ├── DateRangePicker
│   │   │   ├── MultiSelect (departments)
│   │   │   ├── MultiSelect (employees)
│   │   │   └── MultiSelect (projects)
│   │   ├── StatsCards
│   │   │   ├── StatCard (total tasks)
│   │   │   ├── StatCard (avg completion)
│   │   │   └── StatCard (by status)
│   │   └── DataTable
│   │       ├── TableHeader (sortable)
│   │       └── TableRow[]
│   │
│   └── Page: TasksList (Список задач)
│       ├── SearchBar
│       ├── TaskList
│       │   └── TaskItem (collapsible)
│       │       ├── TaskHeader
│       │       ├── TaskDetails
│       │       ├── StatusDropdown
│       │       └── ActionButtons
│       ├── ConfirmDeleteModal
│       └── BulkActionsBar
│
├── BottomNavigation
│   └── NavItem[] (5 items)
│
├── NotificationSettingsModal
│   ├── ToggleSwitch (email enabled)
│   ├── ToggleSwitch (telegram enabled)
│   ├── ToggleSwitch (notify on assign)
│   ├── ToggleSwitch (notify on deadline)
│   ├── TimePicker (reminder time)
│   └── TimeRangePicker (quiet hours)
│
└── GlobalComponents
    ├── Modal
    ├── Toast
    ├── Loader
    ├── ConfirmDialog
    └── ToggleSwitch
```

### Переиспользуемые компоненты

| Компонент       | Файл          | Использование               |
| --------------- | ------------- | --------------------------- |
| `TreeNode`      | components.js | Проекты, выбор проектов     |
| `Checkbox`      | components.js | Везде                       |
| `Modal`         | components.js | Все модальные окна          |
| `SearchBar`     | components.js | Проекты, Сотрудники, Задачи |
| `DatePicker`    | components.js | Постановка задач, Аналитика |
| `MultiSelect`   | components.js | Все фильтры                 |
| `Button`        | components.js | Везде                       |
| `Input`         | components.js | Все формы                   |
| `Toast`         | components.js | Уведомления                 |
| `Loader`        | components.js | Загрузка                    |
| `ConfirmDialog` | components.js | Удаление                    |
| `Badge`         | components.js | Статусы                     |
| `Card`          | components.js | Контейнеры                  |
| `ToggleSwitch`  | components.js | Настройки уведомлений       |
| `TimePicker`    | components.js | Выбор времени напоминаний   |

---

## 🗃️ State Management Стратегия

### Глобальное состояние (AppState)

```javascript
const AppState = {
  // ===== NAVIGATION =====
  currentPage: 'tasks', // 'tasks' | 'projects' | 'employees' | 'analytics' | 'tasks-list'
  previousPage: null,

  // ===== TELEGRAM USER (из WebApp.initDataUnsafe.user) =====
  telegramUser: {
    id: null, // Telegram user_id (number)
    first_name: '', // Имя пользователя
    last_name: '', // Фамилия (опционально)
    username: '', // @username (опционально)
    language_code: 'ru', // Язык пользователя
    is_premium: false, // Premium подписка
    photo_url: '', // URL аватара (опционально)
  },

  // ===== APP USER (админ из whitelist) =====
  currentUser: {
    telegramId: null, // Telegram user_id
    name: '', // Имя из whitelist
  },
  // Все пользователи из whitelist = ПОЛНЫЙ ДОСТУП (без ролей)

  // ===== АВТОРИЗАЦИЯ =====
  isAuthenticated: false, // Успешно ли прошла авторизация
  accessDeniedReason: null, // 'not_telegram' | 'no_user_data' | 'not_in_whitelist'

  // ===== WHITELIST АДМИНИСТРАТОРОВ (mock, потом с бэкенда) =====
  allowedAdmins: [
    { telegramId: 123456789, name: 'Иван Директоров' },
    { telegramId: 987654321, name: 'Пётр Руководителев' },
  ],

  // ===== PAGE 1: ПОСТАНОВКА ЗАДАЧ =====
  taskForm: {
    selectedProjects: [], // [projectId, ...]
    selectedEmployees: [], // [employeeId, ...]
    scheduledDate: '', // 'YYYY-MM-DD'
    scheduledTime: '', // 'HH:MM'
    title: '',
    description: '',
    priority: 'normal', // 'low' | 'normal' | 'high' | 'urgent'
    editingTaskId: null, // null = new, id = editing
  },
  showTaskPreview: false,

  // ===== PAGE 2: ПРОЕКТЫ =====
  projects: [], // Project[]
  projectsEditMode: false,
  selectedProjectsForDelete: [],
  projectSearchQuery: '',
  expandedProjects: [], // [projectId, ...]
  showAddProjectModal: false,
  editingProject: null,

  // ===== PAGE 3: СОТРУДНИКИ =====
  departments: [], // Department[]
  employees: [], // Employee[]
  employeesEditMode: false,
  selectedEmployeesForDelete: [],
  selectedDepartmentsForDelete: [],
  employeeSearchQuery: '',
  expandedDepartments: [], // [departmentId, ...]
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
  tasks: [], // Task[]
  tasksSearchQuery: '',
  tasksFilter: {
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  selectedTasksForDelete: [],
  expandedTasks: [], // [taskId, ...]
  showDeleteConfirmModal: false,
  taskToDelete: null,

  // ===== УВЕДОМЛЕНИЯ (для текущего пользователя) =====
  notificationSettings: {
    emailEnabled: true,
    telegramEnabled: true,
    notifyOnAssign: true,
    notifyOnStatusChange: true,
    notifyOnDeadline: true,
    reminderTime: '09:00',
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  },
  showNotificationSettings: false, // Модалка настроек

  // ===== НАПОМИНАНИЯ (лог) =====
  reminders: [], // Reminder[] — история отправленных

  // ===== GLOBAL UI =====
  theme: 'auto', // 'light' | 'dark' | 'auto'
  loading: false,
  error: null,
  toast: {
    show: false,
    message: '',
    type: 'info', // 'success' | 'error' | 'warning' | 'info'
  },
};
```

### Паттерн обновления состояния

```javascript
// Обновление состояния
function setState(path, value) {
  const keys = path.split('.');
  let obj = AppState;

  for (let i = 0; i < keys.length - 1; i++) {
    obj = obj[keys[i]];
  }

  obj[keys[keys.length - 1]] = value;

  // Trigger re-render
  renderCurrentPage();
}

// Получение состояния
function getState(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], AppState);
}

// Подписка на изменения (опционально)
const subscribers = new Map();

function subscribe(path, callback) {
  if (!subscribers.has(path)) {
    subscribers.set(path, []);
  }
  subscribers.get(path).push(callback);
}
```

---

## 🎨 Дизайн Система

### Цветовая палитра

```css
:root {
  /* === PRIMARY === */
  --color-primary: #2180ce;
  --color-primary-hover: #1a6bb5;
  --color-primary-light: #e8f4fc;
  --color-primary-dark: #145a8c;

  /* === SECONDARY === */
  --color-secondary: #6c757d;
  --color-secondary-hover: #5a6268;

  /* === SEMANTIC === */
  --color-success: #31a24c;
  --color-success-light: #e8f5eb;
  --color-warning: #f0ad4e;
  --color-warning-light: #fef8e8;
  --color-error: #d33f49;
  --color-error-light: #fce8ea;
  --color-info: #17a2b8;
  --color-info-light: #e8f6f8;

  /* === TEXT === */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-text-muted: #999999;
  --color-text-inverse: #ffffff;

  /* === BACKGROUND === */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-bg-tertiary: #e9ecef;
  --color-bg-hover: #f0f0f0;

  /* === BORDER === */
  --color-border: #e0e0e0;
  --color-border-focus: #2180ce;
  --color-border-error: #d33f49;

  /* === PRIORITY COLORS === */
  --color-priority-low: #6c757d;
  --color-priority-normal: #2180ce;
  --color-priority-high: #f0ad4e;
  --color-priority-urgent: #d33f49;

  /* === STATUS COLORS === */
  --color-status-new: #17a2b8;
  --color-status-progress: #f0ad4e;
  --color-status-completed: #31a24c;
  --color-status-cancelled: #6c757d;
}

/* === DARK THEME === */
[data-theme='dark'] {
  --color-primary: #3a9be8;
  --color-primary-hover: #2180ce;
  --color-primary-light: #1e3a4d;

  --color-text-primary: #ffffff;
  --color-text-secondary: #b0b0b0;
  --color-text-muted: #808080;

  --color-bg-primary: #1a1a1a;
  --color-bg-secondary: #242424;
  --color-bg-tertiary: #2d2d2d;
  --color-bg-hover: #333333;

  --color-border: #404040;
}
```

### Типография

```css
:root {
  /* === FONT FAMILY === */
  --font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
  --font-family-mono: 'SF Mono', 'Consolas', 'Monaco', monospace;

  /* === FONT SIZE === */
  --font-size-xs: 11px;
  --font-size-sm: 13px;
  --font-size-base: 14px;
  --font-size-md: 15px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 20px;
  --font-size-3xl: 24px;

  /* === FONT WEIGHT === */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* === LINE HEIGHT === */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* === LETTER SPACING === */
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
}
```

### Spacing System (8px base)

```css
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}
```

### Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-toast: 600;
  --z-tooltip: 700;
}
```

### Transitions

```css
:root {
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
  --transition-bounce: 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

---

## 📁 Структура Файлов

```
telegram-mini-app/
│
├── index.html                    # Единственный HTML файл
│
├── css/
│   ├── design-system.css         # CSS переменные, reset, base
│   ├── components.css            # Стили компонентов
│   ├── pages.css                 # Стили для каждой страницы
│   ├── theme.css                 # Light/Dark mode
│   └── animations.css            # Все анимации и transitions
│
├── js/
│   ├── main.js                   # Entry point, инициализация, роутинг
│   ├── telegram.js               # Telegram WebApp SDK, авторизация
│   ├── state.js                  # AppState, setState, getState
│   ├── components.js             # Переиспользуемые UI компоненты
│   │
│   ├── pages/
│   │   ├── tasks.js              # Страница 1: Постановка задач
│   │   ├── projects.js           # Страница 2: Проекты CRUD
│   │   ├── employees.js          # Страница 3: Сотрудники CRUD
│   │   ├── analytics.js          # Страница 4: Аналитика
│   │   └── tasksList.js          # Страница 5: Список задач
│   │
│   ├── utils/
│   │   ├── mock-data.js          # Поддельные данные (проекты, сотрудники, задачи)
│   │   ├── mock-admins.js        # Whitelist администраторов (Telegram IDs)
│   │   ├── tree-builder.js       # Построение деревьев
│   │   ├── validators.js         # Валидация форм
│   │   └── helpers.js            # Вспомогательные функции
│   │
│   └── api.js                    # API заглушка (для будущего бэкенда)
│
├── assets/
│   └── icons/
│       ├── nav-tasks.svg
│       ├── nav-projects.svg
│       ├── nav-employees.svg
│       ├── nav-analytics.svg
│       ├── nav-list.svg
│       ├── chevron-down.svg
│       ├── chevron-right.svg
│       ├── check.svg
│       ├── plus.svg
│       ├── edit.svg
│       ├── trash.svg
│       ├── search.svg
│       ├── calendar.svg
│       ├── clock.svg
│       ├── close.svg
│       └── menu.svg
│
└── PROJECT_PLAN.md               # Этот документ
```

---

## 📊 Data Models

### Project (Проект)

```javascript
{
  id: number,                    // Уникальный ID
  parentId: number | null,       // ID родителя (null = корневой)
  name: string,                  // Название проекта
  description: string,           // Описание
  color: string,                 // HEX цвет для визуализации
  createdAt: string,             // ISO date
  updatedAt: string,             // ISO date
  order: number                  // Порядок сортировки
}

// Пример
{
  id: 1,
  parentId: null,
  name: "ООО Рога и Копыта",
  description: "Главный клиент",
  color: "#2180ce",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  order: 1
}
```

### Department (Отдел)

```javascript
{
  id: number,
  name: string,
  description: string,
  managerId: number | null,      // ID руководителя отдела
  createdAt: string,
  updatedAt: string,
  order: number
}

// Пример
{
  id: 1,
  name: "Отдел разработки",
  description: "Backend и Frontend разработка",
  managerId: 2,
  createdAt: "2024-01-10T10:00:00Z",
  updatedAt: "2024-01-10T10:00:00Z",
  order: 1
}
```

### Employee (Сотрудник — получатель задач через Email)

```javascript
{
  id: number,
  departmentId: number,          // ID отдела
  firstName: string,
  lastName: string,
  email: string,                 // Уникальный — НА НЕГО ПРИХОДЯТ ПИСЬМА!
  phone: string,
  position: string,              // Должность
  avatar: string | null,         // URL аватара
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}

// Пример
{
  id: 1,
  departmentId: 1,
  firstName: "Иван",
  lastName: "Петров",
  email: "ivan.petrov@company.ru",  // Сюда придёт email с задачей
  phone: "+7 (999) 123-45-67",
  position: "Senior Developer",
  avatar: null,
  isActive: true,
  createdAt: "2024-01-10T10:00:00Z",
  updatedAt: "2024-01-10T10:00:00Z"
}
```

> **⚠️ Сотрудники НЕ используют Mini App!**  
> Сотрудники получают задачи через Email → в письме ссылка на web-страницу для отметки выполнения (реализуем позже)

### Admin (Администратор — пользователь Mini App)

```javascript
{
  id: number,
  telegramId: number,            // Telegram user_id (ОБЯЗАТЕЛЬНЫЙ!)
  name: string,                  // Имя администратора
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}

// Пример
{
  id: 1,
  telegramId: 123456789,
  name: "Директор Иванов",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}

// ВСЕ администраторы имеют ПОЛНЫЙ ДОСТУП:
// ✅ Создание и управление задачами
// ✅ Управление проектами
// ✅ Управление сотрудниками
// ✅ Просмотр аналитики
// ✅ Управление списком админов
```

> **Доступ к Mini App:** Telegram ID должен быть в таблице `admins`. Если нет — экран "Доступ запрещён".

### Task (Задача)

```javascript
{
  id: number,
  title: string,
  description: string,
  projectIds: number[],          // Массив ID проектов
  assigneeIds: number[],         // Массив ID исполнителей
  creatorId: number,             // ID создателя
  scheduledDate: string,         // 'YYYY-MM-DD'
  scheduledTime: string,         // 'HH:MM'
  status: string,                // 'new' | 'in_progress' | 'completed' | 'cancelled'
  priority: string,              // 'low' | 'normal' | 'high' | 'urgent'
  completedAt: string | null,    // ISO date когда завершена

  // === НАПОМИНАНИЯ ===
  remindersEnabled: boolean,     // Включены ли напоминания
  lastReminderSent: string|null, // ISO date последнего напоминания
  nextReminderDate: string|null, // ISO date следующего напоминания

  createdAt: string,
  updatedAt: string
}

// Пример
{
  id: 1,
  title: "Разработать новый модуль авторизации",
  description: "Необходимо внедрить OAuth 2.0 для мобильного приложения",
  projectIds: [1, 3],
  assigneeIds: [1, 2, 3],
  creatorId: 1,
  scheduledDate: "2024-02-01",
  scheduledTime: "14:00",
  status: "in_progress",
  priority: "high",
  completedAt: null,
  remindersEnabled: true,
  lastReminderSent: "2024-01-28T09:00:00Z",
  nextReminderDate: "2024-01-29T09:00:00Z",
  createdAt: "2024-01-20T10:00:00Z",
  updatedAt: "2024-01-25T15:30:00Z"
}
```

### Reminder (Напоминание) — лог отправленных

```javascript
{
  id: number,
  taskId: number,                // ID задачи
  employeeId: number,            // Кому отправлено
  type: string,                  // 'email' | 'telegram' | 'both'
  status: string,                // 'pending' | 'sent' | 'failed'
  sentAt: string | null,         // Когда отправлено
  errorMessage: string | null,   // Ошибка если failed
  createdAt: string
}

// Пример
{
  id: 1,
  taskId: 1,
  employeeId: 2,
  type: "email",
  status: "sent",
  sentAt: "2024-01-28T09:00:05Z",
  errorMessage: null,
  createdAt: "2024-01-28T09:00:00Z"
}
```

### NotificationSettings (Настройки уведомлений пользователя)

```javascript
{
  employeeId: number,            // ID сотрудника

  // Каналы уведомлений
  emailEnabled: boolean,         // Email уведомления
  telegramEnabled: boolean,      // Telegram уведомления

  // Типы уведомлений
  notifyOnAssign: boolean,       // При назначении задачи
  notifyOnStatusChange: boolean, // При изменении статуса
  notifyOnDeadline: boolean,     // Напоминания о дедлайне
  notifyOnComment: boolean,      // При комментариях (будущее)

  // Время отправки напоминаний
  reminderTime: string,          // 'HH:MM' — во сколько отправлять
  quietHoursStart: string,       // 'HH:MM' — начало тихих часов
  quietHoursEnd: string,         // 'HH:MM' — конец тихих часов

  updatedAt: string
}

// Пример
{
  employeeId: 1,
  emailEnabled: true,
  telegramEnabled: true,
  notifyOnAssign: true,
  notifyOnStatusChange: true,
  notifyOnDeadline: true,
  notifyOnComment: false,
  reminderTime: "09:00",
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  updatedAt: "2024-01-15T10:00:00Z"
}
```

### EmailSettings (Настройки SMTP — для бэкенда)

```javascript
{
  // SMTP сервер
  smtpHost: string,              // 'smtp.gmail.com'
  smtpPort: number,              // 587
  smtpSecure: boolean,           // true для SSL

  // Авторизация
  smtpUser: string,              // 'your-email@gmail.com'
  smtpPassword: string,          // App password

  // Отправитель
  fromName: string,              // 'Task Manager'
  fromEmail: string,             // 'noreply@taskmanager.ru'

  // Шаблоны (опционально)
  templateTaskAssigned: string,
  templateReminder: string,
  templateStatusChanged: string
}

// Пример (Gmail)
{
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: "company.tasks@gmail.com",
  smtpPassword: "xxxx xxxx xxxx xxxx", // App Password
  fromName: "Task Manager",
  fromEmail: "company.tasks@gmail.com",
  templateTaskAssigned: "...",
  templateReminder: "...",
  templateStatusChanged: "..."
}
```

### Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         МОДЕЛЬ ДОСТУПА                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  👔 АДМИНИСТРАТОРЫ (Mini App)            👷 СОТРУДНИКИ (Email)      │
│  (ПОЛНЫЙ ДОСТУП, без ролей)                                         │
│                                                                     │
│  ┌─────────────────┐                     ┌─────────────────┐        │
│  │  Telegram User  │                     │    Employee     │        │
│  ├─────────────────┤                     ├─────────────────┤        │
│  │ id (user_id)    │──┐                  │ id              │        │
│  │ first_name      │  │                  │ departmentId    │        │
│  └─────────────────┘  │                  │ firstName       │        │
│                       │ 1:1              │ lastName        │        │
│                       ▼                  │ email ──────────┼───► 📧 │
│               ┌─────────────────┐        └────────┬────────┘        │
│               │      Admin      │                 │                 │
│               ├─────────────────┤                 │ (получает       │
│               │ id              │                 │  задачи по      │
│               │ telegramId ◄────┼── whitelist     │  email)         │
│               │ name            │                 │                 │
│               └────────┬────────┘                 ▼                 │
│                        │                 ┌─────────────────┐        │
│                        │ создаёт         │ Email со ссылкой│        │
│                        ▼                 │ на web-страницу │        │
│               ┌─────────────────┐        │ (отметка задачи)│        │
│               │      Task       │        └─────────────────┘        │
│               ├─────────────────┤                                   │
│               │ id              │                                   │
│               │ title           │                                   │
│               │ assigneeIds[] ──┼──────────────► Employee[]         │
│               │ creatorId ──────┼──────────────► Admin              │
│               │ projectIds[]    │                                   │
│               └─────────────────┘                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Проверка доступа:
Telegram User.id ──► Manager.telegramId ? ✅ Доступ : ❌ "Доступ запрещён"

Уведомления сотрудникам:
Task.assigneeIds[] ──► Employee.email ──► Email с напоминанием
```

### Детальная схема данных

```
┌─────────────────┐     ┌─────────────────┐
│    Department   │     │     Project     │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ name            │     │ parentId ──────►│ (self-reference)
│ managerId ──────┼──┐  │ name            │
└────────┬────────┘  │  └────────┬────────┘
         │           │           │
         │ 1:N       │           │ N:M
         ▼           │           ▼
┌─────────────────┐  │  ┌─────────────────┐     ┌─────────────────┐
│    Employee     │  │  │      Task       │     │    Reminder     │
├─────────────────┤  │  ├─────────────────┤     ├─────────────────┤
│ id              │◄─┘  │ id              │◄────│ taskId          │
│ departmentId    │     │ title           │     │ employeeId ─────┼──┐
│ firstName       │◄────┤ assigneeIds[]   │     │ type (email)    │  │
│ lastName        │     │ projectIds[] ───┼──►  │ status          │  │
│ email 📧        │     │ creatorId ──────┼──►  │ sentAt          │  │
└────────┬────────┘     │ status          │     └─────────────────┘  │
         │              └────────┬────────┘                          │
         │                       │                                   │
         │ 1:1                   │ создано                           │
         ▼                       ▼                                   │
┌─────────────────────┐  ┌─────────────────┐                         │
│NotificationSettings │  │      Admin      │                         │
├─────────────────────┤  ├─────────────────┤                         │
│ employeeId ◄────────┼──│ id              │                         │
│ emailEnabled        │  │ telegramId      │◄── Telegram User.id     │
│ reminderTime        │  │ name            │    (whitelist check)    │
│ quietHoursStart/End │  └─────────────────┘                         │
└─────────────────────┘  ПОЛНЫЙ ДОСТУП (без ролей)                   │
         ▲                                                           │
         └───────────────────────────────────────────────────────────┘
```

---

## 🔔 Система Напоминаний и Email Уведомлений

### Логика напоминаний

```
┌─────────────────────────────────────────────────────────────┐
│                    АЛГОРИТМ НАПОМИНАНИЙ                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Задача создана                                             │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────┐                   │
│  │ Вычислить дни до дедлайна           │                   │
│  │ daysLeft = scheduledDate - today    │                   │
│  └─────────────────────────────────────┘                   │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────┐                   │
│  │ daysLeft <= 7 дней?                 │                   │
│  └─────────────────────────────────────┘                   │
│       │              │                                      │
│      ДА             НЕТ                                     │
│       │              │                                      │
│       ▼              ▼                                      │
│  ┌──────────┐  ┌──────────────┐                            │
│  │ ЕЖЕДНЕВНО│  │ ЕЖЕНЕДЕЛЬНО  │                            │
│  │ 09:00    │  │ Понедельник  │                            │
│  └──────────┘  │ 09:00        │                            │
│                └──────────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Правила напоминаний

| Дней до дедлайна | Частота              | Время отправки                        |
| ---------------- | -------------------- | ------------------------------------- |
| ≤ 7 дней         | **Ежедневно**        | В `reminderTime` (по умолчанию 09:00) |
| > 7 дней         | **Еженедельно** (Пн) | В `reminderTime` (по умолчанию 09:00) |
| = 0 (сегодня)    | **Утром + за 1 час** | 09:00 и за час до `scheduledTime`     |
| Просрочено       | **Ежедневно**        | С пометкой "ПРОСРОЧЕНО"               |

### Расчёт следующего напоминания (JavaScript)

```javascript
function calculateNextReminder(task) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(task.scheduledDate);
  deadline.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

  // Задача завершена или отменена — не напоминаем
  if (task.status === 'completed' || task.status === 'cancelled') {
    return null;
  }

  const reminderTime = AppState.notificationSettings?.reminderTime || '09:00';
  const [hours, minutes] = reminderTime.split(':').map(Number);

  let nextReminder = new Date();
  nextReminder.setHours(hours, minutes, 0, 0);

  // Если уже прошло время напоминания сегодня
  if (nextReminder <= new Date()) {
    nextReminder.setDate(nextReminder.getDate() + 1);
  }

  if (daysLeft <= 7) {
    // Ежедневно — следующее напоминание завтра (или сегодня если не прошло)
    return nextReminder.toISOString();
  } else {
    // Еженедельно — следующий понедельник
    const daysUntilMonday = (8 - nextReminder.getDay()) % 7 || 7;
    nextReminder.setDate(nextReminder.getDate() + daysUntilMonday);
    return nextReminder.toISOString();
  }
}
```

### Каналы уведомлений

```
┌─────────────────────────────────────────────────────────────┐
│                     КАНАЛЫ ОТПРАВКИ                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │    EMAIL     │      │   TELEGRAM   │                    │
│  ├──────────────┤      ├──────────────┤                    │
│  │ ✉️ SMTP      │      │ 🤖 Bot API   │                    │
│  │              │      │              │                    │
│  │ - Подробное  │      │ - Короткое   │                    │
│  │   письмо     │      │   сообщение  │                    │
│  │ - HTML       │      │ - Markdown   │                    │
│  │   шаблон     │      │ - Кнопки     │                    │
│  │ - Вложения   │      │ - Inline     │                    │
│  └──────────────┘      └──────────────┘                    │
│         │                     │                             │
│         └─────────┬───────────┘                             │
│                   ▼                                         │
│          ┌──────────────┐                                   │
│          │   Employee   │                                   │
│          │  (получатель)│                                   │
│          └──────────────┘                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Типы уведомлений

| Событие                | Email | Telegram | Описание                       |
| ---------------------- | ----- | -------- | ------------------------------ |
| Назначение задачи      | ✅    | ✅       | Вам назначена новая задача     |
| Напоминание о дедлайне | ✅    | ✅       | Срок задачи через X дней       |
| Задача просрочена      | ✅    | ✅       | Срок задачи истёк              |
| Изменение статуса      | ⚙️    | ✅       | Статус задачи изменён на...    |
| Задача завершена       | ✅    | ✅       | Создатель получает уведомление |

### Email шаблон напоминания

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      .container {
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
      }
      .header {
        background: #2180ce;
        color: white;
        padding: 20px;
      }
      .content {
        padding: 20px;
      }
      .task-card {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px;
        margin: 16px 0;
      }
      .deadline {
        color: #d33f49;
        font-weight: bold;
      }
      .btn {
        background: #2180ce;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>⏰ Напоминание о задаче</h1>
      </div>
      <div class="content">
        <p>Здравствуйте, {{employeeName}}!</p>

        <p>Напоминаем о задаче, срок которой {{#if isOverdue}}истёк{{else}}приближается{{/if}}:</p>

        <div class="task-card">
          <h2>{{taskTitle}}</h2>
          <p>{{taskDescription}}</p>
          <p><strong>Проект:</strong> {{projectName}}</p>
          <p class="deadline">
            <strong>Срок:</strong> {{scheduledDate}} {{scheduledTime}} {{#if isOverdue}}(ПРОСРОЧЕНО
            на {{daysOverdue}} дн.){{else}}(осталось {{daysLeft}} дн.){{/if}}
          </p>
        </div>

        <p><a href="{{appUrl}}" class="btn">Открыть задачу</a></p>
      </div>
    </div>
  </body>
</html>
```

### Telegram сообщение напоминания

```
⏰ *Напоминание о задаче*

📋 *{{taskTitle}}*
📁 Проект: {{projectName}}
📅 Срок: {{scheduledDate}} {{scheduledTime}}
{{#if isOverdue}}
🔴 *ПРОСРОЧЕНО* на {{daysOverdue}} дн.
{{else}}
⏳ Осталось: {{daysLeft}} дн.
{{/if}}

[Открыть задачу]({{appUrl}})
```

### Cron Job для напоминаний (Бэкенд)

```javascript
// Запуск каждый час
// 0 * * * *

async function processReminders() {
  const now = new Date();

  // 1. Найти задачи, которым пора отправить напоминание
  const tasks = await db.tasks.findMany({
    where: {
      status: { in: ['new', 'in_progress'] },
      remindersEnabled: true,
      nextReminderDate: { lte: now },
    },
    include: {
      assignees: {
        include: { notificationSettings: true },
      },
    },
  });

  for (const task of tasks) {
    for (const assignee of task.assignees) {
      const settings = assignee.notificationSettings;

      // Проверка тихих часов
      if (isQuietHours(now, settings)) continue;

      // Отправка email
      if (settings.emailEnabled && settings.notifyOnDeadline) {
        await sendEmailReminder(task, assignee);
      }

      // Отправка Telegram
      if (settings.telegramEnabled && settings.notifyOnDeadline && assignee.telegramId) {
        await sendTelegramReminder(task, assignee);
      }

      // Логирование
      await db.reminders.create({
        taskId: task.id,
        employeeId: assignee.id,
        type: getNotificationType(settings),
        status: 'sent',
        sentAt: now,
      });
    }

    // Обновить nextReminderDate
    await db.tasks.update({
      where: { id: task.id },
      data: {
        lastReminderSent: now,
        nextReminderDate: calculateNextReminder(task),
      },
    });
  }
}

function isQuietHours(now, settings) {
  if (!settings.quietHoursStart || !settings.quietHoursEnd) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
  const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);

  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  if (start <= end) {
    return currentMinutes >= start && currentMinutes < end;
  } else {
    // Переход через полночь (22:00 - 08:00)
    return currentMinutes >= start || currentMinutes < end;
  }
}
```

### SMTP настройка (популярные провайдеры)

| Провайдер | SMTP Host           | Port       | Secure | Примечание                  |
| --------- | ------------------- | ---------- | ------ | --------------------------- |
| Gmail     | smtp.gmail.com      | 587        | TLS    | Требуется App Password      |
| Yandex    | smtp.yandex.ru      | 465        | SSL    | Разрешить SMTP в настройках |
| Mail.ru   | smtp.mail.ru        | 465        | SSL    | Пароль приложения           |
| Outlook   | smtp.office365.com  | 587        | TLS    |                             |
| Custom    | your-smtp.domain.ru | 25/465/587 | -      |                             |

---

## 📅 Timeline Реализации

### День 1: Основа

| Время | Задача                   | Файлы             |
| ----- | ------------------------ | ----------------- |
| 2ч    | Создание PROJECT_PLAN.md | PROJECT_PLAN.md   |
| 2ч    | Design System CSS        | design-system.css |
| 1ч    | Base HTML структура      | index.html        |
| 1ч    | Animations CSS           | animations.css    |

**Результат:** Базовая структура проекта, CSS переменные, пустая страница

### День 2: Инфраструктура

| Время | Задача              | Файлы                         |
| ----- | ------------------- | ----------------------------- |
| 2ч    | State management    | state.js                      |
| 3ч    | UI компоненты       | components.js, components.css |
| 2ч    | Mock данные         | mock-data.js                  |
| 1ч    | Роутинг и навигация | main.js                       |

**Результат:** Работающий SPA с навигацией, компоненты готовы

### День 3: Страницы 1-2

| Время | Задача                       | Файлы                     |
| ----- | ---------------------------- | ------------------------- |
| 4ч    | Страница 1: Постановка задач | pages/tasks.js, pages.css |
| 4ч    | Страница 2: Проекты          | pages/projects.js         |

**Результат:** Полнофункциональные страницы создания задач и управления проектами

### День 4: Страницы 3 и 5

| Время | Задача                   | Файлы              |
| ----- | ------------------------ | ------------------ |
| 4ч    | Страница 3: Сотрудники   | pages/employees.js |
| 4ч    | Страница 5: Список задач | pages/tasksList.js |

**Результат:** CRUD для сотрудников, просмотр и управление задачами

### День 5: Страница 4 + Полировка

| Время | Задача                       | Файлы              |
| ----- | ---------------------------- | ------------------ |
| 3ч    | Страница 4: Аналитика        | pages/analytics.js |
| 2ч    | Theme switching (dark/light) | theme.css          |
| 2ч    | Анимации и transitions       | animations.css     |
| 1ч    | Тестирование и баг-фиксы     | all                |

**Результат:** Готовый фронтенд со всеми 5 страницами

---

## ✅ Definition of Done

### Общие требования

- [ ] Все 5 страниц полностью функциональны
- [ ] Навигация работает через hash routing
- [ ] Все данные хранятся в памяти (AppState)
- [ ] Нет fetch запросов и localStorage
- [ ] Нет ошибок в консоли браузера

### Авторизация Telegram (только администраторы)

- [ ] Данные пользователя получаются из `initDataUnsafe.user`
- [ ] Проверка Telegram ID по whitelist
- [ ] Экран "Доступ запрещён" если ID не в списке
- [ ] Отображается имя администратора
- [ ] Mock whitelist для разработки
- [ ] Полный доступ ко всем функциям (без ролей)
- [ ] Кнопка "Закрыть" на экране запрета

### UI/UX

- [ ] Responsive дизайн (320px - 428px)
- [ ] Touch-friendly (min 44px touch targets)
- [ ] Smooth transitions (60fps)
- [ ] Dark/Light theme работает
- [ ] Telegram WebApp SDK интегрирован

### Функциональность по страницам

#### Страница 1: Постановка задач

- [ ] Иерархический выбор проектов (дерево с чекбоксами)
- [ ] Выбор сотрудников по отделам с "Выбрать всех"
- [ ] Date и Time pickers работают
- [ ] Валидация обязательных полей
- [ ] Preview модальное окно
- [ ] Кнопка очистки формы
- [ ] Сохранение создаёт задачу в state

#### Страница 2: Проекты

- [ ] Древовидное отображение проектов
- [ ] Collapse/Expand работает
- [ ] Поиск фильтрует проекты
- [ ] Edit mode включает чекбоксы
- [ ] CRUD: создание, редактирование, удаление
- [ ] Bulk delete работает

#### Страница 3: Сотрудники

- [ ] Отделы с вложенными сотрудниками
- [ ] Поиск по имени/email
- [ ] Edit mode для bulk операций
- [ ] CRUD для отделов
- [ ] CRUD для сотрудников
- [ ] Валидация email (уникальность)

#### Страница 4: Аналитика

- [ ] Фильтры по датам
- [ ] Мультиселект отделов/сотрудников/проектов
- [ ] Статистика отображается корректно
- [ ] Таблицы с сортировкой
- [ ] Данные пересчитываются при изменении фильтров

#### Страница 5: Список задач

- [ ] Collapsible список задач
- [ ] Поиск работает
- [ ] Фильтр по статусу
- [ ] Статус меняется через dropdown
- [ ] Edit редирект на страницу 1 с данными
- [ ] Delete с подтверждением
- [ ] Bulk select и delete

#### Настройки уведомлений (модальное окно)

- [ ] Toggle Email уведомлений
- [ ] Toggle Telegram уведомлений
- [ ] Toggle уведомлений при назначении
- [ ] Toggle напоминаний о дедлайне
- [ ] Выбор времени напоминаний
- [ ] Настройка тихих часов
- [ ] Сохранение настроек

#### Система напоминаний (подготовка к бэкенду)

- [ ] UI отображает дни до дедлайна
- [ ] Визуальная индикация просроченных задач
- [ ] Mock напоминания в state
- [ ] Расчёт nextReminderDate работает

---

## 🔧 Технические Заметки

### 🔐 Авторизация через Telegram (ТОЛЬКО для руководителей)

**Принцип:**

- Приложение работает ТОЛЬКО внутри Telegram Mini App
- Доступ ТОЛЬКО для руководителей из whitelist
- Если Telegram ID не в списке → экран "Доступ запрещён"
- Сотрудники получают задачи через Email (не через Mini App)

#### Whitelist разрешённых администраторов

```javascript
// Список Telegram ID с доступом к приложению
// В реальном приложении — загружается с бэкенда
const ALLOWED_ADMINS = [
  { telegramId: 123456789, name: 'Иван Директоров' },
  { telegramId: 987654321, name: 'Пётр Руководителев' },
  // Добавляйте администраторов сюда
];

// Все пользователи из списка имеют ПОЛНЫЙ ДОСТУП:
// ✅ Создание задач
// ✅ Управление проектами
// ✅ Управление сотрудниками
// ✅ Аналитика
// ✅ Управление списком админов
```

#### Данные пользователя из Telegram WebApp

```javascript
// Telegram предоставляет данные пользователя автоматически
window.Telegram.WebApp.initDataUnsafe.user = {
  id: 123456789, // Уникальный Telegram user_id
  first_name: 'Иван',
  last_name: 'Петров', // Может быть undefined
  username: 'ivan_petrov', // Может быть undefined
  language_code: 'ru',
  is_premium: true, // Может быть undefined
  photo_url: 'https://...', // Может быть undefined
};
```

#### Процесс авторизации (Frontend)

```javascript
function initTelegramAuth() {
  const tg = window.Telegram?.WebApp;

  // 1. Проверяем, что запущено в Telegram
  if (!tg) {
    showAccessDeniedScreen('not_telegram');
    return false;
  }

  const user = tg.initDataUnsafe?.user;

  // 2. Проверяем, что есть данные пользователя
  if (!user || !user.id) {
    showAccessDeniedScreen('no_user_data');
    return false;
  }

  // 3. ГЛАВНАЯ ПРОВЕРКА: есть ли пользователь в whitelist
  const admin = ALLOWED_ADMINS.find((a) => a.telegramId === user.id);

  if (!admin) {
    // ❌ ДОСТУП ЗАПРЕЩЁН — ID не в списке
    showAccessDeniedScreen('not_in_whitelist', user);
    return false;
  }

  // ✅ Пользователь в whitelist — ПОЛНЫЙ ДОСТУП

  // Сохраняем данные Telegram пользователя
  setState('telegramUser', {
    id: user.id,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    username: user.username || '',
    language_code: user.language_code || 'ru',
    is_premium: user.is_premium || false,
    photo_url: user.photo_url || '',
  });

  // Все админы имеют полный доступ
  setState('currentUser', {
    telegramId: user.id,
    name: admin.name,
  });

  setState('isAuthenticated', true);
  return true;
}
```

#### Экран "Доступ запрещён"

```javascript
function showAccessDeniedScreen(reason, user = null) {
  setState('isAuthenticated', false);
  setState('accessDeniedReason', reason);

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
      text: `Ваш аккаунт (ID: ${user?.id}) не имеет доступа к этому приложению.\n\nОбратитесь к администратору.`,
      icon: '🔒',
    },
  };

  renderAccessDeniedPage(messages[reason]);
}

function renderAccessDeniedPage(config) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="access-denied">
      <div class="access-denied__icon">${config.icon}</div>
      <h1 class="access-denied__title">${config.title}</h1>
      <p class="access-denied__text">${config.text}</p>
      <button class="btn btn--secondary" onclick="window.Telegram?.WebApp?.close()">
        Закрыть
      </button>
    </div>
  `;
}
```

#### Валидация initData (для будущего бэкенда)

```javascript
// initData содержит подписанные данные для проверки на сервере
const initData = window.Telegram.WebApp.initData;

// Формат: query string с hash подписью
// "user={...}&auth_date=1234567890&hash=abc123..."

// На бэкенде проверяется HMAC-SHA256 подпись через BOT_TOKEN
// Это гарантирует, что данные не подделаны

// Бэкенд также проверяет, есть ли telegramId в таблице managers
```

#### Проверка доступа

```javascript
// Все админы из whitelist имеют ПОЛНЫЙ доступ
// Проверка прав не нужна — если пользователь авторизован, у него есть всё

function isAuthenticated() {
  return AppState.isAuthenticated;
}

// Использование — просто проверяем авторизацию
if (isAuthenticated()) {
  // Показать все функции приложения
  renderFullApp();
} else {
  // Показать экран "Доступ запрещён"
  renderAccessDeniedPage();
}
```

### Telegram WebApp Integration

```javascript
// Полная инициализация
function initTelegramWebApp() {
  const tg = window.Telegram?.WebApp;

  if (!tg) {
    console.warn('Telegram WebApp not available');
    // Для разработки: создаём mock пользователя
    if (isDevelopment()) {
      createMockTelegramUser();
    }
    return;
  }

  // 1. Сигнал готовности
  tg.ready();

  // 2. Раскрываем на весь экран
  tg.expand();

  // 3. Цвета хедера
  tg.setHeaderColor('#2180ce');
  tg.setBackgroundColor(tg.colorScheme === 'dark' ? '#1a1a1a' : '#ffffff');

  // 4. Авторизация
  if (!initTelegramAuth()) {
    return;
  }

  // 5. Тема (light/dark)
  document.documentElement.setAttribute('data-theme', tg.colorScheme || 'light');

  // 6. Подписка на изменение темы
  tg.onEvent('themeChanged', () => {
    document.documentElement.setAttribute('data-theme', tg.colorScheme);
  });

  // 7. Кнопка "Назад"
  tg.BackButton.onClick(() => navigateBack());

  // 8. Haptic feedback
  window.haptic = {
    light: () => tg.HapticFeedback?.impactOccurred('light'),
    medium: () => tg.HapticFeedback?.impactOccurred('medium'),
    heavy: () => tg.HapticFeedback?.impactOccurred('heavy'),
    success: () => tg.HapticFeedback?.notificationOccurred('success'),
    error: () => tg.HapticFeedback?.notificationOccurred('error'),
    warning: () => tg.HapticFeedback?.notificationOccurred('warning'),
  };
}

// Mock для разработки вне Telegram
function createMockTelegramUser() {
  setState('telegramUser', {
    id: 999999999,
    first_name: 'Dev',
    last_name: 'User',
    username: 'dev_user',
    language_code: 'ru',
    is_premium: false,
    photo_url: '',
  });

  setState('currentUser', {
    telegramId: 999999999,
    role: 'admin',
    employeeId: null,
    permissions: ['create_tasks', 'manage_projects', 'manage_employees', 'view_analytics'],
  });

  setState('isAuthenticated', true);
}

function isDevelopment() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}
```

### Отображение пользователя в UI

```javascript
function renderUserInfo() {
  const user = AppState.telegramUser;
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');

  return `
    <div class="user-info">
      ${
        user.photo_url
          ? `<img src="${user.photo_url}" class="user-avatar" alt="${fullName}">`
          : `<div class="user-avatar-placeholder">${user.first_name[0]}</div>`
      }
      <div class="user-details">
        <span class="user-name">${fullName}</span>
        ${user.username ? `<span class="user-username">@${user.username}</span>` : ''}
      </div>
      ${user.is_premium ? '<span class="premium-badge">⭐</span>' : ''}
    </div>
  `;
}
```

### Hash Routing

```javascript
// Роутинг
window.addEventListener('hashchange', handleRouteChange);

function handleRouteChange() {
  const hash = window.location.hash.slice(1) || 'tasks';
  setState('currentPage', hash);
  renderPage(hash);
}
```

### Performance Considerations

- Virtual scrolling для длинных списков (>100 items)
- Debounce для поиска (300ms)
- Lazy rendering для collapsed sections
- CSS containment для изоляции перерисовки

---

## 🚀 Готов к Фазе 2 Фронтенда

План создан. Готов начать разработку фронтенда!
