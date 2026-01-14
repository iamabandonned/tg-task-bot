/* ============================================
   PAGE 5: СПИСОК ЗАДАЧ (с расширенными фильтрами)
   ============================================ */

function renderTasksListPage() {
  const tasks = getState('tasks') || [];
  const searchQuery = getState('tasksSearchQuery') || '';
  const filters = getState('tasksFilters') || getDefaultTaskFilters();
  const expandedTasks = getState('expandedTasks') || [];

  // Фильтрация
  let filteredTasks = applyTaskFilters(tasks, filters, searchQuery);

  // Сортировка по дедлайну
  filteredTasks.sort((a, b) => {
    const dateA = new Date(a.deadline || a.scheduledDate);
    const dateB = new Date(b.deadline || b.scheduledDate);
    return dateA - dateB;
  });

  const hasActiveFilters = checkHasActiveFilters(filters);
  const activeFilterCount = countActiveFilters(filters);

  const html = `
    <div class="tasks-list-page">
      <!-- Toolbar -->
      <div class="tasks-list-page__toolbar">
        <div class="tasks-list-page__search">
          ${renderSearchBar({
            id: 'task-search',
            placeholder: 'Поиск задач...',
            value: searchQuery,
            onInput: 'handleTaskListSearch(this.value)',
            onClear: 'clearTaskListSearch()',
          })}
        </div>
        <button 
          class="btn btn--icon ${hasActiveFilters ? 'btn--primary' : 'btn--outline'}" 
          onclick="showTaskFilterModal()"
          title="Фильтры"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          ${activeFilterCount > 0 ? `<span class="btn__badge">${activeFilterCount}</span>` : ''}
        </button>
      </div>
      
      ${
        hasActiveFilters
          ? `
        <div class="tasks-list-page__active-filters">
          <span class="active-filters__label">Активные фильтры:</span>
          <button class="btn btn--sm btn--ghost" onclick="clearTaskFilters()">
            Очистить все
          </button>
        </div>
      `
          : ''
      }
      
      <!-- Task List -->
      <div class="task-list">
        ${
          filteredTasks.length > 0
            ? filteredTasks
                .map((task) => renderTaskListCard(task, expandedTasks.includes(task.id)))
                .join('')
            : renderEmptyState({
                icon: '📋',
                title: hasActiveFilters || searchQuery ? 'Задачи не найдены' : 'Нет задач',
                text:
                  hasActiveFilters || searchQuery
                    ? 'Попробуйте изменить фильтры'
                    : 'Создайте первую задачу',
                action:
                  !hasActiveFilters && !searchQuery
                    ? '<button class="btn btn--primary" onclick="navigateTo(\'tasks\')">Создать задачу</button>'
                    : '',
              })
        }
      </div>
    </div>
  `;

  return html;
}

function getDefaultTaskFilters() {
  return {
    statuses: {},
    dateFrom: '',
    dateTo: '',
    projectIds: [],
    departmentIds: [],
    employeeIds: [],
    expandedFilterProjects: [],
    expandedFilterDepartments: [],
  };
}

function checkHasActiveFilters(filters) {
  return (
    Object.values(filters.statuses || {}).some((v) => v !== 0) ||
    filters.dateFrom ||
    filters.dateTo ||
    (filters.projectIds && filters.projectIds.length > 0) ||
    (filters.departmentIds && filters.departmentIds.length > 0) ||
    (filters.employeeIds && filters.employeeIds.length > 0)
  );
}

function countActiveFilters(filters) {
  let count = 0;
  if (Object.values(filters.statuses || {}).some((v) => v !== 0)) count++;
  if (filters.dateFrom || filters.dateTo) count++;
  if (filters.projectIds && filters.projectIds.length > 0) count++;
  if (
    (filters.departmentIds && filters.departmentIds.length > 0) ||
    (filters.employeeIds && filters.employeeIds.length > 0)
  )
    count++;
  return count;
}

function renderFilterChip(status, label, state, onClickFn = 'toggleTaskFilter') {
  // state: 0 = не выбран, 1 = включён, -1 = исключён
  let className = 'filter-chip';
  if (state === 1) className += ' filter-chip--active';
  if (state === -1) className += ' filter-chip--excluded';

  return `
    <button 
      class="${className}"
      onclick="${onClickFn}('${status}')"
    >
      ${state === -1 ? '<s>' + label + '</s>' : label}
    </button>
  `;
}

