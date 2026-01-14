/* ============================================
   PAGE 3: СОТРУДНИКИ
   ============================================ */

function renderEmployeesPage() {
  const departments = getState('departments') || [];
  const employees = getState('employees') || [];
  const searchQuery = getState('employeeSearchQuery') || '';

  // Фильтруем сотрудников
  const filteredEmployees = searchQuery ? searchEmployees(employees, searchQuery) : employees;

  // Группируем по отделам
  const grouped = groupEmployeesByDepartment(filteredEmployees, departments);

  const html = `
    <div class="employees-page">
      <!-- Toolbar -->
      <div class="employees-page__toolbar">
        ${renderSearchBar({
          id: 'employee-search',
          placeholder: 'Поиск сотрудников...',
          value: searchQuery,
          onInput: 'handleEmployeeSearch(this.value)',
          onClear: 'clearEmployeeSearch()',
        })}
        
        <button 
          class="btn btn--outline btn--icon" 
          onclick="showAddDepartmentModal()"
          title="Добавить отдел"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>
        </button>
        
        <button 
          class="btn btn--primary btn--icon" 
          onclick="showAddEmployeeModal()"
          title="Добавить сотрудника"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
        </button>
      </div>
      
      <!-- Departments & Employees -->
      ${
        grouped.length > 0
          ? grouped.map((dept) => renderDepartmentSection(dept)).join('')
          : renderEmptyState({
              icon: '👥',
              title: searchQuery ? 'Сотрудники не найдены' : 'Нет сотрудников',
              text: searchQuery
                ? 'Попробуйте изменить поисковый запрос'
                : 'Создайте отдел и добавьте сотрудников',
              action: !searchQuery
                ? '<button class="btn btn--primary" onclick="showAddDepartmentModal()">Создать отдел</button>'
                : '',
            })
      }
    </div>
  `;

  return html;
}

function renderDepartmentSection(dept) {
  const isExpanded = getState('expandedDepartments')?.includes(dept.id);
  const employeeCount = dept.employees.length;
  const activeCount = dept.employees.filter((e) => e.isActive).length;

  return `
    <div class="department-section">
      <div class="department-header" onclick="toggleDepartmentExpand(${dept.id})">
        <span class="department-header__toggle ${isExpanded ? 'expanded' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
        
        <div class="department-header__info">
          <div class="department-header__name">${escapeHtml(dept.name)}</div>
          <div class="department-header__count">
            ${activeCount} ${pluralize(activeCount, ['сотрудник', 'сотрудника', 'сотрудников'])}
            ${activeCount !== employeeCount ? ` (${employeeCount - activeCount} неакт.)` : ''}
          </div>
        </div>
        
        <div class="department-header__actions" onclick="event.stopPropagation()">
          <button 
            class="btn btn--ghost btn--sm" 
            onclick="showEditDepartmentModal(${dept.id})"
            title="Редактировать отдел"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            class="btn btn--ghost btn--sm" 
            onclick="showAddEmployeeModal(${dept.id})"
            title="Добавить сотрудника"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="department-employees ${isExpanded ? 'expanded' : ''}">
        ${
          dept.employees.length > 0
            ? dept.employees.map((emp) => renderEmployeeCard(emp)).join('')
            : '<p class="text-muted text-center p-4">Нет сотрудников в отделе</p>'
        }
      </div>
    </div>
  `;
}

function renderEmployeeCard(employee) {
  return `
    <div class="employee-card ${!employee.isActive ? 'employee-card--inactive' : ''}" 
         onclick="showEditEmployeeModal(${employee.id})">
      ${renderAvatar({ firstName: employee.firstName, lastName: employee.lastName })}
      
      <div class="employee-card__info">
        <div class="employee-card__name">
          ${escapeHtml(getEmployeeFullName(employee))}
          ${!employee.isActive ? renderBadge('Неактивен', 'neutral') : ''}
        </div>
        <div class="employee-card__details">
          <span>${escapeHtml(employee.position || 'Без должности')}</span>
          <br>
          <span class="employee-card__email">${escapeHtml(employee.email)}</span>
        </div>
      </div>
      
      <div class="employee-card__edit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </div>
    </div>
  `;
}

// ===== EVENT HANDLERS =====

function handleEmployeeSearch(query) {
  setState('employeeSearchQuery', query);
}

function clearEmployeeSearch() {
  setState('employeeSearchQuery', '');
}

function toggleDepartmentExpand(deptId) {
  const expanded = getState('expandedDepartments') || [];
  if (expanded.includes(deptId)) {
    setState(
      'expandedDepartments',
      expanded.filter((id) => id !== deptId)
    );
  } else {
    setState('expandedDepartments', [...expanded, deptId]);
  }
  haptic.light();
}

// ===== DEPARTMENT MODALS =====

