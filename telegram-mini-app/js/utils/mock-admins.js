/* ============================================
   MOCK ADMINS - Whitelist администраторов
   ============================================ */

/**
 * Список разрешённых администраторов
 * В реальном приложении загружается с бэкенда
 * 
 * Чтобы добавить нового админа:
 * 1. Узнайте его Telegram ID (можно через @userinfobot)
 * 2. Добавьте объект в массив ниже
 */
const ALLOWED_ADMINS = [
  {
    telegramId: 123456789,    // Замените на реальный Telegram ID
    name: 'Главный Администратор'
  },
  {
    telegramId: 987654321,    // Замените на реальный Telegram ID
    name: 'Директор Иванов'
  },
  // Добавьте больше администраторов по необходимости:
  // {
  //   telegramId: XXXXXXXXX,
  //   name: 'Имя Администратора'
  // },
];

/**
 * Проверка, является ли пользователь админом
 * @param {number} telegramId - Telegram ID пользователя
 * @returns {object|null} Объект админа или null
 */
function findAdmin(telegramId) {
  return ALLOWED_ADMINS.find(admin => admin.telegramId === telegramId) || null;
}

/**
 * Проверка доступа
 * @param {number} telegramId - Telegram ID пользователя
 * @returns {boolean}
 */
function hasAccess(telegramId) {
  return ALLOWED_ADMINS.some(admin => admin.telegramId === telegramId);
}

// Export
window.ALLOWED_ADMINS = ALLOWED_ADMINS;
window.findAdmin = findAdmin;
window.hasAccess = hasAccess;