// ===== FILTER MODAL =====

function showTaskFilterModal() {
  const filters = getState('tasksFilters') || getDefaultTaskFilters();
  const projects = getState('projects') || [];
  const departments = getState('departments') || [];
  const employees = getState('employees') || [];

  showModal({
    title: 'Фильтры задач',
    content: `
      <div class="filter-modal">
        <!-- Статусы -->
        <div class="filter-modal__section">
          <div class="filter-modal__section-title">Статусы</div>
          <div class="filter-modal__chips">
            ${renderFilterChip('pending', 'Ожидают', filters.statuses?.pending || 0, 'toggleTaskFilterModal')}
            ${renderFilterChip('in_progress', 'В работе', filters.statuses?.in_progress || 0, 'toggleTaskFilterModal')}
            ${renderFilterChip('completed', 'Завершены', filters.statuses?.completed || 0, 'toggleTaskFilterModal')}
            ${renderFilterChip('overdue', 'Просрочены', filters.statuses?.overdue || 0, 'toggleTaskFilterModal')}
          </div>
          <div class="filter-hint">Нажмите 1 раз - включить, 2 раза - исключить, 3 раза - сбросить</div>
        </div>
        
        <!-- Период -->
        <div class="filter-modal__section">
          <div class="filter-modal__section-title">Период</div>
          <div class="filter-modal__dates">
            <div class="form-group">
              <label class="form-label">С</label>
              <input 
                type="text" 
                class="input" 
                id="filter-date-from"
                placeholder="дд.мм.гггг чч:мм"
                value="${filters.dateFrom || ''}"
                oninput="updateFilterDateFrom(this.value)"
              >
            </div>
            <div class="form-group">
              <label class="form-label">По</label>
              <input 
                type="text" 
                class="input" 
                id="filter-date-to"
                placeholder="дд.мм.гггг чч:мм"
                value="${filters.dateTo || ''}"
                oninput="updateFilterDateTo(this.value)"
              >
            </div>
          </div>
        </div>
        
        <!-- Проекты -->
        <div class="filter-modal__section">
          <div class="filter-modal__section-title">Проекты</div>
          <div class="filter-modal__tree" id="filter-projects-tree">
            ${renderFilterProjectTree(projects, filters.projectIds || [], filters.expandedFilterProjects || [])}
          </div>
        </div>
        
        <!-- Отделы и сотрудники -->
        <div class="filter-modal__section">
          <div class="filter-modal__section-title">Исполнители</div>
          <div class="filter-modal__tree" id="filter-employees-tree">
            ${renderFilterEmployeeTree(departments, employees, filters.departmentIds || [], filters.employeeIds || [], filters.expandedFilterDepartments || [])}
          </div>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn--ghost" onclick="clearTaskFiltersModal()">Очистить</button>
      <button class="btn btn--primary" onclick="closeModal()">Применить</button>
    `,
  });
}

function renderFilterProjectTree(projects, selectedIds, expandedIds) {
  const tree = buildTree(projects);

  if (tree.length === 0) {
    return '<div class="empty-state--small">Нет проектов</div>';
  }

  return tree.map((node) => renderFilterProjectNode(node, selectedIds, expandedIds, 0)).join('');
}

function renderFilterProjectNode(node, selectedIds, expandedIds, level) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.includes(node.id);
  const isSelected = selectedIds.includes(node.id);

  const childrenHtml =
    hasChildren && isExpanded
      ? node.children
          .map((child) => renderFilterProjectNode(child, selectedIds, expandedIds, level + 1))
          .join('')
      : '';

  return `
    <div class="filter-tree-node" style="padding-left: ${level * 16}px">
      <div class="filter-tree-node__header">
        ${
          hasChildren
            ? `
          <span class="filter-tree-node__toggle ${isExpanded ? 'expanded' : ''}" onclick="toggleFilterProjectExpand(${node.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
        `
            : '<span class="filter-tree-node__toggle--empty"></span>'
        }
        
        <label class="checkbox checkbox--sm">
          <input 
            type="checkbox" 
            class="checkbox__input"
            ${isSelected ? 'checked' : ''}
            onchange="toggleFilterProject(${node.id}, this.checked)"
          >
          <span class="checkbox__box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        </label>
        
        <span class="filter-tree-node__color" style="background: ${node.color || 'var(--color-primary)'}"></span>
        <span class="filter-tree-node__name">${escapeHtml(node.name)}</span>
      </div>
      
      ${
        hasChildren
          ? `
        <div class="filter-tree-node__children collapse-content ${isExpanded ? 'expanded' : ''}">
          ${childrenHtml}
        </div>
      `
          : ''
      }
    </div>
  `;
}

