/* ============================================
   PAGE 2: ПРОЕКТЫ (Иерархическая структура)
   ============================================ */

function renderProjectsPage() {
  const projects = getState('projects') || [];
  const searchQuery = getState('projectSearchQuery') || '';
  const expandedProjects = getState('expandedProjects') || [];

  // Строим дерево проектов
  const tree = buildProjectTree(projects);

  // Фильтруем если есть поиск
  let filteredTree = tree;
  if (searchQuery) {
    filteredTree = filterProjectTree(tree, searchQuery.toLowerCase());
  }

  const html = `
    <div class="projects-page">
      <!-- Toolbar -->
      <div class="projects-page__toolbar">
        ${renderSearchBar({
          id: 'project-search',
          placeholder: 'Поиск проектов...',
          value: searchQuery,
          onInput: 'handleProjectSearch(this.value)',
          onClear: 'clearProjectSearch()',
        })}
        
        <button 
          class="btn btn--primary btn--icon" 
          onclick="showAddProjectModal()"
          title="Создать проект"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      
      <!-- Projects Tree -->
      <div class="projects-tree">
        ${
          filteredTree.length > 0
            ? filteredTree
                .map((project) => renderProjectNode(project, expandedProjects, 0))
                .join('')
            : renderEmptyState({
                icon: '📁',
                title: searchQuery ? 'Проекты не найдены' : 'Нет проектов',
                text: searchQuery
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Создайте первый проект',
                action: !searchQuery
                  ? '<button class="btn btn--primary" onclick="showAddProjectModal()">Создать проект</button>'
                  : '',
              })
        }
      </div>
    </div>
  `;

  return html;
}

function buildProjectTree(projects) {
  const map = {};
  const roots = [];

  // Создаём карту
  projects.forEach((p) => {
    map[p.id] = { ...p, children: [] };
  });

  // Строим дерево
  projects.forEach((p) => {
    if (p.parentId && map[p.parentId]) {
      map[p.parentId].children.push(map[p.id]);
    } else if (!p.parentId) {
      roots.push(map[p.id]);
    }
  });

  return roots;
}

function filterProjectTree(tree, query) {
  return tree.filter((node) => {
    const matches =
      node.name.toLowerCase().includes(query) ||
      (node.description && node.description.toLowerCase().includes(query));

    if (node.children && node.children.length > 0) {
      node.children = filterProjectTree(node.children, query);
      return matches || node.children.length > 0;
    }

    return matches;
  });
}

function renderProjectNode(project, expandedProjects, level) {
  const hasChildren = project.children && project.children.length > 0;
  const isExpanded = expandedProjects.includes(project.id);
  const tasks = getState('tasks') || [];

  // Подсчёт задач
  const projectTasks = tasks.filter((t) => {
    if (t.projectIds) return t.projectIds.includes(project.id);
    return t.projectId === project.id;
  });
  const completedTasks = projectTasks.filter((t) => t.status === 'completed').length;
  const totalTasks = projectTasks.length;

  const childrenHtml =
    hasChildren && isExpanded
      ? `<div class="project-children ${isExpanded ? 'expanded' : ''}">
        ${project.children.map((child) => renderProjectNode(child, expandedProjects, level + 1)).join('')}
       </div>`
      : '';

  return `
    <div class="project-node" data-id="${project.id}" data-level="${level}">
      <div class="project-node__header">
        <!-- Toggle -->
        <span 
          class="project-node__toggle ${isExpanded ? 'expanded' : ''} ${!hasChildren ? 'project-node__toggle--hidden' : ''}"
          onclick="toggleProjectExpand(${project.id})"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
        
        <!-- Color & Name -->
        <div class="project-node__content" onclick="${hasChildren ? `toggleProjectExpand(${project.id})` : `showEditProjectModal(${project.id})`}">
          <div class="project-node__color" style="background: ${project.color || 'var(--color-primary)'}"></div>
          <div class="project-node__info">
            <div class="project-node__name">${escapeHtml(project.name)}</div>
            <div class="project-node__meta">
              ${totalTasks > 0 ? `${completedTasks}/${totalTasks} задач` : 'Нет задач'}
              ${hasChildren ? ` • ${project.children.length} подпроектов` : ''}
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="project-node__actions">
          <button 
            class="project-node__action" 
            onclick="event.stopPropagation(); confirmDeleteProject(${project.id})"
            title="Удалить"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <button 
            class="project-node__action" 
            onclick="event.stopPropagation(); showEditProjectModal(${project.id})"
            title="Редактировать"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            class="project-node__action project-node__action--add" 
            onclick="event.stopPropagation(); showAddSubprojectModal(${project.id})"
            title="Добавить подпроект"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
      
      ${childrenHtml}
    </div>
  `;
}

