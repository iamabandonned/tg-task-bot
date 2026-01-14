/* ============================================
   API - Backend Stub (для будущей интеграции)
   ============================================ */

/**
 * API заглушка
 * В реальном приложении здесь будут fetch запросы к бэкенду
 * Сейчас все операции выполняются локально в памяти
 */

const API = {
  /**
   * Базовый URL (для будущего)
   */
  baseUrl: '/api',

  /**
   * Имитация задержки сети
   */
  delay: (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms)),

  // ===== TASKS =====

  async getTasks() {
    await this.delay();
    return getState('tasks') || [];
  },

  async getTask(id) {
    await this.delay();
    return findInArray('tasks', id);
  },

  async createTask(taskData) {
    await this.delay();

    const newTask = {
      id: generateId(),
      ...taskData,
      status: 'new',
      completedAt: null,
      remindersEnabled: true,
      lastReminderSent: null,
      nextReminderDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addToArray('tasks', newTask);
    return newTask;
  },

  async updateTask(id, updates) {
    await this.delay();

    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Если статус изменился на completed
    if (updates.status === 'completed') {
      updatedData.completedAt = new Date().toISOString();
    }

    updateInArray('tasks', id, updatedData);
    return findInArray('tasks', id);
  },

  async deleteTask(id) {
    await this.delay();
    removeFromArray('tasks', id);
    return { success: true };
  },

  async deleteTasks(ids) {
    await this.delay();
    const tasks = getState('tasks') || [];
    setState(
      'tasks',
      tasks.filter((t) => !ids.includes(t.id))
    );
    return { success: true };
  },

  // ===== PROJECTS =====

  async getProjects() {
    await this.delay();
    return getState('projects') || [];
  },

  async createProject(projectData) {
    await this.delay();

    const newProject = {
      id: generateId(),
      ...projectData,
      color: projectData.color || randomColor(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addToArray('projects', newProject);
    return newProject;
  },

  async updateProject(id, updates) {
    await this.delay();

    updateInArray('projects', id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return findInArray('projects', id);
  },

  async deleteProject(id) {
    await this.delay();

    // Удаляем все дочерние проекты
    const projects = getState('projects') || [];
    const descendantIds = getDescendantIds(projects, id);
    const idsToDelete = [id, ...descendantIds];

    setState(
      'projects',
      projects.filter((p) => !idsToDelete.includes(p.id))
    );
    return { success: true };
  },

  async deleteProjects(ids) {
    await this.delay();

    const projects = getState('projects') || [];

    // Собираем все ID включая потомков
    let allIds = [...ids];
    ids.forEach((id) => {
      const descendants = getDescendantIds(projects, id);
      allIds = [...allIds, ...descendants];
    });

    setState(
      'projects',
      projects.filter((p) => !allIds.includes(p.id))
    );
    return { success: true };
  },

  // ===== DEPARTMENTS =====

  async getDepartments() {
    await this.delay();
    return getState('departments') || [];
  },

  async createDepartment(deptData) {
    await this.delay();

    const newDept = {
      id: generateId(),
      ...deptData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addToArray('departments', newDept);
    return newDept;
  },

  async updateDepartment(id, updates) {
    await this.delay();

    updateInArray('departments', id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return findInArray('departments', id);
  },

  async deleteDepartment(id) {
    await this.delay();

    // Проверяем, есть ли сотрудники в отделе
    const employees = getState('employees') || [];
    const hasEmployees = employees.some((e) => e.departmentId === id);

    if (hasEmployees) {
      throw new Error('Нельзя удалить отдел с сотрудниками');
    }

    removeFromArray('departments', id);
    return { success: true };
  },

  // ===== EMPLOYEES =====

  async getEmployees() {
    await this.delay();
    return getState('employees') || [];
  },

  async createEmployee(empData) {
    await this.delay();

    const newEmployee = {
      id: generateId(),
      ...empData,
      isActive: true,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addToArray('employees', newEmployee);
    return newEmployee;
  },

  async updateEmployee(id, updates) {
    await this.delay();

    updateInArray('employees', id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return findInArray('employees', id);
  },

  async deleteEmployee(id) {
    await this.delay();

    // Проверяем, есть ли задачи у сотрудника
    const tasks = getState('tasks') || [];
    const hasTasks = tasks.some(
      (t) => t.assigneeIds.includes(id) && t.status !== 'completed' && t.status !== 'cancelled'
    );

    if (hasTasks) {
      // Деактивируем вместо удаления
      updateInArray('employees', id, { isActive: false });
      return { success: true, deactivated: true };
    }

    removeFromArray('employees', id);
    return { success: true };
  },

  async deleteEmployees(ids) {
    await this.delay();
    const employees = getState('employees') || [];
    setState(
      'employees',
      employees.filter((e) => !ids.includes(e.id))
    );
    return { success: true };
  },

  // ===== NOTIFICATIONS =====

  async getNotificationSettings() {
    await this.delay();
    return getState('notificationSettings');
  },

  async updateNotificationSettings(settings) {
    await this.delay();
    setState('notificationSettings', settings);
    return settings;
  },

  // ===== ANALYTICS =====

  async getAnalytics(filters = {}) {
    await this.delay();

    const tasks = getState('tasks') || [];
    const employees = getState('employees') || [];
    const projects = getState('projects') || [];

    // Фильтрация
    let filteredTasks = filterTasks(tasks, filters);

    // Статистика
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter((t) => t.status === 'completed').length;
    const tasksByStatus = countByStatus(filteredTasks);

    // По сотрудникам
    const tasksByEmployee = employees
      .map((emp) => {
        const empTasks = filteredTasks.filter((t) => t.assigneeIds.includes(emp.id));
        return {
          employee: emp,
          total: empTasks.length,
          completed: empTasks.filter((t) => t.status === 'completed').length,
          inProgress: empTasks.filter((t) => t.status === 'in_progress').length,
          overdue: empTasks.filter((t) => isOverdue(t.scheduledDate) && t.status !== 'completed')
            .length,
        };
      })
      .filter((item) => item.total > 0);

    // По проектам
    const tasksByProject = projects
      .map((proj) => {
        const projTasks = filteredTasks.filter((t) => t.projectIds.includes(proj.id));
        return {
          project: proj,
          total: projTasks.length,
          completed: projTasks.filter((t) => t.status === 'completed').length,
        };
      })
      .filter((item) => item.total > 0);

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      tasksByStatus,
      tasksByEmployee,
      tasksByProject,
    };
  },
};

// Export
window.API = API;
