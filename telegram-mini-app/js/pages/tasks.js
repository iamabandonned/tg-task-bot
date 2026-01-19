/* ============================================
   PAGE 1: ПОСТАНОВКА ЗАДАЧ
   ============================================ */

function renderTasksPage() {
  const form = getState('taskForm');
  const projects = getState('projects') || [];
  const departments = getState('departments') || [];
  const employees = getState('employees') || [];

  const isEditing = form.editingTaskId !== null;

  // Получаем имена выбранных проектов и сотрудников
  const selectedProjectNames = getProjectNames(form.selectedProjects);
  const selectedEmployeeNames = getEmployeeNames(form.selectedEmployees);

  // Текущая дата для календаря
  const calendarDate = form.calendarMonth || new Date().toISOString().slice(0, 7);

  const html = `
    <div class="task-form">
      <!-- Проекты -->
      <div class="task-form__section">
        <div class="task-form__section-title">
          Проект ${form.allProjectsSelected ? '(Все проекты)' : form.selectedProjects.length > 0 ? `(${form.selectedProjects.length})` : ''}
        </div>
        
        <!-- Поиск и кнопки управления -->
        <div class="selector-controls">
          <div class="selector-controls__search">
            <input 
              type="text" 
              class="input input--sm" 
              placeholder="Поиск проектов..."
              value="${escapeHtml(form.projectSearchQuery || '')}"
              oninput="handleTaskFormChange('projectSearchQuery', this.value)"
            >
          </div>
          <div class="selector-controls__buttons">
            <button 
              class="btn btn--sm ${form.allProjectsSelected ? 'btn--primary' : 'btn--outline'}" 
              onclick="toggleAllProjectsSelection()"
            >
              ${form.allProjectsSelected ? '✓ Все проекты' : 'Выбрать все'}
            </button>
            <button 
              class="btn btn--sm btn--ghost" 
              onclick="clearProjectSelection()"
              ${form.selectedProjects.length === 0 && !form.allProjectsSelected ? 'disabled' : ''}
            >
              Очистить
            </button>
          </div>
        </div>
        
        ${
          form.allProjectsSelected
            ? `
          <div class="all-selected-notice">
            <span class="all-selected-notice__icon">📁</span>
            <span>Все проекты выбраны</span>
          </div>
        `
            : `
          <div class="project-selector">
            ${renderProjectTree(projects, form.selectedProjects, form.projectSearchQuery)}
          </div>
          ${
            form.selectedProjects.length > 0
              ? `
            <div class="selected-summary">
              <span class="selected-summary__label">Выбрано:</span>
              ${renderChips(
                selectedProjectNames.map((name, i) => ({
                  id: form.selectedProjects[i],
                  name,
                })),
                'removeProjectFromTask'
              )}
            </div>
          `
              : ''
          }
        `
        }
      </div>
      
      <!-- Исполнители -->
      <div class="task-form__section">
        <div class="task-form__section-title">
          Исполнители ${getEmployeeSummary(form)}
        </div>
        
        <!-- Поиск и кнопки управления -->
        <div class="selector-controls">
          <div class="selector-controls__search">
            <input 
              type="text" 
              class="input input--sm" 
              placeholder="Поиск сотрудников..."
              value="${escapeHtml(form.employeeSearchQuery || '')}"
              oninput="handleTaskFormChange('employeeSearchQuery', this.value)"
            >
          </div>
          <div class="selector-controls__buttons">
            <button 
              class="btn btn--sm btn--ghost" 
              onclick="clearEmployeeSelection()"
              ${form.selectedEmployees.length === 0 && form.selectedDepartmentsAll.length === 0 ? 'disabled' : ''}
            >
              Очистить
            </button>
          </div>
        </div>
        
        <div class="employee-selector">
          ${renderEmployeeSelector(departments, employees, form.selectedEmployees, form.selectedDepartmentsAll, form.employeeSearchQuery)}
        </div>
        ${renderSelectedEmployeesSummary(form, departments, employees)}
      </div>
      
      <!-- Срок выполнения с календарём -->
      <div class="task-form__section">
        <div class="task-form__section-title">Срок выполнения</div>
        
        <!-- Календарь -->
        <div class="calendar">
          <div class="calendar__header">
            <div class="calendar__selectors">
              <select class="calendar__month-select" onchange="setCalendarMonth(this.value)">
                ${getMonthOptions(calendarDate)}
              </select>
              <select class="calendar__year-select" onchange="setCalendarYear(this.value)">
                ${getYearOptions(calendarDate)}
              </select>
            </div>
            <div class="calendar__nav">
              <button class="calendar__nav-btn" onclick="changeCalendarMonth(-1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button class="calendar__nav-btn" onclick="changeCalendarMonth(1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
          <div class="calendar__weekdays">
            <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
          </div>
          <div class="calendar__days">
            ${renderCalendarDays(calendarDate, form.scheduledDate)}
          </div>
        </div>
        
        <!-- Ручной ввод даты и времени -->
        <div class="datetime-manual">
          <div class="datetime-manual__field">
            <label class="form-label">Дата</label>
            <input 
              type="text" 
              class="input" 
              id="scheduledDateText"
              placeholder="ДД.ММ.ГГГГ"
              value="${form.scheduledDate ? formatDateForInput(form.scheduledDate) : ''}"
              oninput="handleDateTextInput(this.value)"
              onblur="applyDateInput()"
            >
          </div>
          <div class="datetime-manual__field">
            <label class="form-label">Время</label>
            <input 
              type="text" 
              class="input" 
              id="scheduledTimeText"
              placeholder="ЧЧ:ММ"
              value="${form.scheduledTime || ''}"
              oninput="handleTimeTextInput(this.value)"
            >
          </div>
        </div>
      </div>
      
      <!-- Название и описание -->
      <div class="task-form__section">
        <div class="task-form__section-title">Детали задачи</div>
        <div class="form-group">
          <input 
            type="text" 
            class="input" 
            id="taskTitle"
            placeholder="Название задачи"
            value="${escapeHtml(form.title)}"
            oninput="handleTaskFormChange('title', this.value)"
          >
        </div>
        <div class="form-group">
          <textarea 
            class="input textarea" 
            id="taskDescription"
            placeholder="Описание задачи (необязательно)"
            rows="4"
            oninput="handleTaskFormChange('description', this.value)"
          >${escapeHtml(form.description)}</textarea>
        </div>
      </div>
      
      <!-- Кнопки действий -->
      <div class="flex gap-3">
        <button 
          class="btn btn--secondary flex-1" 
          onclick="clearTaskForm()"
        >
          Очистить
        </button>
        <button 
          class="btn btn--primary flex-1" 
          onclick="previewTask()"
        >
          ${isEditing ? 'Сохранить' : 'Создать задачу'}
        </button>
      </div>
    </div>
  `;

  return html;
}