function renderFilterEmployeeTree(
  departments,
  employees,
  selectedDeptIds,
  selectedEmpIds,
  expandedIds
) {
  const grouped = groupEmployeesByDepartment(
    employees.filter((e) => e.isActive),
    departments
  );

  if (grouped.length === 0) {
    return '<div class="empty-state--small">Нет сотрудников</div>';
  }

  return grouped
    .map((dept) => {
      const deptEmployees = dept.employees;
      const isExpanded = expandedIds.includes(dept.id);
      const isDeptSelected = selectedDeptIds.includes(dept.id);
      const selectedEmployeesInDept = deptEmployees.filter((e) =>
        selectedEmpIds.includes(e.id)
      ).length;
      const isIndeterminate =
        selectedEmployeesInDept > 0 && selectedEmployeesInDept < deptEmployees.length;

      return `
      <div class="filter-tree-node">
        <div class="filter-tree-node__header">
          <span class="filter-tree-node__toggle ${isExpanded ? 'expanded' : ''}" onclick="toggleFilterDepartmentExpand(${dept.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
          
          <label class="checkbox checkbox--sm ${isIndeterminate ? 'checkbox--indeterminate' : ''}">
            <input 
              type="checkbox" 
              class="checkbox__input"
              ${isDeptSelected || (selectedEmployeesInDept === deptEmployees.length && deptEmployees.length > 0) ? 'checked' : ''}
              onchange="toggleFilterDepartment(${dept.id}, this.checked)"
            >
            <span class="checkbox__box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </label>
          
          <span class="filter-tree-node__name">${escapeHtml(dept.name)}</span>
          <span class="filter-tree-node__count">(${deptEmployees.length})</span>
        </div>
        
        <div class="filter-tree-node__children collapse-content ${isExpanded ? 'expanded' : ''}">
          ${deptEmployees
            .map(
              (emp) => `
            <div class="filter-tree-node" style="padding-left: 16px">
              <div class="filter-tree-node__header">
                <span class="filter-tree-node__toggle--empty"></span>
                
                <label class="checkbox checkbox--sm">
                  <input 
                    type="checkbox" 
                    class="checkbox__input"
                    ${selectedEmpIds.includes(emp.id) ? 'checked' : ''}
                    onchange="toggleFilterEmployee(${emp.id}, this.checked)"
                  >
                  <span class="checkbox__box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                </label>
                
                <span class="filter-tree-node__name">${escapeHtml(getEmployeeFullName(emp))}</span>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
    })
    .join('');
}

function applyTaskFilters(tasks, filters, searchQuery) {
  const now = new Date();

  return tasks.filter((task) => {
    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches =
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query));
      if (!matches) return false;
    }

    // Даты
    const deadline = new Date(task.deadline || task.scheduledDate);

    if (filters.dateFrom) {
      const from = parseDateTime(filters.dateFrom);
      if (from && deadline < from) return false;
    }

    if (filters.dateTo) {
      const to = parseDateTime(filters.dateTo);
      if (to && deadline > to) return false;
    }

    // Проверка статусов
    const isOverdue = deadline < now && task.status !== 'completed';

    // Собираем включённые и исключённые статусы
    const included = [];
    const excluded = [];

    Object.entries(filters.statuses || {}).forEach(([key, val]) => {
      if (val === 1) included.push(key);
      if (val === -1) excluded.push(key);
    });

    // Если есть исключённые - проверяем
    if (excluded.includes('overdue') && isOverdue) return false;
    if (excluded.includes(task.status)) return false;

    // Если есть включённые - должен соответствовать хотя бы одному
    if (included.length > 0) {
      const matchesIncluded = included.some((s) => {
        if (s === 'overdue') return isOverdue;
        return task.status === s;
      });
      if (!matchesIncluded) return false;
    }

    // Фильтр по проектам
    if (filters.projectIds && filters.projectIds.length > 0) {
      const taskProjectId = task.projectId || (task.projectIds && task.projectIds[0]);
      if (!filters.projectIds.includes(taskProjectId)) return false;
    }

    // Фильтр по сотрудникам
    if (filters.employeeIds && filters.employeeIds.length > 0) {
      const taskAssignees = task.assigneeIds || [];
      const hasMatchingAssignee = taskAssignees.some((id) => filters.employeeIds.includes(id));
      if (!hasMatchingAssignee) return false;
    }

    return true;
  });
}

