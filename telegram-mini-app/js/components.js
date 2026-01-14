/* ============================================
   COMPONENTS - Reusable UI Components (JS)
   ============================================ */

// ===== TOAST =====

let toastTimeout = null;

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Очищаем предыдущий toast
  container.innerHTML = '';
  clearTimeout(toastTimeout);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type} toast-enter`;
  toast.innerHTML = `
    <span class="toast__icon">${icons[type] || icons.info}</span>
    <span class="toast__message">${escapeHtml(message)}</span>
    <button class="toast__close" onclick="hideToast()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  container.appendChild(toast);

  // Haptic feedback
  if (type === 'success') haptic.success();
  if (type === 'error') haptic.error();
  if (type === 'warning') haptic.warning();

  // Auto hide
  toastTimeout = setTimeout(() => hideToast(), duration);
}

function hideToast() {
  const container = document.getElementById('toast-container');
  const toast = container?.querySelector('.toast');

  if (toast) {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    setTimeout(() => {
      container.innerHTML = '';
    }, 250);
  }
}

// ===== MODAL =====

let currentModal = null;

function showModal(options) {
  const { title, content, footer, centered = false, onClose } = options;

  const container = document.getElementById('modal-container');
  if (!container) return;

  currentModal = { onClose };

  container.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal()"></div>
    <div class="modal ${centered ? 'modal--centered' : ''} modal-content">
      <div class="modal__header">
        <h2 class="modal__title">${escapeHtml(title)}</h2>
        <button class="modal__close" onclick="closeModal()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal__body">
        ${content}
      </div>
      ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
    </div>
  `;

  container.classList.remove('hidden');

  // Animate in
  requestAnimationFrame(() => {
    container.querySelector('.modal-backdrop').classList.add('visible');
    container.querySelector('.modal-content').classList.add('visible');
  });

  // Haptic
  haptic.light();
}

function closeModal() {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const backdrop = container.querySelector('.modal-backdrop');
  const modal = container.querySelector('.modal-content');

  if (backdrop) backdrop.classList.remove('visible');
  if (modal) modal.classList.remove('visible');

  setTimeout(() => {
    container.classList.add('hidden');
    container.innerHTML = '';

    if (currentModal?.onClose) {
      currentModal.onClose();
    }
    currentModal = null;
  }, 250);
}

// ===== CONFIRM DIALOG =====

function showConfirm(options) {
  const {
    title = 'Подтверждение',
    message,
    confirmText = 'Да',
    cancelText = 'Отмена',
    confirmClass = 'btn--primary',
    icon = '❓',
    onConfirm,
    onCancel,
  } = options;

  showModal({
    title: '',
    centered: true,
    content: `
      <div class="confirm-dialog">
        <div class="confirm-dialog__icon">${icon}</div>
        <h3 class="confirm-dialog__title">${escapeHtml(title)}</h3>
        <p class="confirm-dialog__message">${escapeHtml(message)}</p>
      </div>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="handleConfirmCancel()">${escapeHtml(cancelText)}</button>
      <button class="btn ${confirmClass}" onclick="handleConfirmOk()">${escapeHtml(confirmText)}</button>
    `,
    onClose: onCancel,
  });

  // Store callbacks
  window._confirmCallbacks = { onConfirm, onCancel };
}

function handleConfirmOk() {
  const callbacks = window._confirmCallbacks;
  closeModal();
  if (callbacks?.onConfirm) {
    callbacks.onConfirm();
  }
  window._confirmCallbacks = null;
}

function handleConfirmCancel() {
  const callbacks = window._confirmCallbacks;
  closeModal();
  if (callbacks?.onCancel) {
    callbacks.onCancel();
  }
  window._confirmCallbacks = null;
}

// ===== CHECKBOX COMPONENT =====

function renderCheckbox(options) {
  const {
    id,
    name,
    checked = false,
    label = '',
    indeterminate = false,
    onChange,
    disabled = false,
  } = options;

  const indeterminateClass = indeterminate ? 'checkbox--indeterminate' : '';
  const disabledAttr = disabled ? 'disabled' : '';

  return `
    <label class="checkbox ${indeterminateClass}">
      <input 
        type="checkbox" 
        class="checkbox__input" 
        id="${id}" 
        name="${name || id}"
        ${checked ? 'checked' : ''}
        ${disabledAttr}
        onchange="${onChange || ''}"
      >
      <span class="checkbox__box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
      ${label ? `<span class="checkbox__label">${escapeHtml(label)}</span>` : ''}
    </label>
  `;
}

// ===== TOGGLE SWITCH =====

function renderToggle(options) {
  const { id, name, checked = false, label = '', onChange, disabled = false } = options;

  return `
    <label class="toggle">
      <input 
        type="checkbox" 
        class="toggle__input" 
        id="${id}" 
        name="${name || id}"
        ${checked ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
        onchange="${onChange || ''}"
      >
      <span class="toggle__switch"></span>
      ${label ? `<span class="toggle__label">${escapeHtml(label)}</span>` : ''}
    </label>
  `;
}

// ===== SEARCH BAR =====

function renderSearchBar(options) {
  const { id = 'search', placeholder = 'Поиск...', value = '', onInput, onClear } = options;

  return `
    <div class="search-bar">
      <svg class="search-bar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input 
        type="text" 
        class="search-bar__input" 
        id="${id}"
        placeholder="${placeholder}"
        value="${escapeHtml(value)}"
        oninput="${onInput || ''}"
      >
      ${
        value
          ? `
        <button class="search-bar__clear" onclick="${onClear || ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `
          : ''
      }
    </div>
  `;
}

// ===== AVATAR =====

function renderAvatar(options) {
  const { src, firstName = '', lastName = '', size = 'md' } = options;

  const sizeClass = size === 'sm' ? 'avatar--sm' : size === 'lg' ? 'avatar--lg' : '';
  const initials = getInitials(firstName, lastName);

  if (src) {
    return `
      <div class="avatar ${sizeClass}">
        <img class="avatar__img" src="${escapeHtml(src)}" alt="${escapeHtml(firstName)}">
      </div>
    `;
  }

  return `
    <div class="avatar ${sizeClass}">${initials}</div>
  `;
}

// ===== BADGE =====

function renderBadge(text, variant = 'neutral') {
  return `<span class="badge badge--${variant}">${escapeHtml(text)}</span>`;
}

function renderStatusBadge(status) {
  const variants = {
    pending: 'primary',
    in_progress: 'warning',
    completed: 'success',
  };
  return renderBadge(getStatusLabel(status), variants[status] || 'neutral');
}

function renderPriorityBadge(priority) {
  const variants = {
    low: 'neutral',
    normal: 'primary',
    high: 'warning',
    urgent: 'error',
  };
  return renderBadge(getPriorityLabel(priority), variants[priority] || 'neutral');
}

// ===== EMPTY STATE =====

function renderEmptyState(options) {
  const { icon = '📭', title = 'Нет данных', text = '', action } = options;

  return `
    <div class="empty-state">
      <div class="empty-state__icon">${icon}</div>
      <h3 class="empty-state__title">${escapeHtml(title)}</h3>
      ${text ? `<p class="empty-state__text">${escapeHtml(text)}</p>` : ''}
      ${action ? action : ''}
    </div>
  `;
}

// ===== TREE NODE =====

function renderTreeNode(node, options = {}) {
  const {
    level = 0,
    expanded = true,
    showCheckbox = false,
    checkedIds = [],
    onToggle,
    onCheck,
    renderActions,
  } = options;

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded;
  const isChecked = checkedIds.includes(node.id);
  const isRoot = level === 0;

  const childrenHtml =
    hasChildren && isExpanded
      ? node.children
          .map((child) => renderTreeNode(child, { ...options, level: level + 1 }))
          .join('')
      : '';

  return `
    <div class="tree-node ${isRoot ? 'tree-node--root' : ''}" data-id="${node.id}">
      <div class="tree-node__header">
        <span 
          class="tree-node__toggle ${isExpanded ? 'expanded' : ''} ${!hasChildren ? 'tree-node__toggle--empty' : ''}"
          onclick="${onToggle ? onToggle + '(' + node.id + ')' : ''}"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
        
        ${
          showCheckbox
            ? renderCheckbox({
                id: `check-${node.id}`,
                checked: isChecked,
                onChange: onCheck ? `${onCheck}(${node.id})` : '',
              })
            : ''
        }
        
        <div class="tree-node__content">
          ${node.color ? `<span style="color: ${node.color}">●</span>` : ''}
          <span class="tree-node__name">${escapeHtml(node.name)}</span>
        </div>
        
        ${renderActions ? renderActions(node) : ''}
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

// ===== LOADER =====

function renderLoader(text = 'Загрузка...') {
  return `
    <div class="loading-screen" style="position: relative; height: 200px;">
      <div class="loading-spinner"></div>
      <p class="loading-text">${escapeHtml(text)}</p>
    </div>
  `;
}

// ===== STAT CARD =====

function renderStatCard(value, label, color = null) {
  const style = color ? `style="color: ${color}"` : '';
  return `
    <div class="stat-card">
      <div class="stat-card__value" ${style}>${value}</div>
      <div class="stat-card__label">${escapeHtml(label)}</div>
    </div>
  `;
}

// ===== PROGRESS BAR =====

function renderProgressBar(value, max = 100, variant = '') {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const variantClass = variant ? `progress--${variant}` : '';

  return `
    <div class="progress ${variantClass}">
      <div class="progress__bar" style="width: ${percent}%"></div>
    </div>
  `;
}

// ===== CHIPS =====

function renderChips(items, onRemove) {
  return items
    .map(
      (item) => `
    <span class="chip chip--primary">
      ${escapeHtml(typeof item === 'string' ? item : item.name)}
      ${
        onRemove
          ? `
        <button class="chip__remove" onclick="${onRemove}(${typeof item === 'string' ? `'${item}'` : item.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `
          : ''
      }
    </span>
  `
    )
    .join('');
}

// ===== ACTION BAR =====

function renderActionBar(selectedCount, onDelete, onCancel) {
  return `
    <div class="action-bar fade-in">
      <span class="action-bar__info">Выбрано: ${selectedCount}</span>
      <div class="action-bar__actions">
        <button class="btn btn--ghost btn--sm" onclick="${onCancel}">Отмена</button>
        <button class="btn btn--danger btn--sm" onclick="${onDelete}">Удалить</button>
      </div>
    </div>
  `;
}

// ===== NOTIFICATION SETTINGS MODAL =====

function showNotificationSettingsModal() {
  const settings = getState('notificationSettings') || {};
  const rules = getState('notificationRules') || getDefaultRules();
  const showEmailEdit = getState('showEmailEdit') || false;
  const emails = settings.emails || [];

  // Сохраняем текущее состояние формы перед показом
  setState('notificationSettingsBackup', { ...settings }, true);

  showModal({
    title: 'Настройки уведомлений',
    content: `
      <div class="modal-form">
        <!-- Email notifications -->
        <div class="settings-section">
          <div class="settings-section__title">Уведомления для администратора</div>
          
          ${renderToggle({
            id: 'notif-email',
            checked: settings.emailEnabled,
            label: 'Email уведомления',
          })}
          
          ${
            settings.emailEnabled
              ? `
            <button class="btn btn--sm btn--outline mt-3" onclick="toggleEmailEditSmooth()">
              ${showEmailEdit ? 'Скрыть' : 'Изменить'}
            </button>
            
            <div class="email-edit-section ${showEmailEdit ? 'expanded' : ''}" id="email-edit-section">
              <div class="form-group mb-2">
                <div class="input-row">
                  <input type="text" class="input" id="new-email-name" placeholder="Имя (необязательно)">
                  <input type="email" class="input" id="new-email" placeholder="email@company.ru">
                  <button class="btn btn--primary btn--sm" onclick="addNotificationEmailSmooth()">+</button>
                </div>
              </div>
              <div class="emails-list" id="emails-list-container">
                ${
                  emails.length > 0
                    ? emails
                        .map((item, i) => {
                          const email = typeof item === 'string' ? item : item.email;
                          const name = typeof item === 'string' ? '' : item.name;
                          return `
                    <div class="email-item">
                      <div class="email-item__info">
                        ${name ? `<span class="email-item__name">${escapeHtml(name)}</span>` : ''}
                        <span class="email-item__email">${escapeHtml(email)}</span>
                      </div>
                      <button class="btn btn--sm btn--ghost" onclick="removeNotificationEmailSmooth(${i})">×</button>
                    </div>
                  `;
                        })
                        .join('')
                    : '<p class="text-muted text-sm">Нет добавленных email</p>'
                }
              </div>
            </div>
          `
              : ''
          }
        </div>
        
        <!-- Notification types -->
        <div class="settings-section">
          <div class="settings-section__title">Типы уведомлений</div>
          
          <div class="notif-types">
            ${renderToggle({
              id: 'notif-on-complete',
              checked: settings.notifyOnComplete !== false,
              label: 'При выполнении задачи',
            })}
            
            ${renderToggle({
              id: 'notif-on-deadline',
              checked: settings.notifyOnDeadline !== false,
              label: 'При надвигающемся дедлайне',
            })}
            
            ${renderToggle({
              id: 'notif-on-overdue',
              checked: settings.notifyOnOverdue !== false,
              label: 'При просрочке задачи',
            })}
          </div>
        </div>
        
        <!-- Rules -->
        <div class="settings-section">
          <div class="settings-section__header">
            <span class="settings-section__title">Правила напоминаний</span>
            <button class="btn btn--sm btn--ghost" onclick="showRuleEditInModal(null)">+ Добавить</button>
          </div>
          <div class="reminder-rules" id="notification-rules-list">
            ${rules
              .map(
                (rule, index) => `
              <div class="reminder-rule">
                <span class="reminder-rule__icon">${rule.icon || '📋'}</span>
                <span class="reminder-rule__text">${escapeHtml(rule.text)}</span>
                <div class="reminder-rule__actions">
                  <button class="btn btn--sm btn--ghost" onclick="showRuleEditInModal(${index})" title="Редактировать">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="btn btn--sm btn--ghost" onclick="deleteRuleSmooth(${index})" title="Удалить">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="closeModal()">Закрыть</button>
      <button class="btn btn--primary" onclick="saveNotificationSettings()">Сохранить</button>
    `,
  });
}

function getDefaultRules() {
  return [
    {
      icon: '📅',
      text: 'Срок ≤ 7 дней → ежедневно',
      condition: '<=',
      value: 7,
      unit: 'day',
      frequency: 'daily',
    },
    {
      icon: '📆',
      text: 'Срок > 7 дней → еженедельно',
      condition: '>',
      value: 7,
      unit: 'day',
      frequency: 'weekly',
    },
    {
      icon: '⚠️',
      text: 'Просрочено → ежедневно',
      condition: 'overdue',
      value: 0,
      unit: 'day',
      frequency: 'daily',
    },
  ];
}

// Плавное открытие/закрытие email редактирования
function toggleEmailEditSmooth() {
  const section = document.getElementById('email-edit-section');
  if (section) {
    section.classList.toggle('expanded');
    setState('showEmailEdit', section.classList.contains('expanded'), true);
  }
  haptic.light();
}

// Добавление email без перезагрузки
function addNotificationEmailSmooth() {
  const emailInput = document.getElementById('new-email');
  const nameInput = document.getElementById('new-email-name');
  const email = emailInput?.value?.trim();
  const name = nameInput?.value?.trim();

  if (!email || !isValidEmail(email)) {
    showToast('Введите корректный email', 'error');
    return;
  }

  const settings = getState('notificationSettings') || {};
  const emails = settings.emails || [];

  const exists = emails.some((item) => {
    const e = typeof item === 'string' ? item : item.email;
    return e === email;
  });

  if (exists) {
    showToast('Email уже добавлен', 'warning');
    return;
  }

  emails.push({ email, name: name || '' });
  setState('notificationSettings', { ...settings, emails }, true);

  // Обновляем список без перезагрузки модалки
  updateEmailsList(emails);

  // Очищаем поля
  emailInput.value = '';
  nameInput.value = '';

  haptic.success();
}

function updateEmailsList(emails) {
  const container = document.getElementById('emails-list-container');
  if (!container) return;

  if (emails.length === 0) {
    container.innerHTML = '<p class="text-muted text-sm">Нет добавленных email</p>';
    return;
  }

  container.innerHTML = emails
    .map((item, i) => {
      const email = typeof item === 'string' ? item : item.email;
      const name = typeof item === 'string' ? '' : item.name;
      return `
      <div class="email-item">
        <div class="email-item__info">
          ${name ? `<span class="email-item__name">${escapeHtml(name)}</span>` : ''}
          <span class="email-item__email">${escapeHtml(email)}</span>
        </div>
        <button class="btn btn--sm btn--ghost" onclick="removeNotificationEmailSmooth(${i})">×</button>
      </div>
    `;
    })
    .join('');
}

function removeNotificationEmailSmooth(index) {
  const settings = getState('notificationSettings') || {};
  const emails = settings.emails || [];
  emails.splice(index, 1);
  setState('notificationSettings', { ...settings, emails }, true);
  updateEmailsList(emails);
  haptic.light();
}

// Редактирование правил внутри модалки
function showRuleEditInModal(index) {
  const rules = getState('notificationRules') || getDefaultRules();
  const rule = index !== null ? rules[index] : null;
  setState('editingRuleIndex', index !== null ? index : -1, true);

  // Создаём inline форму
  const rulesContainer = document.getElementById('notification-rules-list');
  if (!rulesContainer) return;

  // Проверяем, есть ли уже форма
  const existingForm = document.getElementById('rule-edit-form');
  if (existingForm) {
    existingForm.remove();
  }

  const formHtml = `
    <div class="rule-edit-form" id="rule-edit-form">
      <div class="form-group">
        <label class="form-label">Условие</label>
        <select class="select select--animated" id="rule-condition">
          <option value="<=" ${rule?.condition === '<=' ? 'selected' : ''}>Срок ≤</option>
          <option value=">" ${rule?.condition === '>' ? 'selected' : ''}>Срок ></option>
          <option value="<" ${rule?.condition === '<' ? 'selected' : ''}>Срок <</option>
          <option value=">=" ${rule?.condition === '>=' ? 'selected' : ''}>Срок ≥</option>
          <option value="overdue" ${rule?.condition === 'overdue' ? 'selected' : ''}>Просрочено</option>
        </select>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Значение</label>
          <input type="number" class="input" id="rule-value" value="${rule?.value || 7}" min="0">
        </div>
        <div class="form-group">
          <label class="form-label">Единица</label>
          <select class="select select--animated" id="rule-unit">
            <option value="minute" ${rule?.unit === 'minute' ? 'selected' : ''}>Минут</option>
            <option value="hour" ${rule?.unit === 'hour' ? 'selected' : ''}>Часов</option>
            <option value="day" ${rule?.unit === 'day' ? 'selected' : ''}>Дней</option>
            <option value="week" ${rule?.unit === 'week' ? 'selected' : ''}>Недель</option>
            <option value="month" ${rule?.unit === 'month' ? 'selected' : ''}>Месяцев</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Частота</label>
        <select class="select select--animated" id="rule-frequency">
          <option value="once" ${rule?.frequency === 'once' ? 'selected' : ''}>Один раз</option>
          <option value="daily" ${rule?.frequency === 'daily' ? 'selected' : ''}>Ежедневно</option>
          <option value="weekly" ${rule?.frequency === 'weekly' ? 'selected' : ''}>Еженедельно</option>
          <option value="monthly" ${rule?.frequency === 'monthly' ? 'selected' : ''}>Раз в месяц</option>
          <option value="quarterly" ${rule?.frequency === 'quarterly' ? 'selected' : ''}>Раз в квартал</option>
          <option value="halfyear" ${rule?.frequency === 'halfyear' ? 'selected' : ''}>Раз в полгода</option>
          <option value="yearly" ${rule?.frequency === 'yearly' ? 'selected' : ''}>Раз в год</option>
        </select>
      </div>
      
      <div class="form-actions">
        <button class="btn btn--sm btn--secondary" onclick="cancelRuleEdit()">Отмена</button>
        <button class="btn btn--sm btn--primary" onclick="saveRuleInline()">Сохранить</button>
      </div>
    </div>
  `;

  rulesContainer.insertAdjacentHTML('beforeend', formHtml);

  // Плавная прокрутка к форме
  setTimeout(() => {
    const form = document.getElementById('rule-edit-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 50);

  haptic.light();
}

function cancelRuleEdit() {
  const form = document.getElementById('rule-edit-form');
  if (form) form.remove();
}

function saveRuleInline() {
  const editIndex = getState('editingRuleIndex');
  const condition = document.getElementById('rule-condition')?.value;
  const value = parseInt(document.getElementById('rule-value')?.value) || 0;
  const unit = document.getElementById('rule-unit')?.value;
  const frequency = document.getElementById('rule-frequency')?.value;

  const unitNames = {
    minute: 'минут',
    hour: 'часов',
    day: 'дней',
    week: 'недель',
    month: 'месяцев',
  };
  const freqNames = {
    once: 'один раз',
    daily: 'ежедневно',
    weekly: 'еженедельно',
    monthly: 'раз в месяц',
    quarterly: 'раз в квартал',
    halfyear: 'раз в полгода',
    yearly: 'раз в год',
  };
  const condNames = { '<=': '≤', '>': '>', '<': '<', '>=': '≥' };

  let text = '';
  let icon = '📋';

  if (condition === 'overdue') {
    text = `Просрочено → ${freqNames[frequency]}`;
    icon = '⚠️';
  } else {
    text = `Срок ${condNames[condition]} ${value} ${unitNames[unit]} → ${freqNames[frequency]}`;
    icon = value <= 7 ? '📅' : '📆';
  }

  const rule = { icon, text, condition, value, unit, frequency };

  const rules = getState('notificationRules') || getDefaultRules();

  const isNew = editIndex < 0;
  const newIndex = isNew ? rules.length : editIndex;

  if (editIndex >= 0) {
    rules[editIndex] = rule;
  } else {
    rules.push(rule);
  }

  setState('notificationRules', [...rules], true);

  // Обновляем список правил
  updateRulesList(rules, isNew ? newIndex : -1);

  haptic.success();
}

function deleteRuleSmooth(index) {
  const rules = getState('notificationRules') || getDefaultRules();
  rules.splice(index, 1);
  setState('notificationRules', [...rules], true);
  updateRulesList(rules);
  haptic.light();
}

function updateRulesList(rules, newRuleIndex = -1) {
  const container = document.getElementById('notification-rules-list');
  if (!container) return;

  container.innerHTML = rules
    .map(
      (rule, index) => `
    <div class="reminder-rule ${newRuleIndex === index ? 'reminder-rule--new' : ''}" data-rule-index="${index}">
      <span class="reminder-rule__icon">${rule.icon || '📋'}</span>
      <span class="reminder-rule__text">${escapeHtml(rule.text)}</span>
      <div class="reminder-rule__actions">
        <button class="btn btn--sm btn--ghost" onclick="showRuleEditInModal(${index})" title="Редактировать">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="btn btn--sm btn--ghost" onclick="deleteRuleSmooth(${index})" title="Удалить">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `
    )
    .join('');

  // Мерцание для нового правила
  if (newRuleIndex >= 0) {
    const newRule = container.querySelector(`[data-rule-index="${newRuleIndex}"]`);
    if (newRule) {
      newRule.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Мерцание
      setTimeout(() => {
        newRule.classList.add('flash-highlight');
        setTimeout(() => {
          newRule.classList.remove('flash-highlight', 'reminder-rule--new');
        }, 600);
      }, 100);
    }
  }
}

function saveNotificationSettings() {
  const settings = getState('notificationSettings') || {};

  const newSettings = {
    ...settings,
    emailEnabled: document.getElementById('notif-email')?.checked || false,
    telegramEnabled: document.getElementById('notif-telegram')?.checked || false,
    notifyOnComplete: document.getElementById('notif-on-complete')?.checked || false,
    notifyOnDeadline: document.getElementById('notif-on-deadline')?.checked || false,
    notifyOnOverdue: document.getElementById('notif-on-overdue')?.checked || false,
  };

  setState('notificationSettings', newSettings);
  closeModal();
  showToast('Настройки сохранены', 'success');
  haptic.success();
}

// Export
window.showToast = showToast;
window.hideToast = hideToast;
window.showModal = showModal;
window.closeModal = closeModal;
window.showConfirm = showConfirm;
window.handleConfirmOk = handleConfirmOk;
window.handleConfirmCancel = handleConfirmCancel;
window.renderCheckbox = renderCheckbox;
window.renderToggle = renderToggle;
window.renderSearchBar = renderSearchBar;
window.renderAvatar = renderAvatar;
window.renderBadge = renderBadge;
window.renderStatusBadge = renderStatusBadge;
window.renderPriorityBadge = renderPriorityBadge;
window.renderEmptyState = renderEmptyState;
window.renderTreeNode = renderTreeNode;
window.renderLoader = renderLoader;
window.renderStatCard = renderStatCard;
window.renderProgressBar = renderProgressBar;
window.renderChips = renderChips;
window.renderActionBar = renderActionBar;
window.showNotificationSettingsModal = showNotificationSettingsModal;
window.saveNotificationSettings = saveNotificationSettings;
window.toggleEmailEditSmooth = toggleEmailEditSmooth;
window.addNotificationEmailSmooth = addNotificationEmailSmooth;
window.removeNotificationEmailSmooth = removeNotificationEmailSmooth;
window.showRuleEditInModal = showRuleEditInModal;
window.cancelRuleEdit = cancelRuleEdit;
window.saveRuleInline = saveRuleInline;
window.deleteRuleSmooth = deleteRuleSmooth;