function showAddDepartmentModal() {
  showModal({
    title: 'Новый отдел',
    content: `
      <form id="department-form" class="modal-form">
        <div class="form-group">
          <label class="form-label form-label--required">Название отдела</label>
          <input 
            type="text" 
            class="input" 
            id="departmentName"
            placeholder="Например: Отдел разработки"
            required
          >
        </div>
        
        <div class="form-group">
          <label class="form-label">Описание</label>
          <textarea 
            class="input textarea" 
            id="departmentDescription"
            placeholder="Описание отдела"
            rows="2"
          ></textarea>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn--primary" onclick="saveDepartment()">Создать</button>
    `,
  });

  setTimeout(() => document.getElementById('departmentName')?.focus(), 100);
}

function showEditDepartmentModal(deptId) {
  const dept = findInArray('departments', deptId);
  if (!dept) return;

  const employees = getState('employees') || [];
  const hasEmployees = employees.some((e) => e.departmentId === deptId);

  showModal({
    title: 'Редактировать отдел',
    content: `
      <form id="department-form" class="modal-form">
        <input type="hidden" id="departmentId" value="${dept.id}">
        
        <div class="form-group">
          <label class="form-label form-label--required">Название отдела</label>
          <input 
            type="text" 
            class="input" 
            id="departmentName"
            placeholder="Например: Отдел разработки"
            value="${escapeHtml(dept.name)}"
            required
          >
        </div>
        
        <div class="form-group">
          <label class="form-label">Описание</label>
          <textarea 
            class="input textarea" 
            id="departmentDescription"
            placeholder="Описание отдела"
            rows="2"
          >${escapeHtml(dept.description || '')}</textarea>
        </div>
        
        <div class="divider"></div>
        
        <div class="form-group">
          <button 
            type="button" 
            class="btn btn--danger btn--block" 
            onclick="confirmDeleteDepartment(${dept.id})"
            ${hasEmployees ? 'disabled title="Сначала удалите или переместите сотрудников"' : ''}
          >
            Удалить отдел
          </button>
          ${hasEmployees ? '<p class="form-hint text-center">Сначала удалите или переместите сотрудников</p>' : ''}
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn--primary" onclick="saveDepartment()">Сохранить</button>
    `,
  });
}

async function saveDepartment() {
  const deptId = document.getElementById('departmentId')?.value;
  const name = document.getElementById('departmentName')?.value?.trim();
  const description = document.getElementById('departmentDescription')?.value?.trim();

  const validation = validateDepartmentForm({ name });

  if (!validation.isValid) {
    showToast(Object.values(validation.errors)[0], 'error');
    haptic.error();
    return;
  }

  closeModal();
  setState('loading', true);

  try {
    const deptData = { name, description };

    if (deptId) {
      await API.updateDepartment(parseInt(deptId), deptData);
      showToast('Отдел обновлён', 'success');
    } else {
      await API.createDepartment(deptData);
      // Раскрываем новый отдел
      const newDept = getState('departments').find((d) => d.name === name);
      if (newDept) {
        const expanded = getState('expandedDepartments') || [];
        setState('expandedDepartments', [...expanded, newDept.id], true);
      }
      showToast('Отдел создан', 'success');
    }

    haptic.success();
  } catch (error) {
    console.error('Error saving department:', error);
    showToast('Ошибка сохранения', 'error');
    haptic.error();
  } finally {
    setState('loading', false);
  }
}

function confirmDeleteDepartment(deptId) {
  const dept = findInArray('departments', deptId);
  if (!dept) return;

  closeModal();

  showConfirm({
    title: 'Удалить отдел?',
    message: `Отдел "${dept.name}" будет удалён`,
    icon: '🗑️',
    confirmText: 'Удалить',
    confirmClass: 'btn--danger',
    onConfirm: async () => {
      setState('loading', true);
      try {
        await API.deleteDepartment(deptId);
        showToast('Отдел удалён', 'success');
        haptic.success();
      } catch (error) {
        showToast(error.message || 'Ошибка удаления', 'error');
        haptic.error();
      } finally {
        setState('loading', false);
      }
    },
  });
}

// ===== EMPLOYEE MODALS =====

function showAddEmployeeModal(departmentId = null) {
  const departments = getState('departments') || [];

  showModal({
    title: 'Новый сотрудник',
    content: `
      <form id="employee-form" class="modal-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label form-label--required">Имя</label>
            <input type="text" class="input" id="employeeFirstName" placeholder="Иван" required>
          </div>
          <div class="form-group">
            <label class="form-label form-label--required">Фамилия</label>
            <input type="text" class="input" id="employeeLastName" placeholder="Петров" required>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label form-label--required">Email</label>
          <input type="email" class="input" id="employeeEmail" placeholder="ivan@company.ru" required>
        </div>
        
        <div class="form-group">
          <label class="form-label form-label--required">Отдел</label>
          <select class="select" id="employeeDepartment" required>
            <option value="">Выберите отдел</option>
            ${departments
              .map(
                (d) => `
              <option value="${d.id}" ${d.id === departmentId ? 'selected' : ''}>${escapeHtml(d.name)}</option>
            `
              )
              .join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label form-label--required">Должность</label>
          <input type="text" class="input" id="employeePosition" placeholder="Менеджер">
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn--primary" onclick="saveEmployee()">Создать</button>
    `,
  });

  setTimeout(() => document.getElementById('employeeFirstName')?.focus(), 100);
}