function parseDateTime(str) {
  // Формат: дд.мм.гггг чч:мм
  const match = str.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})$/);
  if (match) {
    const [, day, month, year, hours, minutes] = match;
    return new Date(year, month - 1, day, hours, minutes);
  }

  // Только дата: дд.мм.гггг
  const dateMatch = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    return new Date(year, month - 1, day);
  }

  return null;
}

function formatDateTimeForDisplay(date, time) {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  // Используем переданное время или время из даты
  if (time) {
    return `${day}.${month}.${year} ${time}`;
  }

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  // Не показываем 00:00
  if (hours === '00' && minutes === '00') {
    return `${day}.${month}.${year}`;
  }

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function renderTaskListCard(task, isExpanded) {
  const projects = getState('projects') || [];
  const employees = getState('employees') || [];

  const projectId = task.projectId || (task.projectIds && task.projectIds[0]);
  const project = projects.find((p) => p.id === projectId);

  const assigneeNames = (task.assigneeIds || [])
    .map((id) => {
      const e = employees.find((emp) => emp.id === id);
      return e ? getEmployeeFullName(e) : '';
    })
    .filter(Boolean);

  const now = new Date();
  const deadline = new Date(task.deadline || task.scheduledDate);
  const time = task.scheduledTime || '00:00';
  const taskIsOverdue = deadline < now && task.status !== 'completed';
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  return `
    <div class="task-card ${taskIsOverdue ? 'task-card--overdue' : ''}">
      <div class="task-card__header" onclick="toggleTaskListExpand(${task.id})">
        <div class="task-card__color" style="background: ${project?.color || 'var(--color-primary)'}"></div>
        
        <div class="task-card__content">
          <div class="task-card__title">${escapeHtml(task.title)}</div>
          <div class="task-card__meta">
            ${renderStatusBadge(task.status)}
            ${project ? `<span class="task-card__project-tag" style="background: ${project.color}20; color: ${project.color}">${escapeHtml(project.name)}</span>` : ''}
            <span class="task-card__date ${taskIsOverdue ? 'task-card__date--overdue' : ''}">
              ${taskIsOverdue ? '⚠️ ' : ''}${formatDateTimeForDisplay(deadline, time)}
            </span>
          </div>
        </div>
        
        <button class="task-card__toggle ${isExpanded ? 'expanded' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
      
      <div class="task-card__details collapse-content ${isExpanded ? 'expanded' : ''}">
        ${
          task.description
            ? `
          <div class="task-card__description">${escapeHtml(task.description)}</div>
        `
            : ''
        }
        
        <div class="task-card__info">
          <div class="task-card__info-item">
            <div class="task-card__info-label">Проект</div>
            <div class="task-card__info-value">${project?.name || 'Без проекта'}</div>
          </div>
          <div class="task-card__info-item">
            <div class="task-card__info-label">Исполнители</div>
            <div class="task-card__info-value">${assigneeNames.length > 0 ? assigneeNames.join(', ') : 'Не назначены'}</div>
          </div>
          <div class="task-card__info-item">
            <div class="task-card__info-label">Срок</div>
            <div class="task-card__info-value">
              ${formatDateTimeForDisplay(deadline, time)}
              ${!taskIsOverdue && daysLeft >= 0 ? ` (${daysLeft === 0 ? 'сегодня' : 'через ' + daysLeft + ' дн.'})` : ''}
            </div>
          </div>
          <div class="task-card__info-item">
            <div class="task-card__info-label">Создано</div>
            <div class="task-card__info-value">${task.createdAt ? formatDateTimeForDisplay(new Date(task.createdAt), null) : '—'}</div>
          </div>
        </div>
        
        <div class="task-card__actions">
          <select 
            class="select" 
            style="flex: 1;"
            onchange="changeTaskListStatus(${task.id}, this.value)"
          >
            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Ожидает</option>
            <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>В работе</option>
            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Завершена</option>
          </select>
          <button 
            class="btn btn--secondary" 
            onclick="editTaskFromList(${task.id})"
            title="Редактировать"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            class="btn btn--danger" 
            onclick="confirmDeleteTaskList(${task.id})"
            title="Удалить"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ===== EVENT HANDLERS =====

let taskListSearchTimeout = null;

function handleTaskListSearch(query) {
  // Дебаунс для поиска - не перерисовываем при каждом символе
  setState('tasksSearchQuery', query, true);

  clearTimeout(taskListSearchTimeout);
  taskListSearchTimeout = setTimeout(() => {
    setState('tasksSearchQuery', query);
  }, 300);
}

function clearTaskListSearch() {
  clearTimeout(taskListSearchTimeout);
  setState('tasksSearchQuery', '');
}

function toggleTaskFilter(status) {
  const filters = getState('tasksFilters') || getDefaultTaskFilters();
  const current = filters.statuses?.[status] || 0;

  // 3 состояния: 0 -> 1 -> -1 -> 0
  let next = 0;
  if (current === 0) next = 1;
  else if (current === 1) next = -1;
  else next = 0;

  filters.statuses = filters.statuses || {};
  filters.statuses[status] = next;
  setState('tasksFilters', { ...filters });
  haptic.light();
}

function toggleTaskFilterModal(status) {
  const filters = getState('tasksFilters') || getDefaultTaskFilters();
  const current = filters.statuses?.[status] || 0;

  // 3 состояния: 0 -> 1 -> -1 -> 0
  let next = 0;
  if (current === 0) next = 1;
  else if (current === 1) next = -1;
  else next = 0;

  filters.statuses = filters.statuses || {};
  filters.statuses[status] = next;
  setState('tasksFilters', { ...filters }, true);

  // Обновляем только кнопку статуса в модалке, не перезагружая её
  updateStatusChipInModal(status, next);
  haptic.light();
}

function updateStatusChipInModal(status, state) {
  const statusLabels = {
    pending: 'Ожидают',
    in_progress: 'В работе',
    completed: 'Завершены',
    overdue: 'Просрочены',
  };

  const chips = document.querySelectorAll('.filter-modal__chips .filter-chip');
  chips.forEach((chip) => {
    if (chip.onclick && chip.onclick.toString().includes(`'${status}'`)) {
      chip.className =
        'filter-chip' +
        (state === 1 ? ' filter-chip--active' : state === -1 ? ' filter-chip--excluded' : '');
      chip.innerHTML = state === -1 ? `<s>${statusLabels[status]}</s>` : statusLabels[status];
    }
  });
}

function clearTaskFilters() {
  setState('tasksFilters', getDefaultTaskFilters());
  haptic.light();
}

function clearTaskFiltersModal() {
  clearTaskFilters();
  closeModal();
}

function updateFilterDateFrom(value) {
  const filters = getState('tasksFilters') || getDefaultTaskFilters();
  // Если введена только дата без времени, добавляем 00:00
  const formattedValue = formatDateWithDefaultTime(value);
  setState('tasksFilters', { ...filters, dateFrom: formattedValue }, true);
}

function updateFilterDateTo(value) {
  const filters = getState('tasksFilters') || getDefaultTaskFilters();
  // Если введена только дата без времени, добавляем 23:59
  const formattedValue = formatDateWithDefaultTime(value, true);
  setState('tasksFilters', { ...filters, dateTo: formattedValue }, true);
}

// Добавляет время по умолчанию к дате
function formatDateWithDefaultTime(value, isEndDate = false) {
  // Если уже есть время, возвращаем как есть
  if (/\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  // Если введена полная дата дд.мм.гггг, добавляем время
  const dateMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dateMatch) {
    return value + (isEndDate ? ' 23:59' : ' 00:00');
  }

  return value;
}

// Filter tree toggles - теперь обновляем DOM напрямую, без перезагрузки модалки
function toggleFilterProjectExpand(projectId) {
  const filters = getState('tasksFilters') || getDefaultTaskFilters();
  const expanded = filters.expandedFilterProjects || [];

  const isExpanded = expanded.includes(projectId);

  if (isExpanded) {
    filters.expandedFilterProjects = expanded.filter((id) => id !== projectId);
  } else {
    filters.expandedFilterProjects = [...expanded, projectId];
  }

  setState('tasksFilters', { ...filters }, true);

  // Обновляем DOM напрямую
  toggleFilterTreeNode(projectId, !isExpanded);
  haptic.light();
}

function toggleFilterDepartmentExpand(deptId) {
  const filters = getState('tasksFilters') || getDefaultTaskFilters();
  const expanded = filters.expandedFilterDepartments || [];

  const isExpanded = expanded.includes(deptId);

  if (isExpanded) {
    filters.expandedFilterDepartments = expanded.filter((id) => id !== deptId);
  } else {
    filters.expandedFilterDepartments = [...expanded, deptId];
  }

  setState('tasksFilters', { ...filters }, true);

  // Обновляем DOM напрямую
  toggleFilterTreeNodeDept(deptId, !isExpanded);
  haptic.light();
}

// Обновляет DOM дерева без перезагрузки модалки
function toggleFilterTreeNode(nodeId, expand) {
  const node = document.querySelector(
    `.filter-tree-node [onclick*="toggleFilterProjectExpand(${nodeId})"]`
  );
  if (node) {
    const toggle = node
      .closest('.filter-tree-node__header')
      ?.querySelector('.filter-tree-node__toggle');
    const children = node
      .closest('.filter-tree-node')
      ?.querySelector('.filter-tree-node__children');

    if (toggle) {
      toggle.classList.toggle('expanded', expand);
    }
    if (children) {
      children.classList.toggle('expanded', expand);
    }
  }
}

function toggleFilterTreeNodeDept(nodeId, expand) {
  const node = document.querySelector(
    `.filter-tree-node [onclick*="toggleFilterDepartmentExpand(${nodeId})"]`
  );
  if (node) {
    const toggle = node
      .closest('.filter-tree-node__header')
      ?.querySelector('.filter-tree-node__toggle');
    const children = node
      .closest('.filter-tree-node')
      ?.querySelector('.filter-tree-node__children');

    if (toggle) {
      toggle.classList.toggle('expanded', expand);
    }
    if (children) {
      children.classList.toggle('expanded', expand);
    }
  }
}

function toggleFilterProject(projectId, checked) {
  const filters = getState('tasksFilters') || getDefaultTaskFilters();
  const projectIds = filters.projectIds || [];

  if (checked) {
    if (!projectIds.includes(projectId)) {
      filters.projectIds = [...projectIds, projectId];
    }
  } else {
    filters.projectIds = projectIds.filter((id) => id !== projectId);
  }

  setState('tasksFilters', { ...filters }, true);
  // Не перезагружаем модалку - чекбокс уже обновлён
  haptic.selection();
}

function toggleFilterDepartment(deptId, checked) {
  const filters = getState('tasksFilters') || getDefaultTaskFilters();
  const employees = getState('employees') || [];
  const deptIds = filters.departmentIds || [];
  const empIds = filters.employeeIds || [];

  const deptEmployeeIds = employees
    .filter((e) => e.departmentId === deptId && e.isActive)
    .map((e) => e.id);

  if (checked) {
    // Добавляем весь отдел
    if (!deptIds.includes(deptId)) {
      filters.departmentIds = [...deptIds, deptId];
    }
    // Добавляем всех сотрудников отдела
    filters.employeeIds = [...new Set([...empIds, ...deptEmployeeIds])];
  } else {
    // Убираем отдел
    filters.departmentIds = deptIds.filter((id) => id !== deptId);
    // Убираем сотрудников отдела
    filters.employeeIds = empIds.filter((id) => !deptEmployeeIds.includes(id));
  }

  setState('tasksFilters', { ...filters }, true);
  // Не перезагружаем модалку - чекбоксы уже обновлены
  haptic.selection();
}

function toggleFilterEmployee(empId, checked) {
  const filters = getState('tasksFilters') || getDefaultTaskFilters();
  const empIds = filters.employeeIds || [];

  if (checked) {
    if (!empIds.includes(empId)) {
      filters.employeeIds = [...empIds, empId];
    }
  } else {
    filters.employeeIds = empIds.filter((id) => id !== empId);
  }

  setState('tasksFilters', { ...filters }, true);
  // Не перезагружаем модалку - чекбокс уже обновлён
  haptic.selection();
}

// Edit task function
function editTaskFromList(taskId) {
  const task = findInArray('tasks', taskId);
  if (!task) {
    showToast('Задача не найдена', 'error');
    return;
  }

  // Заполняем форму данными задачи
  setState('taskForm', {
    selectedProjects: task.projectIds || (task.projectId ? [task.projectId] : []),
    selectedEmployees: task.assigneeIds || [],
    allProjectsSelected: false,
    selectedDepartmentsAll: [],
    scheduledDate: task.scheduledDate || task.deadline?.split('T')[0] || '',
    scheduledTime: task.scheduledTime || '',
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'normal',
    editingTaskId: taskId,
    projectSearchQuery: '',
    employeeSearchQuery: '',
  });

  // Переходим на страницу редактирования
  navigateTo('tasks');
  showToast('Редактирование задачи', 'info');
  haptic.light();
}

function toggleTaskListExpand(taskId) {
  const expanded = getState('expandedTasks') || [];

  if (expanded.includes(taskId)) {
    setState(
      'expandedTasks',
      expanded.filter((id) => id !== taskId)
    );
  } else {
    setState('expandedTasks', [...expanded, taskId]);
  }

  haptic.light();
}

async function changeTaskListStatus(taskId, newStatus) {
  setState('loading', true);

  try {
    await API.updateTask(taskId, { status: newStatus });
    showToast(`Статус изменён`, 'success');
    haptic.success();
  } catch (error) {
    console.error('Error changing status:', error);
    showToast('Ошибка изменения статуса', 'error');
    haptic.error();
  } finally {
    setState('loading', false);
  }
}

function confirmDeleteTaskList(taskId) {
  const task = findInArray('tasks', taskId);
  if (!task) return;

  showConfirm({
    title: 'Удалить задачу?',
    message: `"${task.title}" будет удалена`,
    icon: '🗑️',
    confirmText: 'Удалить',
    confirmClass: 'btn--danger',
    onConfirm: async () => {
      setState('loading', true);
      try {
        await API.deleteTask(taskId);
        showToast('Задача удалена', 'success');
        haptic.success();
      } catch (error) {
        showToast('Ошибка удаления', 'error');
        haptic.error();
      } finally {
        setState('loading', false);
      }
    },
  });
}

// Export
window.renderTasksListPage = renderTasksListPage;
window.handleTaskListSearch = handleTaskListSearch;
window.clearTaskListSearch = clearTaskListSearch;
window.toggleTaskFilter = toggleTaskFilter;
window.toggleTaskFilterModal = toggleTaskFilterModal;
window.clearTaskFilters = clearTaskFilters;
window.clearTaskFiltersModal = clearTaskFiltersModal;
window.updateFilterDateFrom = updateFilterDateFrom;
window.updateFilterDateTo = updateFilterDateTo;
window.showTaskFilterModal = showTaskFilterModal;
window.toggleFilterProjectExpand = toggleFilterProjectExpand;
window.toggleFilterDepartmentExpand = toggleFilterDepartmentExpand;
window.toggleFilterProject = toggleFilterProject;
window.toggleFilterDepartment = toggleFilterDepartment;
window.toggleFilterEmployee = toggleFilterEmployee;
window.toggleTaskListExpand = toggleTaskListExpand;
window.changeTaskListStatus = changeTaskListStatus;
window.confirmDeleteTaskList = confirmDeleteTaskList;
window.editTaskFromList = editTaskFromList;