// ===== EVENT HANDLERS =====

function handleProjectSearch(query) {
  setState('projectSearchQuery', query);
}

function clearProjectSearch() {
  setState('projectSearchQuery', '');
}

function toggleProjectExpand(projectId) {
  const expanded = getState('expandedProjects') || [];
  if (expanded.includes(projectId)) {
    setState(
      'expandedProjects',
      expanded.filter((id) => id !== projectId)
    );
  } else {
    setState('expandedProjects', [...expanded, projectId]);
  }
  haptic.light();
}

// ===== PROJECT MODALS =====

function showAddProjectModal(parentId = null) {
  const parentProject = parentId ? findInArray('projects', parentId) : null;

  // Цвет: от родителя или случайный незанятый
  let defaultColor;
  if (parentProject) {
    defaultColor = parentProject.color || '#3B82F6';
  } else {
    defaultColor = getRandomUnusedColor();
  }

  setState('selectedProjectColor', defaultColor, true);

  showModal({
    title: parentId ? `Подпроект для "${parentProject?.name}"` : 'Новый проект',
    content: `
      <form id="project-form" class="modal-form">
        <input type="hidden" id="projectParentId" value="${parentId || ''}">
        
        <div class="form-group">
          <label class="form-label form-label--required">Название</label>
          <input 
            type="text" 
            class="input" 
            id="projectName"
            placeholder="Название проекта"
            required
          >
        </div>
        
        <div class="form-group">
          <label class="form-label">Описание</label>
          <textarea 
            class="input textarea" 
            id="projectDescription"
            placeholder="Описание проекта"
            rows="2"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">Цвет</label>
          <div class="color-picker" id="colorPicker">
            ${renderColorOptions()}
          </div>
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn--primary" onclick="saveProject()">Создать</button>
    `,
  });

  setTimeout(() => document.getElementById('projectName')?.focus(), 100);
}

function showAddSubprojectModal(parentId) {
  showAddProjectModal(parentId);
}

function showEditProjectModal(projectId) {
  const project = findInArray('projects', projectId);
  if (!project) return;

  setState('selectedProjectColor', project.color || '#3B82F6', true);

  const tasks = getState('tasks') || [];
  const projects = getState('projects') || [];
  const hasTasks = tasks.some((t) => {
    if (t.projectIds) return t.projectIds.includes(projectId);
    return t.projectId === projectId;
  });
  const hasChildren = projects.some((p) => p.parentId === projectId);

  showModal({
    title: 'Редактировать проект',
    content: `
      <form id="project-form" class="modal-form">
        <input type="hidden" id="projectId" value="${project.id}">
        <input type="hidden" id="projectParentId" value="${project.parentId || ''}">
        
        <div class="form-group">
          <label class="form-label form-label--required">Название</label>
          <input 
            type="text" 
            class="input" 
            id="projectName"
            value="${escapeHtml(project.name)}"
            required
          >
        </div>
        
        <div class="form-group">
          <label class="form-label">Описание</label>
          <textarea 
            class="input textarea" 
            id="projectDescription"
            rows="2"
          >${escapeHtml(project.description || '')}</textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">Цвет</label>
          <div class="color-picker" id="colorPicker">
            ${renderColorOptions(project.color)}
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="form-group">
          <button 
            type="button" 
            class="btn btn--danger btn--block" 
            onclick="confirmDeleteProject(${project.id})"
            ${hasTasks || hasChildren ? 'disabled' : ''}
          >
            Удалить проект
          </button>
          ${hasTasks ? '<p class="form-hint text-center">Есть активные задачи</p>' : ''}
          ${hasChildren ? '<p class="form-hint text-center">Есть подпроекты</p>' : ''}
        </div>
      </form>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn--primary" onclick="saveProject()">Сохранить</button>
    `,
  });
}

