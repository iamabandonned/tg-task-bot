/* ============================================
   TREE BUILDER - Hierarchical Data Structures
   ============================================ */

/**
 * Построить дерево из плоского массива
 * @param {Array} items - Плоский массив с parentId
 * @param {number|null} parentId - ID родителя (null для корневых)
 * @returns {Array} Дерево с children
 */
function buildTree(items, parentId = null) {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item) => ({
      ...item,
      children: buildTree(items, item.id),
    }));
}

/**
 * Преобразовать дерево обратно в плоский массив
 * @param {Array} tree - Дерево с children
 * @returns {Array} Плоский массив
 */
function flattenTree(tree) {
  const result = [];

  function traverse(nodes) {
    nodes.forEach((node) => {
      const { children, ...rest } = node;
      result.push(rest);
      if (children && children.length > 0) {
        traverse(children);
      }
    });
  }

  traverse(tree);
  return result;
}

/**
 * Найти элемент в дереве по ID
 * @param {Array} tree - Дерево
 * @param {number} id - ID для поиска
 * @returns {object|null} Найденный элемент
 */
function findInTree(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Получить всех потомков элемента
 * @param {Array} items - Плоский массив
 * @param {number} parentId - ID родителя
 * @returns {Array} Массив ID всех потомков
 */
function getDescendantIds(items, parentId) {
  const result = [];

  function findChildren(pid) {
    items.forEach((item) => {
      if (item.parentId === pid) {
        result.push(item.id);
        findChildren(item.id);
      }
    });
  }

  findChildren(parentId);
  return result;
}

/**
 * Получить всех предков элемента
 * @param {Array} items - Плоский массив
 * @param {number} itemId - ID элемента
 * @returns {Array} Массив ID всех предков
 */
function getAncestorIds(items, itemId) {
  const result = [];
  let currentItem = items.find((i) => i.id === itemId);

  while (currentItem && currentItem.parentId !== null) {
    result.push(currentItem.parentId);
    currentItem = items.find((i) => i.id === currentItem.parentId);
  }

  return result;
}

/**
 * Получить путь к элементу (breadcrumb)
 * @param {Array} items - Плоский массив
 * @param {number} itemId - ID элемента
 * @returns {Array} Массив элементов от корня до элемента
 */
function getPath(items, itemId) {
  const path = [];
  let currentItem = items.find((i) => i.id === itemId);

  while (currentItem) {
    path.unshift(currentItem);
    if (currentItem.parentId === null) break;
    currentItem = items.find((i) => i.id === currentItem.parentId);
  }

  return path;
}

/**
 * Получить глубину элемента в дереве
 * @param {Array} items - Плоский массив
 * @param {number} itemId - ID элемента
 * @returns {number} Глубина (0 для корневых)
 */
function getDepth(items, itemId) {
  let depth = 0;
  let currentItem = items.find((i) => i.id === itemId);

  while (currentItem && currentItem.parentId !== null) {
    depth++;
    currentItem = items.find((i) => i.id === currentItem.parentId);
  }

  return depth;
}

/**
 * Проверить, является ли элемент потомком другого
 * @param {Array} items - Плоский массив
 * @param {number} childId - ID потенциального потомка
 * @param {number} parentId - ID потенциального предка
 * @returns {boolean}
 */
function isDescendantOf(items, childId, parentId) {
  return getAncestorIds(items, childId).includes(parentId);
}

/**
 * Фильтрация дерева с сохранением структуры
 * @param {Array} tree - Дерево
 * @param {Function} predicate - Функция фильтрации
 * @returns {Array} Отфильтрованное дерево
 */
function filterTree(tree, predicate) {
  return tree
    .map((node) => {
      const filteredChildren = node.children ? filterTree(node.children, predicate) : [];

      // Показываем узел если он сам подходит под фильтр
      // или если у него есть подходящие дети
      if (predicate(node) || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Поиск в дереве проектов
 * @param {Array} projects - Массив проектов
 * @param {string} query - Поисковый запрос
 * @returns {Array} Отфильтрованное дерево
 */
function searchProjects(projects, query) {
  if (!query || query.trim() === '') {
    return buildTree(projects);
  }

  const lowerQuery = query.toLowerCase();

  // Находим все проекты, которые соответствуют запросу
  const matchingIds = new Set();

  projects.forEach((project) => {
    if (
      project.name.toLowerCase().includes(lowerQuery) ||
      (project.description && project.description.toLowerCase().includes(lowerQuery))
    ) {
      // Добавляем сам проект и всех его предков
      matchingIds.add(project.id);
      getAncestorIds(projects, project.id).forEach((id) => matchingIds.add(id));
    }
  });

  // Фильтруем и строим дерево
  const filteredProjects = projects.filter((p) => matchingIds.has(p.id));
  return buildTree(filteredProjects);
}

/**
 * Группировка сотрудников по отделам
 * @param {Array} employees - Массив сотрудников
 * @param {Array} departments - Массив отделов
 * @returns {Array} Отделы с сотрудниками
 */
function groupEmployeesByDepartment(employees, departments) {
  return departments
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((dept) => ({
      ...dept,
      employees: employees
        .filter((emp) => emp.departmentId === dept.id)
        .sort((a, b) => a.lastName.localeCompare(b.lastName, 'ru')),
    }));
}

/**
 * Поиск сотрудников
 * @param {Array} employees - Массив сотрудников
 * @param {string} query - Поисковый запрос
 * @returns {Array} Отфильтрованные сотрудники
 */
function searchEmployees(employees, query) {
  if (!query || query.trim() === '') {
    return employees;
  }

  const lowerQuery = query.toLowerCase();

  return employees.filter(
    (emp) =>
      emp.firstName.toLowerCase().includes(lowerQuery) ||
      emp.lastName.toLowerCase().includes(lowerQuery) ||
      emp.email.toLowerCase().includes(lowerQuery) ||
      (emp.position && emp.position.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Получить имена проектов по ID
 * @param {Array} projectIds - Массив ID проектов
 * @returns {Array} Массив имён
 */
function getProjectNames(projectIds) {
  const projects = getState('projects') || [];
  return projectIds.map((id) => {
    const project = projects.find((p) => p.id === id);
    return project ? project.name : 'Неизвестный проект';
  });
}

/**
 * Получить имена сотрудников по ID
 * @param {Array} employeeIds - Массив ID сотрудников
 * @returns {Array} Массив полных имён
 */
function getEmployeeNames(employeeIds) {
  const employees = getState('employees') || [];
  return employeeIds.map((id) => {
    const employee = employees.find((e) => e.id === id);
    return employee ? getEmployeeFullName(employee) : 'Неизвестный сотрудник';
  });
}

// Export
window.buildTree = buildTree;
window.flattenTree = flattenTree;
window.findInTree = findInTree;
window.getDescendantIds = getDescendantIds;
window.getAncestorIds = getAncestorIds;
window.getPath = getPath;
window.getDepth = getDepth;
window.isDescendantOf = isDescendantOf;
window.filterTree = filterTree;
window.searchProjects = searchProjects;
window.groupEmployeesByDepartment = groupEmployeesByDepartment;
window.searchEmployees = searchEmployees;
window.getProjectNames = getProjectNames;
window.getEmployeeNames = getEmployeeNames;
