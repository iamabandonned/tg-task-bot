/* ============================================
   VALIDATORS - Form Validation Functions
   ============================================ */

/**
 * Валидация email
 */
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Проверка уникальности email среди сотрудников
 */
function isEmailUnique(email, excludeId = null) {
  const employees = getState('employees') || [];
  return !employees.some(emp => 
    emp.email.toLowerCase() === email.toLowerCase() && emp.id !== excludeId
  );
}

/**
 * Валидация телефона
 */
function isValidPhone(phone) {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Валидация обязательного поля
 */
function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Валидация минимальной длины
 */
function minLength(value, min) {
  if (!value) return false;
  return value.length >= min;
}

/**
 * Валидация максимальной длины
 */
function maxLength(value, max) {
  if (!value) return true;
  return value.length <= max;
}

/**
 * Валидация даты (не в прошлом)
 */
function isValidFutureDate(dateStr, allowToday = true) {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  if (allowToday) {
    return date >= today;
  }
  return date > today;
}

/**
 * Валидация времени (формат HH:MM)
 */
function isValidTime(timeStr) {
  if (!timeStr) return false;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
}

/**
 * Валидация формы задачи
 */
function validateTaskForm(form) {
  const errors = {};
  
  if (!isRequired(form.title)) {
    errors.title = 'Введите название задачи';
  } else if (!minLength(form.title, 3)) {
    errors.title = 'Название должно быть не менее 3 символов';
  } else if (!maxLength(form.title, 200)) {
    errors.title = 'Название должно быть не более 200 символов';
  }
  
  if (form.description && !maxLength(form.description, 2000)) {
    errors.description = 'Описание должно быть не более 2000 символов';
  }
  
  if (!isRequired(form.selectedProjects)) {
    errors.projects = 'Выберите хотя бы один проект';
  }
  
  if (!isRequired(form.selectedEmployees)) {
    errors.employees = 'Выберите хотя бы одного исполнителя';
  }
  
  if (!isRequired(form.scheduledDate)) {
    errors.scheduledDate = 'Выберите дату';
  }
  
  if (!isRequired(form.scheduledTime)) {
    errors.scheduledTime = 'Выберите время';
  } else if (!isValidTime(form.scheduledTime)) {
    errors.scheduledTime = 'Неверный формат времени';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Валидация формы проекта
 */
function validateProjectForm(form) {
  const errors = {};
  
  if (!isRequired(form.name)) {
    errors.name = 'Введите название проекта';
  } else if (!minLength(form.name, 2)) {
    errors.name = 'Название должно быть не менее 2 символов';
  } else if (!maxLength(form.name, 100)) {
    errors.name = 'Название должно быть не более 100 символов';
  }
  
  if (form.description && !maxLength(form.description, 500)) {
    errors.description = 'Описание должно быть не более 500 символов';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Валидация формы отдела
 */
function validateDepartmentForm(form) {
  const errors = {};
  
  if (!isRequired(form.name)) {
    errors.name = 'Введите название отдела';
  } else if (!minLength(form.name, 2)) {
    errors.name = 'Название должно быть не менее 2 символов';
  } else if (!maxLength(form.name, 100)) {
    errors.name = 'Название должно быть не более 100 символов';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Валидация формы сотрудника
 */
function validateEmployeeForm(form, excludeId = null) {
  const errors = {};
  
  if (!isRequired(form.firstName)) {
    errors.firstName = 'Введите имя';
  } else if (!minLength(form.firstName, 2)) {
    errors.firstName = 'Имя должно быть не менее 2 символов';
  }
  
  if (!isRequired(form.lastName)) {
    errors.lastName = 'Введите фамилию';
  } else if (!minLength(form.lastName, 2)) {
    errors.lastName = 'Фамилия должна быть не менее 2 символов';
  }
  
  if (!isRequired(form.email)) {
    errors.email = 'Введите email';
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Неверный формат email';
  } else if (!isEmailUnique(form.email, excludeId)) {
    errors.email = 'Этот email уже используется';
  }
  
  if (form.phone && !isValidPhone(form.phone)) {
    errors.phone = 'Неверный формат телефона';
  }
  
  if (!isRequired(form.departmentId)) {
    errors.departmentId = 'Выберите отдел';
  }
  
  if (!isRequired(form.position)) {
    errors.position = 'Введите должность';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Показать ошибки валидации в форме
 */
function showValidationErrors(formElement, errors) {
  // Очистить предыдущие ошибки
  formElement.querySelectorAll('.form-error').forEach(el => el.remove());
  formElement.querySelectorAll('.input--error').forEach(el => {
    el.classList.remove('input--error');
  });
  
  // Показать новые ошибки
  Object.entries(errors).forEach(([field, message]) => {
    const input = formElement.querySelector(`[name="${field}"]`);
    if (input) {
      input.classList.add('input--error');
      
      const errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      errorEl.textContent = message;
      
      input.parentNode.insertBefore(errorEl, input.nextSibling);
    }
  });
}

/**
 * Очистить ошибки валидации
 */
function clearValidationErrors(formElement) {
  formElement.querySelectorAll('.form-error').forEach(el => el.remove());
  formElement.querySelectorAll('.input--error').forEach(el => {
    el.classList.remove('input--error');
  });
}

// Export
window.isValidEmail = isValidEmail;
window.isEmailUnique = isEmailUnique;
window.isValidPhone = isValidPhone;
window.isRequired = isRequired;
window.minLength = minLength;
window.maxLength = maxLength;
window.isValidFutureDate = isValidFutureDate;
window.isValidTime = isValidTime;
window.validateTaskForm = validateTaskForm;
window.validateProjectForm = validateProjectForm;
window.validateDepartmentForm = validateDepartmentForm;
window.validateEmployeeForm = validateEmployeeForm;
window.showValidationErrors = showValidationErrors;
window.clearValidationErrors = clearValidationErrors;