// ===== CALENDAR FUNCTIONS =====

function getCalendarMonthName(dateStr) {
  const [year, month] = dateStr.split('-').map(Number);
  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];
  return `${months[month - 1]} ${year}`;
}

function getMonthOptions(dateStr) {
  const [year, month] = dateStr.split('-').map(Number);
  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  return months
    .map(
      (name, i) => `<option value="${i + 1}" ${i + 1 === month ? 'selected' : ''}>${name}</option>`
    )
    .join('');
}

function getYearOptions(dateStr) {
  const [currentYear] = dateStr.split('-').map(Number);
  const years = [];

  for (let y = 2024; y <= 2030; y++) {
    years.push(`<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`);
  }

  return years.join('');
}

function setCalendarMonth(month) {
  const current = getState('taskForm.calendarMonth') || new Date().toISOString().slice(0, 7);
  const [year] = current.split('-');
  setState('taskForm.calendarMonth', `${year}-${String(month).padStart(2, '0')}`);
  haptic.light();
}

function setCalendarYear(year) {
  const current = getState('taskForm.calendarMonth') || new Date().toISOString().slice(0, 7);
  const [, month] = current.split('-');
  setState('taskForm.calendarMonth', `${year}-${month}`);
  haptic.light();
}

function renderCalendarDays(monthStr, selectedDate) {
  const [year, month] = monthStr.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // День недели первого дня (0=Вс, нужно 0=Пн)
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const days = [];

  // Пустые дни в начале
  for (let i = 0; i < startDay; i++) {
    days.push('<span class="calendar__day calendar__day--empty"></span>');
  }

  // Дни месяца
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(year, month - 1, day);

    const isToday = date.getTime() === today.getTime();
    const isSelected = dateStr === selectedDate;
    const isPast = date < today;

    let classes = 'calendar__day';
    if (isToday) classes += ' calendar__day--today';
    if (isSelected) classes += ' calendar__day--selected';
    if (isPast) classes += ' calendar__day--past';

    days.push(`
      <span class="${classes}" onclick="${!isPast ? `selectCalendarDate('${dateStr}')` : ''}">${day}</span>
    `);
  }

  return days.join('');
}

function changeCalendarMonth(delta) {
  const current = getState('taskForm.calendarMonth') || new Date().toISOString().slice(0, 7);
  const [year, month] = current.split('-').map(Number);

  let newMonth = month + delta;
  let newYear = year;

  if (newMonth > 12) {
    newMonth = 1;
    newYear++;
  } else if (newMonth < 1) {
    newMonth = 12;
    newYear--;
  }

  setState('taskForm.calendarMonth', `${newYear}-${String(newMonth).padStart(2, '0')}`);
  haptic.light();
}