const PROJECT_COLORS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#EAB308',
  '#84CC16',
  '#22C55E',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#0EA5E9',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#A855F7',
  '#D946EF',
  '#EC4899',
];

function getRandomUnusedColor() {
  const projects = getState('projects') || [];
  const usedColors = projects.map((p) => p.color).filter(Boolean);
  const availableColors = PROJECT_COLORS.filter((c) => !usedColors.includes(c));

  if (availableColors.length > 0) {
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }
  return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
}

function renderColorOptions(selected = '#3B82F6') {
  const currentSelected = getState('selectedProjectColor') || selected;

  return PROJECT_COLORS.map(
    (color) => `
    <button 
      type="button" 
      class="color-option ${color === currentSelected ? 'color-option--selected' : ''}"
      style="background: ${color}"
      onclick="selectProjectColor('${color}')"
      data-color="${color}"
    ></button>
  `
  ).join('');
}

function selectProjectColor(color) {
  setState('selectedProjectColor', color, true);

  document.querySelectorAll('.color-option').forEach((opt) => {
    opt.classList.toggle('color-option--selected', opt.dataset.color === color);
  });

  haptic.light();
}

async function saveProject() {
  const projectId = document.getElementById('projectId')?.value;
  const parentId = document.getElementById('projectParentId')?.value;
  const name = document.getElementById('projectName')?.value?.trim();
  const description = document.getElementById('projectDescription')?.value?.trim();
  const color = getState('selectedProjectColor') || '#3B82F6';

  if (!name || name.length < 2) {
    showToast('Введите название (минимум 2 символа)', 'error');
    haptic.error();
    return;
  }

  closeModal();
  setState('loading', true);

  try {
    const projectData = {
      name,
      description,
      color,
      parentId: parentId ? parseInt(parentId) : null,
    };

    if (projectId) {
      await API.updateProject(parseInt(projectId), projectData);
      showToast('Проект обновлён', 'success');
    } else {
      const newProject = await API.createProject(projectData);
      // Раскрываем родителя если есть
      if (parentId) {
        const expanded = getState('expandedProjects') || [];
        if (!expanded.includes(parseInt(parentId))) {
          setState('expandedProjects', [...expanded, parseInt(parentId)], true);
        }
      }
      showToast('Проект создан', 'success');
    }

    haptic.success();
  } catch (error) {
    console.error('Error saving project:', error);
    showToast('Ошибка сохранения', 'error');
    haptic.error();
  } finally {
    setState('loading', false);
  }
}

function confirmDeleteProject(projectId) {
  const project = findInArray('projects', projectId);
  if (!project) return;

  const tasks = getState('tasks') || [];
  const projects = getState('projects') || [];
  const hasTasks = tasks.some((t) => {
    if (t.projectIds) return t.projectIds.includes(projectId);
    return t.projectId === projectId;
  });
  const hasChildren = projects.some((p) => p.parentId === projectId);

  if (hasTasks || hasChildren) {
    showToast('Сначала удалите подпроекты и задачи', 'error');
    return;
  }

  closeModal();

  showConfirm({
    title: 'Удалить проект?',
    message: `Проект "${project.name}" будет удалён`,
    icon: '🗑️',
    confirmText: 'Удалить',
    confirmClass: 'btn--danger',
    onConfirm: async () => {
      setState('loading', true);
      try {
        await API.deleteProject(projectId);
        showToast('Проект удалён', 'success');
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

// Export
window.renderProjectsPage = renderProjectsPage;
window.handleProjectSearch = handleProjectSearch;
window.clearProjectSearch = clearProjectSearch;
window.toggleProjectExpand = toggleProjectExpand;
window.showAddProjectModal = showAddProjectModal;
window.showAddSubprojectModal = showAddSubprojectModal;
window.showEditProjectModal = showEditProjectModal;
window.selectProjectColor = selectProjectColor;
window.saveProject = saveProject;
window.confirmDeleteProject = confirmDeleteProject;
