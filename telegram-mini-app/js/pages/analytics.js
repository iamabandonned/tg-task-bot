/* ============================================
   PAGE 4: АНАЛИТИКА
   ============================================ */

function renderAnalyticsPage() {
  const tasks = getState('tasks') || [];
  const projects = getState('projects') || [];
  const employees = getState('employees') || [];
  const activeTab = getState('analyticsTab') || 'employees';
  const searchQuery = getState('analyticsSearch') || '';
  const expandedItems = getState('analyticsExpanded') || [];

  // Период по умолчанию - текущий месяц
  const now = new Date();
  const defaultFrom = `01.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
  const defaultTo = `${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

  const dateFrom = getState('analyticsDateFrom') || defaultFrom;
  const dateTo = getState('analyticsDateTo') || defaultTo;

  // Фильтруем задачи по периоду
  const filteredTasks = filterTasksByPeriod(tasks, dateFrom, dateTo);

  const stats = calculateOverviewStats(filteredTasks);

  const html = `
    <div class="analytics-page">
      <!-- Главная статистика -->
      <div class="analytics-stats-grid">
        <div class="stat-card stat-card--primary">
          <div class="stat-card__value">${stats.total}</div>
          <div class="stat-card__label">Всего задач</div>
        </div>
        <div class="stat-card stat-card--success">
          <div class="stat-card__value">${stats.completed}</div>
          <div class="stat-card__label">Выполнено</div>
        </div>
        <div class="stat-card stat-card--warning">
          <div class="stat-card__value">${stats.inProgress}</div>
          <div class="stat-card__label">В работе</div>
        </div>
        <div class="stat-card stat-card--danger">
          <div class="stat-card__value">${stats.overdue}</div>
          <div class="stat-card__label">Просрочено</div>
        </div>
      </div>
      
      <!-- Прогресс выполнения -->
      <div class="analytics-card">
        <div class="analytics-card__title">Прогресс выполнения</div>
        <div class="progress-overview">
          <div class="progress-ring" style="--progress: ${stats.completionRate}">
            <svg viewBox="0 0 100 100">
              <circle class="progress-ring__bg" cx="50" cy="50" r="40"/>
              <circle class="progress-ring__fill" cx="50" cy="50" r="40"/>
            </svg>
            <div class="progress-ring__value">${stats.completionRate}%</div>
          </div>
          <div class="progress-legend">
            <div class="progress-legend__item">
              <span class="progress-legend__dot" style="background: var(--color-success)"></span>
              <span>Выполнено (${stats.completed})</span>
            </div>
            <div class="progress-legend__item">
              <span class="progress-legend__dot" style="background: var(--color-warning)"></span>
              <span>В работе (${stats.inProgress})</span>
            </div>
            <div class="progress-legend__item">
              <span class="progress-legend__dot" style="background: var(--color-text-muted)"></span>
              <span>Ожидают (${stats.pending})</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Вкладки -->
      <div class="analytics-tabs">
        <button class="analytics-tab ${activeTab === 'employees' ? 'active' : ''}" onclick="setAnalyticsTab('employees')">
          По сотрудникам
        </button>
        <button class="analytics-tab ${activeTab === 'projects' ? 'active' : ''}" onclick="setAnalyticsTab('projects')">
          По проектам
        </button>
      </div>
      
      <!-- Фильтры -->
      <div class="analytics-filters">
        <div class="analytics-filters__search">
          ${renderSearchBar({
            id: 'analytics-search',
            placeholder: activeTab === 'employees' ? 'Поиск сотрудников...' : 'Поиск проектов...',
            value: searchQuery,
            onInput: 'handleAnalyticsSearch(this.value)',
            onClear: 'clearAnalyticsSearch()',
          })}
        </div>
        <div class="analytics-filters__period">
          <input 
            type="text" 
            class="input input--sm" 
            placeholder="С: дд.мм.гггг"
            value="${dateFrom}"
            oninput="setAnalyticsDateFrom(this.value)"
            onblur="applyAnalyticsDateFilters()"
          >
          <span>—</span>
          <input 
            type="text" 
            class="input input--sm" 
            placeholder="По: дд.мм.гггг"
            value="${dateTo}"
            oninput="setAnalyticsDateTo(this.value)"
            onblur="applyAnalyticsDateFilters()"
          >
        </div>
      </div>
      
      <!-- Контент вкладки -->
      <div class="analytics-tab-content">
        ${
          activeTab === 'employees'
            ? renderEmployeesAnalytics(
                filteredTasks,
                employees,
                projects,
                searchQuery,
                expandedItems
              )
            : renderProjectsAnalytics(
                filteredTasks,
                projects,
                employees,
                searchQuery,
                expandedItems
              )
        }
      </div>
    </div>
  `;

  return html;
}

function filterTasksByPeriod(tasks, dateFrom, dateTo) {
  const from = parseDateString(dateFrom);
  const to = parseDateString(dateTo);

  if (!from && !to) return tasks;

  return tasks.filter((task) => {
    const deadline = new Date(task.deadline || task.scheduledDate);
    if (from && deadline < from) return false;
    if (to) {
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);
      if (deadline > toEnd) return false;
    }
    return true;
  });
}