function selectCalendarDate(dateStr) {
  setState('taskForm.scheduledDate', dateStr, true);
  // Обновляем текстовое поле
  const textInput = document.getElementById('scheduledDateText');
  if (textInput) {
    textInput.value = formatDateForInput(dateStr);
  }
  renderCurrentPage();
  haptic.selection();
}

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

function handleDateTextInput(value) {
  // Автоформат: добавляем точки при вводе
  let formatted = value.replace(/\D/g, '');
  if (formatted.length > 2) {
    formatted = formatted.slice(0, 2) + '.' + formatted.slice(2);
  }
  if (formatted.length > 5) {
    formatted = formatted.slice(0, 5) + '.' + formatted.slice(5, 9);
  }

  const input = document.getElementById('scheduledDateText');
  if (input && input.value !== formatted) {
    input.value = formatted;
  }

  // Формат: ДД.ММ.ГГГГ
  const match = formatted.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const d = parseInt(day),
      m = parseInt(month),
      y = parseInt(year);

    // Валидация даты
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2024) {
      const dateStr = `${year}-${month}-${day}`;
      const date = new Date(y, m - 1, d);

      if (!isNaN(date.getTime()) && date.getDate() === d) {
        setState('taskForm.scheduledDate', dateStr, true);
        setState('taskForm.calendarMonth', `${year}-${month}`, true);
        // Не перерисовываем страницу при вводе - только обновляем состояние
      }
    }
  }
}

// Применяет дату и обновляет календарь (вызывается при потере фокуса)
function applyDateInput() {
  renderCurrentPage();
}

function handleTimeTextInput(value) {
  // Автоформат: добавляем двоеточие
  let formatted = value.replace(/\D/g, '');
  if (formatted.length > 2) {
    formatted = formatted.slice(0, 2) + ':' + formatted.slice(2, 4);
  }

  const input = document.getElementById('scheduledTimeText');
  if (input && input.value !== formatted) {
    input.value = formatted;
  }

  // Валидация времени ЧЧ:ММ
  const match = formatted.match(/^(\d{2}):(\d{2})$/);
  if (match) {
    const [, hours, minutes] = match;
    const h = parseInt(hours),
      min = parseInt(minutes);

    if (h >= 0 && h <= 23 && min >= 0 && min <= 59) {
      setState('taskForm.scheduledTime', formatted, true);
    }
  }
}

// ===== PROJECT TREE FOR SELECTION =====

function renderProjectTree(projects, selectedIds, searchQuery = '') {
  const tree = buildTree(projects);

  if (tree.length === 0) {
    return renderEmptyState({
      icon: '📁',
      title: 'Нет проектов',
      text: 'Создайте проекты на странице "Проекты"',
    });
  }

  // Фильтрация по поиску
  const filteredTree = searchQuery.trim()
    ? filterTreeBySearch(tree, searchQuery.toLowerCase())
    : tree;

  if (filteredTree.length === 0) {
    return `<div class="empty-search">Ничего не найдено</div>`;
  }

  return filteredTree.map((node) => renderProjectTreeNode(node, selectedIds, 0)).join('');
}

function filterTreeBySearch(nodes, query) {
  return nodes.reduce((acc, node) => {
    const matches = node.name.toLowerCase().includes(query);
    const filteredChildren = node.children ? filterTreeBySearch(node.children, query) : [];

    if (matches || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: matches ? node.children : filteredChildren,
      });
    }

    return acc;
  }, []);
}

function renderProjectTreeNode(node, selectedIds, level) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = getState('expandedProjects')?.includes(node.id);
  const isSelected = selectedIds.includes(node.id);

  // Проверяем, выбраны ли все дети
  const allChildIds = hasChildren ? getAllChildIds(node) : [];
  const selectedChildCount = allChildIds.filter((id) => selectedIds.includes(id)).length;
  const isIndeterminate = selectedChildCount > 0 && selectedChildCount < allChildIds.length;

  const childrenHtml =
    hasChildren && isExpanded
      ? node.children.map((child) => renderProjectTreeNode(child, selectedIds, level + 1)).join('')
      : '';

  return `
    <div class="tree-node ${level === 0 ? 'tree-node--root' : ''}" data-id="${node.id}">
      <div class="tree-node__header">
        <span 
          class="tree-node__toggle ${isExpanded ? 'expanded' : ''} ${!hasChildren ? 'tree-node__toggle--empty' : ''}"
          onclick="toggleProjectExpand(${node.id})"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
        
        <label class="checkbox ${isIndeterminate ? 'checkbox--indeterminate' : ''}" onclick="event.stopPropagation()">
          <input 
            type="checkbox" 
            class="checkbox__input"
            ${isSelected ? 'checked' : ''}
            onclick="event.stopPropagation()"
            onchange="(function(){ window._projectSelectorScroll = document.querySelector('.project-selector') && document.querySelector('.project-selector').scrollTop; })(); toggleProjectSelection(${node.id}, this.checked)"
          >
          <span class="checkbox__box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        </label>
        
        <div class="tree-node__content">
          <span style="color: ${node.color || '#2180ce'}">●</span>
          <span class="tree-node__name">${escapeHtml(node.name)}</span>
        </div>
      </div>
      
      ${
        hasChildren
          ? `
        <div class="tree-node__children collapse-content ${isExpanded ? 'expanded' : ''}">
          ${childrenHtml}
        </div>
      `
          : ''
      }
    </div>
  `;
}