function showEditEmployeeModal(employeeId) {
  const employee = findInArray('employees', employeeId);
  if (!employee) return;

  const departments = getState('departments') || [];

  showModal({
    title: 'Редактировать сотрудника',
    content: `
      <form id="employee-form" class="modal-form">
        <input type="hidden" id="employeeId" value="${employee.id}">
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label form-label--required">Имя</label>
            <input type="text" class="input" id="employeeFirstName" value="${escapeHtml(employee.firstName)}" required>
          </div>
          <div class="form-group">
            <label class="form-label form-label--required">Фамилия</label>
            <input type="text" class="input" id="employeeLastName" value="${escapeHtml(employee.lastName)}" required>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label form-label--required">Email</label>
          <input type="email" class="input" id="employeeEmail" value="${escapeHtml(employee.email)}" required>
        </div>
        
        <div class="form-group">
          <label class="form-label form-label--required">Отдел</label>
          <select class="select" id="employeeDepartment" required>
            ${departments
              .map(
                (d) => `
              <option value="${d.id}" ${d.id === employee.departmentId ? 'selected' : ''}>${escapeHtml(d.name)}</option>
            `
              )
              .join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label form-label--required">Должность</label>
          <input type="text" class="input" id="employeePosition" value="${escapeHtml(employee.position || '')}">
        </div>
        
        <div class="form-group">
          ${renderToggle({
            id: 'employeeActive',
            checked: employee.isActive,
            label: 'Активный сотрудник',
          })}
        </div>
        
        <div class="divider"></div>
        
        <div class="form-group">
          <button 
            type="button" 
            class="btn btn--danger btn--block" 
            onclick="confirmDeleteEmployee(${employee.id})"
          >
            Удалить сотрудника
          </button>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn--primary" onclick="saveEmployee()">Сохранить</button>
    `,
  });
}

async function saveEmployee() {
  const employeeId = document.getElementById('employeeId')?.value;
  const firstName = document.getElementById('employeeFirstName')?.value?.trim();
  const lastName = document.getElementById('employeeLastName')?.value?.trim();
  const email = document.getElementById('employeeEmail')?.value?.trim();
  const departmentId = parseInt(document.getElementById('employeeDepartment')?.value);
  const position = document.getElementById('employeePosition')?.value?.trim();
  const isActive = document.getElementById('employeeActive')?.checked ?? true;

  // Простая валидация
  if (!firstName || firstName.length < 2) {
    showToast('Введите имя (минимум 2 символа)', 'error');
    haptic.error();
    return;
  }

  if (!lastName || lastName.length < 2) {
    showToast('Введите фамилию (минимум 2 символа)', 'error');
    haptic.error();
    return;
  }

  if (!email || !isValidEmail(email)) {
    showToast('Введите корректный email', 'error');
    haptic.error();
    return;
  }

  if (!isEmailUnique(email, employeeId ? parseInt(employeeId) : null)) {
    showToast('Этот email уже используется', 'error');
    haptic.error();
    return;
  }

  if (!departmentId) {
    showToast('Выберите отдел', 'error');
    haptic.error();
    return;
  }

  closeModal();
  setState('loading', true);

  try {
    const empData = { firstName, lastName, email, departmentId, position, isActive };

    if (employeeId) {
      await API.updateEmployee(parseInt(employeeId), empData);
      showToast('Сотрудник обновлён', 'success');
    } else {
      await API.createEmployee(empData);
      showToast('Сотрудник добавлен', 'success');
    }

    haptic.success();
  } catch (error) {
    console.error('Error saving employee:', error);
    showToast('Ошибка сохранения', 'error');
    haptic.error();
  } finally {
    setState('loading', false);
  }
}

function confirmDeleteEmployee(employeeId) {
  const employee = findInArray('employees', employeeId);
  if (!employee) return;

  closeModal();

  showConfirm({
    title: 'Удалить сотрудника?',
    message: `${getEmployeeFullName(employee)} будет удалён`,
    icon: '🗑️',
    confirmText: 'Удалить',
    confirmClass: 'btn--danger',
    onConfirm: async () => {
      setState('loading', true);
      try {
        const result = await API.deleteEmployee(employeeId);
        if (result.deactivated) {
          showToast('Сотрудник деактивирован (есть активные задачи)', 'warning');
        } else {
          showToast('Сотрудник удалён', 'success');
        }
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
window.renderEmployeesPage = renderEmployeesPage;
window.handleEmployeeSearch = handleEmployeeSearch;
window.clearEmployeeSearch = clearEmployeeSearch;
window.toggleDepartmentExpand = toggleDepartmentExpand;
window.showAddDepartmentModal = showAddDepartmentModal;
window.showEditDepartmentModal = showEditDepartmentModal;
window.saveDepartment = saveDepartment;
window.confirmDeleteDepartment = confirmDeleteDepartment;
window.showAddEmployeeModal = showAddEmployeeModal;
window.showEditEmployeeModal = showEditEmployeeModal;
window.saveEmployee = saveEmployee;
window.confirmDeleteEmployee = confirmDeleteEmployee;