function parseDateString(str) {
  if (!str) return null;
  const match = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return new Date(year, month - 1, day);
  }
  return null;
}

function calculateOverviewStats(tasks) {
  const now = new Date();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const overdue = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    const deadline = new Date(t.deadline || t.scheduledDate);
    return deadline < now;
  }).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, inProgress, pending, overdue, completionRate };
}

// ===== EMPLOYEES ANALYTICS =====

function renderEmployeesAnalytics(tasks, employees, projects, searchQuery, expandedItems) {
  const departments = getState('departments') || [];

  let filteredEmployees = employees.filter((e) => e.isActive);

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredEmployees = filteredEmployees.filter((e) =>
      getEmployeeFullName(e).toLowerCase().includes(query)
    );
  }

  const employeeStats = filteredEmployees
    .map((e) => {
      const empTasks = tasks.filter((t) => t.assigneeIds && t.assigneeIds.includes(e.id));
      const completed = empTasks.filter((t) => t.status === 'completed').length;
      const dept = departments.find((d) => d.id === e.departmentId);
      return {
        ...e,
        department: dept?.name || '',
        tasks: empTasks,
        taskCount: empTasks.length,
        completedCount: completed,
      };
    })
    .sort((a, b) => b.taskCount - a.taskCount);

  if (employeeStats.length === 0) {
    return renderEmptyState({
      icon: '👥',
      title: 'Нет данных',
      text: searchQuery ? 'Сотрудники не найдены' : 'Добавьте сотрудников и назначьте задачи',
    });
  }

  return `
    <div class="analytics-list">
      ${employeeStats
        .map((e) => {
          const isExpanded = expandedItems.includes(`emp-${e.id}`);
          return `
          <div class="analytics-item">
            <div class="analytics-item__header" onclick="toggleAnalyticsItem('emp-${e.id}')">
              ${renderAvatar({ firstName: e.firstName, lastName: e.lastName, size: 'sm' })}
              <div class="analytics-item__info">
                <div class="analytics-item__name">${escapeHtml(getEmployeeFullName(e))}</div>
                <div class="analytics-item__sub">${escapeHtml(e.department)}</div>
              </div>
              <div class="analytics-item__stats">
                <span class="analytics-item__value">${e.completedCount}/${e.taskCount}</span>
              </div>
              <span class="analytics-item__toggle ${isExpanded ? 'expanded' : ''}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
            
            ${
              isExpanded
                ? `
              <div class="analytics-item__tasks">
                ${
                  e.tasks.length > 0
                    ? e.tasks
                        .map((task) => {
                          const project = projects.find(
                            (p) =>
                              p.id === (task.projectId || (task.projectIds && task.projectIds[0]))
                          );
                          return renderAnalyticsTaskCard(task, project, null);
                        })
                        .join('')
                    : '<p class="text-muted text-center p-3">Нет задач</p>'
                }
              </div>
            `
                : ''
            }
          </div>
        `;
        })
        .join('')}
    </div>
  `;
}

// ===== PROJECTS ANALYTICS =====

function renderProjectsAnalytics(tasks, projects, employees, searchQuery, expandedItems) {
  let filteredProjects = projects.filter((p) => !p.parentId);

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredProjects = filteredProjects.filter((p) => p.name.toLowerCase().includes(query));
  }

  const projectStats = filteredProjects
    .map((p) => {
      const pTasks = tasks.filter((t) => {
        if (t.projectIds) return t.projectIds.includes(p.id);
        return t.projectId === p.id;
      });
      const completed = pTasks.filter((t) => t.status === 'completed').length;
      return {
        ...p,
        tasks: pTasks,
        taskCount: pTasks.length,
        completedCount: completed,
        progress: pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0,
      };
    })
    .sort((a, b) => b.taskCount - a.taskCount);

  if (projectStats.length === 0) {
    return renderEmptyState({
      icon: '📊',
      title: 'Нет данных',
      text: searchQuery ? 'Проекты не найдены' : 'Создайте проекты и задачи',
    });
  }

  return `
    <div class="analytics-list">
      ${projectStats
        .map((p) => {
          const isExpanded = expandedItems.includes(`proj-${p.id}`);
          return `
          <div class="analytics-item">
            <div class="analytics-item__header" onclick="toggleAnalyticsItem('proj-${p.id}')">
              <div class="analytics-item__color" style="background: ${p.color || 'var(--color-primary)'}"></div>
              <div class="analytics-item__info">
                <div class="analytics-item__name">${escapeHtml(p.name)}</div>
                <div class="analytics-item__progress">
                  <div class="progress-bar progress-bar--sm">
                    <div class="progress-bar__fill" style="width: ${p.progress}%; background: ${p.color || 'var(--color-primary)'}"></div>
                  </div>
                </div>
              </div>
              <div class="analytics-item__stats">
                <span class="analytics-item__value">${p.completedCount}/${p.taskCount}</span>
              </div>
              <span class="analytics-item__toggle ${isExpanded ? 'expanded' : ''}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
            
            ${
              isExpanded
                ? `
              <div class="analytics-item__tasks">
                ${
                  p.tasks.length > 0
                    ? p.tasks
                        .map((task) => {
                          const assignee = employees.find(
                            (e) => task.assigneeIds && task.assigneeIds.includes(e.id)
                          );
                          return renderAnalyticsTaskCard(task, null, assignee);
                        })
                        .join('')
                    : '<p class="text-muted text-center p-3">Нет задач</p>'
                }
              </div>
            `
                : ''
            }
          </div>
        `;
        })
        .join('')}
    </div>
  `;
}