function getAllChildIds(node) {
  let ids = [];
  if (node.children) {
    node.children.forEach((child) => {
      ids.push(child.id);
      ids = ids.concat(getAllChildIds(child));
    });
  }
  return ids;
}

// ===== EMPLOYEE SELECTOR =====

function renderEmployeeSelector(
  departments,
  employees,
  selectedIds,
  selectedDepartmentsAll = [],
  searchQuery = ''
) {
  const grouped = groupEmployeesByDepartment(
    employees.filter((e) => e.isActive),
    departments
  );

  if (grouped.length === 0) {
    return renderEmptyState({
      icon: '👥',
      title: 'Нет сотрудников',
      text: 'Добавьте сотрудников на странице "Сотрудники"',
    });
  }

  // Фильтрация по поиску
  const query = searchQuery.toLowerCase().trim();
  const filteredGroups = query
    ? grouped
        .map((dept) => ({
          ...dept,
          employees: dept.employees.filter(
            (emp) =>
              getEmployeeFullName(emp).toLowerCase().includes(query) ||
              (emp.position && emp.position.toLowerCase().includes(query))
          ),
        }))
        .filter((dept) => dept.employees.length > 0 || dept.name.toLowerCase().includes(query))
    : grouped;

  if (filteredGroups.length === 0) {
    return `<div class="empty-search">Ничего не найдено</div>`;
  }

  return filteredGroups
    .map((dept) => {
      const deptEmployees = dept.employees;
      const isExpanded = getState('expandedDepartments')?.includes(dept.id);
      const isDepartmentAllSelected = selectedDepartmentsAll.includes(dept.id);
      const allSelected =
        isDepartmentAllSelected ||
        (deptEmployees.length > 0 && deptEmployees.every((e) => selectedIds.includes(e.id)));
      const someSelected = deptEmployees.some((e) => selectedIds.includes(e.id));

      return `
      <div class="employee-department ${isDepartmentAllSelected ? 'employee-department--all-selected' : ''}">
        <div class="employee-department__header" onclick="toggleDepartmentExpand(${dept.id})">
          <span class="tree-node__toggle ${isExpanded ? 'expanded' : ''}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
          
          <label class="checkbox ${someSelected && !allSelected ? 'checkbox--indeterminate' : ''}" onclick="event.stopPropagation()">
            <input 
              type="checkbox" 
              class="checkbox__input"
              ${allSelected ? 'checked' : ''}
              onchange="toggleDepartmentAllSelection(${dept.id}, this.checked)"
            >
            <span class="checkbox__box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </label>
          
          <span class="employee-department__name">${escapeHtml(dept.name)}</span>
          <span class="employee-department__count">${deptEmployees.length}</span>
          ${isDepartmentAllSelected ? '<span class="badge badge--primary badge--sm">Весь отдел</span>' : ''}
        </div>
        
        ${
          !isDepartmentAllSelected
            ? `
          <div class="employee-department__list collapse-content ${isExpanded ? 'expanded' : ''}">
            ${deptEmployees
              .map(
                (emp) => `
              <div class="employee-item">
                <label class="checkbox">
                  <input 
                    type="checkbox" 
                    class="checkbox__input"
                    ${selectedIds.includes(emp.id) ? 'checked' : ''}
                    onchange="toggleEmployeeSelection(${emp.id}, this.checked)"
                  >
                  <span class="checkbox__box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                </label>
                ${renderAvatar({ firstName: emp.firstName, lastName: emp.lastName, size: 'sm' })}
                <div class="employee-item__info">
                  <div class="employee-item__name">${escapeHtml(getEmployeeFullName(emp))}</div>
                  <div class="employee-item__position">${escapeHtml(emp.position || '')}</div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
    `;
    })
    .join('');
}

// Helper functions for employee selection display
function getEmployeeSummary(form) {
  const deptCount = form.selectedDepartmentsAll?.length || 0;
  const empCount = form.selectedEmployees?.length || 0;

  if (deptCount > 0 && empCount > 0) {
    return `(${deptCount} отд., ${empCount} чел.)`;
  } else if (deptCount > 0) {
    return `(${deptCount} отдел${deptCount === 1 ? '' : deptCount < 5 ? 'а' : 'ов'})`;
  } else if (empCount > 0) {
    return `(${empCount})`;
  }
  return '';
}

function renderSelectedEmployeesSummary(form, departments, employees) {
  const selectedDepts = form.selectedDepartmentsAll || [];
  const selectedEmps = form.selectedEmployees || [];

  if (selectedDepts.length === 0 && selectedEmps.length === 0) {
    return '';
  }

  const items = [];

  // Добавляем выбранные отделы
  selectedDepts.forEach((deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    if (dept) {
      items.push({ id: `dept_${deptId}`, name: `📁 ${dept.name}`, isDept: true, deptId });
    }
  });

  // Добавляем выбранных сотрудников (исключая тех, кто уже в выбранных отделах)
  selectedEmps.forEach((empId) => {
    const emp = employees.find((e) => e.id === empId);
    if (emp && !selectedDepts.includes(emp.departmentId)) {
      items.push({ id: empId, name: getEmployeeFullName(emp), isDept: false });
    }
  });

  if (items.length === 0) return '';

  return `
    <div class="selected-summary">
      <span class="selected-summary__label">Выбрано:</span>
      <div class="chips">
        ${items
          .map(
            (item) => `
          <span class="chip ${item.isDept ? 'chip--department' : ''}">
            ${escapeHtml(item.name)}
            <button 
              class="chip__remove" 
              onclick="${item.isDept ? `removeDepartmentFromTask(${item.deptId})` : `removeEmployeeFromTask(${item.id})`}"
            >×</button>
          </span>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

// ===== EVENT HANDLERS =====

function handleTaskFormChange(field, value) {
  setState(`taskForm.${field}`, value, true);
}

function toggleProjectExpand(projectId) {
  const expanded = getState('expandedProjects') || [];
  const isExpanded = expanded.includes(projectId);
  console.log('[toggleProjectExpand] id=', projectId, 'action=', isExpanded ? 'collapse' : 'expand');
  if (isExpanded) {
    setState(
      'expandedProjects',
      expanded.filter((id) => id !== projectId),
      true
    );
  } else {
    setState('expandedProjects', [...expanded, projectId], true);
  }

  // Обновляем DOM напрямую
  toggleTreeNodeExpand(projectId, !isExpanded);
  haptic.light();
}

function toggleDepartmentExpand(deptId) {
  const expanded = getState('expandedDepartments') || [];
  const isExpanded = expanded.includes(deptId);
  console.log('[toggleDepartmentExpand] id=', deptId, 'action=', isExpanded ? 'collapse' : 'expand');
  if (isExpanded) {
    setState(
      'expandedDepartments',
      expanded.filter((id) => id !== deptId),
      true
    );
  } else {
    setState('expandedDepartments', [...expanded, deptId], true);
  }

  // Обновляем DOM напрямую
  toggleDeptNodeExpand(deptId, !isExpanded);
  haptic.light();
}
// Обновление DOM без перезагрузки страницы
function toggleTreeNodeExpand(nodeId, expand) {
  console.log('[toggleTreeNodeExpand] id=', nodeId, 'expand=', expand);
  const toggle = document.querySelector(`[onclick="toggleProjectExpand(${nodeId})"]`);
  if (toggle) {
    toggle.classList.toggle('expanded', expand);
    const children = toggle.closest('.tree-node')?.querySelector('.tree-node__children');
    if (children) {
      children.classList.toggle('expanded', expand);
    }
  }
}

function toggleDeptNodeExpand(deptId, expand) {
  console.log('[toggleDeptNodeExpand] id=', deptId, 'expand=', expand);
  const header = document.querySelector(`[onclick="toggleDepartmentExpand(${deptId})"]`);
  if (header) {
    const toggle = header.querySelector('.tree-node__toggle');
    if (toggle) {
      toggle.classList.toggle('expanded', expand);
    }
    const list = header
      .closest('.employee-department')
      ?.querySelector('.employee-department__list');
    if (list) {
      list.classList.toggle('expanded', expand);
    }
  }
}

function toggleProjectSelection(projectId, checked) {
  // Preserve scroll position of project list to avoid jump on re-render
  const projectSelector = document.querySelector('.project-selector');
  const projectSelectorScroll = projectSelector ? projectSelector.scrollTop : 0;

  const selected = getState('taskForm.selectedProjects') || [];
  const projects = getState('projects') || [];
  console.debug('[toggleProjectSelection] start', { projectId, checked, selectedBefore: selected });

  if (checked) {
    // Add the project and all its descendants
    const descendants = getDescendantIds(projects, projectId);
    console.debug('[toggleProjectSelection] descendants=', descendants);

    let newSelected = [...new Set([...selected, projectId, ...descendants])];

    // For each ancestor, if all its descendants are selected, mark the ancestor selected too
    const ancestors = getAncestorIds(projects, projectId);
    console.debug('[toggleProjectSelection] ancestors=', ancestors);
    ancestors.forEach((ancestorId) => {
      const ancestorDesc = getDescendantIds(projects, ancestorId);
      const allDescSelected = ancestorDesc.every((id) => newSelected.includes(id));
      if (allDescSelected) newSelected.push(ancestorId);
    });

    const finalSelection = Array.from(new Set(newSelected));
    console.debug('[toggleProjectSelection] finalSelection(add)=', finalSelection);
    setState('taskForm.selectedProjects', finalSelection);
    requestAnimationFrame(() => {
      const sel = document.querySelector('.project-selector');
      if (sel) sel.scrollTop = projectSelectorScroll;
    });
  } else {
    // Remove the project and all its descendants
    const descendants = getDescendantIds(projects, projectId);
    console.debug('[toggleProjectSelection] descendants=', descendants);

    let newSelected = selected.filter((id) => id !== projectId && !descendants.includes(id));

    // For each ancestor, if not all descendants are selected anymore, ensure ancestor is not selected
    const ancestors = getAncestorIds(projects, projectId);
    console.debug('[toggleProjectSelection] ancestors=', ancestors);
    ancestors.forEach((ancestorId) => {
      const ancestorDesc = getDescendantIds(projects, ancestorId);
      const allDescSelected = ancestorDesc.every((id) => newSelected.includes(id));
      if (!allDescSelected) {
        newSelected = newSelected.filter((id) => id !== ancestorId);
      }
    });

    const finalSelection = Array.from(new Set(newSelected));
    console.debug('[toggleProjectSelection] finalSelection(remove)=', finalSelection);
    setState('taskForm.selectedProjects', finalSelection);
    requestAnimationFrame(() => {
      const sel = document.querySelector('.project-selector');
      if (sel) sel.scrollTop = projectSelectorScroll;
    });
  }

  // Обновляем только секцию с выбранными, не всю страницу
  updateSelectedProjectsSummary();
  haptic.selection();
}

function toggleEmployeeSelection(employeeId, checked) {
  const selected = getState('taskForm.selectedEmployees') || [];

  if (checked) {
    if (!selected.includes(employeeId)) {
      setState('taskForm.selectedEmployees', [...selected, employeeId], true);
    }
  } else {
    setState(
      'taskForm.selectedEmployees',
      selected.filter((id) => id !== employeeId),
      true
    );
  }

  // Обновляем только секцию с выбранными
  updateSelectedEmployeesSummary();
  haptic.selection();
}

function toggleDepartmentSelection(deptId, checked) {
  const employees = getState('employees') || [];
  const selected = getState('taskForm.selectedEmployees') || [];
  const deptEmployees = employees.filter((e) => e.departmentId === deptId && e.isActive);
  const deptEmployeeIds = deptEmployees.map((e) => e.id);

  if (checked) {
    const newSelected = [...new Set([...selected, ...deptEmployeeIds])];
    setState('taskForm.selectedEmployees', newSelected, true);
  } else {
    setState(
      'taskForm.selectedEmployees',
      selected.filter((id) => !deptEmployeeIds.includes(id)),
      true
    );
  }

  updateSelectedEmployeesSummary();
  haptic.selection();
}

// Выбор всего отдела (отображается как единица, а не отдельные сотрудники)
function toggleDepartmentAllSelection(deptId, checked) {
  const selectedDepts = getState('taskForm.selectedDepartmentsAll') || [];
  const selectedEmps = getState('taskForm.selectedEmployees') || [];
  const employees = getState('employees') || [];
  const deptEmployeeIds = employees
    .filter((e) => e.departmentId === deptId && e.isActive)
    .map((e) => e.id);

  if (checked) {
    // Добавляем отдел в выбранные
    if (!selectedDepts.includes(deptId)) {
      setState('taskForm.selectedDepartmentsAll', [...selectedDepts, deptId], true);
    }
    // Удаляем отдельных сотрудников этого отдела из списка
    setState(
      'taskForm.selectedEmployees',
      selectedEmps.filter((id) => !deptEmployeeIds.includes(id)),
      true
    );
  } else {
    // Убираем отдел из выбранных
    setState(
      'taskForm.selectedDepartmentsAll',
      selectedDepts.filter((id) => id !== deptId),
      true
    );
  }

  updateSelectedEmployeesSummary();
  haptic.selection();
}

function removeDepartmentFromTask(deptId) {
  const selectedDepts = getState('taskForm.selectedDepartmentsAll') || [];
  setState(
    'taskForm.selectedDepartmentsAll',
    selectedDepts.filter((id) => id !== deptId)
  );
  haptic.light();
}

// Выбор всех проектов
function toggleAllProjectsSelection() {
  // Preserve scroll position of project list to avoid jump on re-render
  const projectSelector = document.querySelector('.project-selector');
  const projectSelectorScroll = projectSelector ? projectSelector.scrollTop : 0;

  const isAllSelected = getState('taskForm.allProjectsSelected');

  if (isAllSelected) {
    // Снимаем "все проекты"
    setState('taskForm.allProjectsSelected', false);
  } else {
    // Выбираем все проекты
    setState('taskForm.allProjectsSelected', true);
    setState('taskForm.selectedProjects', [], true);
  }

  requestAnimationFrame(() => {
    const sel = document.querySelector('.project-selector');
    if (sel) sel.scrollTop = projectSelectorScroll;
  });

  haptic.selection();
}

function clearProjectSelection() {
  // Preserve scroll position of project list to avoid jump on re-render
  const projectSelector = document.querySelector('.project-selector');
  const projectSelectorScroll = projectSelector ? projectSelector.scrollTop : 0;

  setState('taskForm.selectedProjects', []);
  setState('taskForm.allProjectsSelected', false);

  requestAnimationFrame(() => {
    const sel = document.querySelector('.project-selector');
    if (sel) sel.scrollTop = projectSelectorScroll;
  });

  haptic.light();
}

function clearEmployeeSelection() {
  setState('taskForm.selectedEmployees', []);
  setState('taskForm.selectedDepartmentsAll', []);
  haptic.light();
}

// Функции для обновления только summary без перезагрузки страницы
function updateSelectedProjectsSummary() {
  // Не перезагружаем страницу - summary обновится при следующем действии
}

function updateSelectedEmployeesSummary() {
  // Не перезагружаем страницу - summary обновится при следующем действии
}

function removeProjectFromTask(projectId) {
  // Preserve scroll position of project list to avoid jump on re-render
  const projectSelector = document.querySelector('.project-selector');
  const projectSelectorScroll = projectSelector ? projectSelector.scrollTop : 0;

  const selected = getState('taskForm.selectedProjects') || [];
  setState(
    'taskForm.selectedProjects',
    selected.filter((id) => id !== projectId)
  );

  requestAnimationFrame(() => {
    const sel = document.querySelector('.project-selector');
    if (sel) sel.scrollTop = projectSelectorScroll;
  });

  haptic.light();
}

function removeEmployeeFromTask(employeeId) {
  const selected = getState('taskForm.selectedEmployees') || [];
  setState(
    'taskForm.selectedEmployees',
    selected.filter((id) => id !== employeeId)
  );
  haptic.light();
}

function clearTaskForm() {
  showConfirm({
    title: 'Очистить форму?',
    message: 'Все введённые данные будут удалены',
    icon: '🗑️',
    confirmText: 'Очистить',
    confirmClass: 'btn--danger',
    onConfirm: () => {
      resetTaskForm();
      showToast('Форма очищена', 'info');
      haptic.success();
    },
  });
}

function previewTask() {
  const form = getState('taskForm');

  // Валидация
  const errors = [];

  if (!form.title || form.title.trim().length < 3) {
    errors.push('Введите название задачи (минимум 3 символа)');
  }

  const hasProjects =
    form.allProjectsSelected || (form.selectedProjects && form.selectedProjects.length > 0);
  if (!hasProjects) {
    errors.push('Выберите хотя бы один проект');
  }

  const hasEmployees =
    (form.selectedDepartmentsAll && form.selectedDepartmentsAll.length > 0) ||
    (form.selectedEmployees && form.selectedEmployees.length > 0);
  if (!hasEmployees) {
    errors.push('Выберите хотя бы одного исполнителя');
  }

  if (!form.scheduledDate) {
    errors.push('Выберите дату');
  }

  if (!form.scheduledTime) {
    errors.push('Укажите время');
  }

  if (errors.length > 0) {
    showToast(errors[0], 'error');
    haptic.error();
    return;
  }

  // Показываем превью
  showTaskPreviewModal();
}

function showTaskPreviewModal() {
  const form = getState('taskForm');
  const departments = getState('departments') || [];
  const employees = getState('employees') || [];

  // Получаем названия проектов
  const projectsDisplay = form.allProjectsSelected
    ? 'Все проекты'
    : getProjectNames(form.selectedProjects).join(', ');

  // Получаем названия исполнителей
  const employeeItems = [];

  // Добавляем отделы
  (form.selectedDepartmentsAll || []).forEach((deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    if (dept) {
      const empCount = employees.filter((e) => e.departmentId === deptId && e.isActive).length;
      employeeItems.push(`${dept.name} (${empCount} чел.)`);
    }
  });

  // Добавляем отдельных сотрудников
  const selectedDepts = form.selectedDepartmentsAll || [];
  (form.selectedEmployees || []).forEach((empId) => {
    const emp = employees.find((e) => e.id === empId);
    if (emp && !selectedDepts.includes(emp.departmentId)) {
      employeeItems.push(getEmployeeFullName(emp));
    }
  });

  const employeesDisplay = employeeItems.join(', ');
  const isEditing = form.editingTaskId !== null;

  showModal({
    title: isEditing ? 'Сохранить изменения?' : 'Создать задачу?',
    content: `
      <div class="task-preview">
        <div class="task-preview__header">
          <h3 class="task-preview__title">${escapeHtml(form.title)}</h3>
        </div>
        
        <div class="task-preview__meta">
          <div class="task-preview__meta-item">
            <span>📅</span>
            <span>${formatDate(form.scheduledDate, 'long')} в ${form.scheduledTime}</span>
          </div>
          <div class="task-preview__meta-item">
            <span>📁</span>
            <span>${projectsDisplay}</span>
          </div>
          <div class="task-preview__meta-item">
            <span>👥</span>
            <span>${employeesDisplay}</span>
          </div>
        </div>
        
        ${
          form.description
            ? `
          <div class="task-preview__description">${escapeHtml(form.description)}</div>
        `
            : ''
        }
      </div>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn--primary" onclick="saveTask()">${isEditing ? 'Сохранить' : 'Создать'}</button>
    `,
  });
}

async function saveTask() {
  const form = getState('taskForm');
  const isEditing = form.editingTaskId !== null;

  closeModal();
  setState('loading', true);

  try {
    const taskData = {
      title: form.title.trim(),
      description: form.description.trim(),
      projectIds: form.selectedProjects,
      assigneeIds: form.selectedEmployees,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      priority: 'normal',
      creatorId: getState('currentUser.telegramId'),
    };

    if (isEditing) {
      await API.updateTask(form.editingTaskId, taskData);
      showToast('Задача обновлена', 'success');
    } else {
      await API.createTask(taskData);
      showToast('Задача создана', 'success');
    }

    resetTaskForm();
    haptic.success();
  } catch (error) {
    console.error('Error saving task:', error);
    showToast('Ошибка сохранения', 'error');
    haptic.error();
  } finally {
    setState('loading', false);
  }
}

// Загрузка задачи для редактирования
function loadTaskForEdit(taskId) {
  const task = findInArray('tasks', taskId);

  if (!task) {
    showToast('Задача не найдена', 'error');
    return;
  }

  setState('taskForm', {
    selectedProjects: [...task.projectIds],
    selectedEmployees: [...task.assigneeIds],
    scheduledDate: task.scheduledDate,
    scheduledTime: task.scheduledTime,
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    editingTaskId: taskId,
    calendarMonth: task.scheduledDate ? task.scheduledDate.slice(0, 7) : null,
  });

  navigateTo('tasks');
  showToast('Редактирование задачи', 'info');
}

// Export
window.renderTasksPage = renderTasksPage;
window.handleTaskFormChange = handleTaskFormChange;
window.toggleProjectExpand = toggleProjectExpand;
window.toggleDepartmentExpand = toggleDepartmentExpand;
window.toggleProjectSelection = toggleProjectSelection;
window.toggleEmployeeSelection = toggleEmployeeSelection;
window.toggleDepartmentSelection = toggleDepartmentSelection;
window.toggleDepartmentAllSelection = toggleDepartmentAllSelection;
window.toggleAllProjectsSelection = toggleAllProjectsSelection;
window.clearProjectSelection = clearProjectSelection;
window.clearEmployeeSelection = clearEmployeeSelection;
window.removeProjectFromTask = removeProjectFromTask;
window.removeEmployeeFromTask = removeEmployeeFromTask;
window.removeDepartmentFromTask = removeDepartmentFromTask;
window.clearTaskForm = clearTaskForm;
window.previewTask = previewTask;
window.saveTask = saveTask;
window.loadTaskForEdit = loadTaskForEdit;
window.changeCalendarMonth = changeCalendarMonth;
window.selectCalendarDate = selectCalendarDate;
window.handleDateTextInput = handleDateTextInput;
window.handleTimeTextInput = handleTimeTextInput;
window.applyDateInput = applyDateInput;
window.setCalendarMonth = setCalendarMonth;
window.setCalendarYear = setCalendarYear;