// ===== TASK CARD FOR ANALYTICS =====

function renderAnalyticsTaskCard(task, project, assignee) {
  const deadline = new Date(task.deadline || task.scheduledDate);
  const time = task.scheduledTime || '';
  const now = new Date();
  const isOverdue = deadline < now && task.status !== 'completed';

  // Форматирование даты
  const day = String(deadline.getDate()).padStart(2, '0');
  const month = String(deadline.getMonth() + 1).padStart(2, '0');
  const year = deadline.getFullYear();
  const dateStr = `${day}.${month}.${year}${time ? ' ' + time : ''}`;

  return `
    <div class="analytics-task ${isOverdue ? 'analytics-task--overdue' : ''}">
      <div class="analytics-task__content">
        <div class="analytics-task__title">${escapeHtml(task.title)}</div>
        <div class="analytics-task__meta">
          ${renderStatusBadge(task.status)}
          ${project ? `<span class="analytics-task__tag" style="background: ${project.color}20; color: ${project.color}">${escapeHtml(project.name)}</span>` : ''}
          ${assignee ? `<span class="analytics-task__tag analytics-task__tag--user">${escapeHtml(getEmployeeFullName(assignee))}</span>` : ''}
          <span class="analytics-task__date ${isOverdue ? 'analytics-task__date--overdue' : ''}">${dateStr}</span>
        </div>
      </div>
    </div>
  `;
}

// ===== EVENT HANDLERS =====

function setAnalyticsTab(tab) {
  setState('analyticsTab', tab);
  setState('analyticsExpanded', [], true);
  haptic.light();
}

let analyticsSearchTimeout = null;

function handleAnalyticsSearch(query) {
  // Дебаунс для поиска - не перерисовываем при каждом символе
  setState('analyticsSearch', query, true);

  clearTimeout(analyticsSearchTimeout);
  analyticsSearchTimeout = setTimeout(() => {
    // Применяем поиск через 300мс после последнего ввода
    setState('analyticsSearch', query);
  }, 300);
}

function clearAnalyticsSearch() {
  clearTimeout(analyticsSearchTimeout);
  setState('analyticsSearch', '');
}

// Используем skipRender чтобы страница не перерисовывалась при каждом нажатии
function setAnalyticsDateFrom(value) {
  setState('analyticsDateFrom', value, true);
}

function setAnalyticsDateTo(value) {
  setState('analyticsDateTo', value, true);
}

// Применяет фильтры дат (вызывается при потере фокуса)
function applyAnalyticsDateFilters() {
  // Просто перерисовываем страницу с текущими значениями
  setState('analyticsDateFrom', getState('analyticsDateFrom') || '');
}

function toggleAnalyticsItem(itemId) {
  const expanded = getState('analyticsExpanded') || [];
  if (expanded.includes(itemId)) {
    setState(
      'analyticsExpanded',
      expanded.filter((id) => id !== itemId)
    );
  } else {
    setState('analyticsExpanded', [...expanded, itemId]);
  }
  haptic.light();
}

// Export
window.renderAnalyticsPage = renderAnalyticsPage;
window.setAnalyticsTab = setAnalyticsTab;
window.handleAnalyticsSearch = handleAnalyticsSearch;
window.clearAnalyticsSearch = clearAnalyticsSearch;
window.setAnalyticsDateFrom = setAnalyticsDateFrom;
window.setAnalyticsDateTo = setAnalyticsDateTo;
window.applyAnalyticsDateFilters = applyAnalyticsDateFilters;
window.toggleAnalyticsItem = toggleAnalyticsItem;
