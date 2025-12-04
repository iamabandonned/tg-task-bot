# Telegram Mini App - Task Manager

Telegram Mini App для управления задачами, проектами и сотрудниками.

## Быстрый старт

### Клонирование репозитория

```bash
git clone https://github.com/KewyLee/tg-task-bot.git
cd tg-task-bot
```

### Локальная разработка

Проект представляет собой статический веб-сайт, для работы локально можно использовать любой HTTP-сервер:

**Вариант 1: Python (если установлен)**
```bash
cd telegram-mini-app
python -m http.server 8000
```
Откройте в браузере: `http://localhost:8000`

**Вариант 2: Node.js (если установлен)**
```bash
cd telegram-mini-app
npx http-server -p 8000
```

**Вариант 3: PHP (если установлен)**
```bash
cd telegram-mini-app
php -S localhost:8000
```

**Вариант 4: Live Server (VS Code расширение)**
- Установите расширение "Live Server" в VS Code
- Откройте `telegram-mini-app/index.html`
- Нажмите "Go Live" в статус-баре

**Вариант 5: Просто откройте файл**
- Откройте `telegram-mini-app/index.html` напрямую в браузере
- ⚠️ Некоторые функции могут не работать из-за CORS политики

## Структура проекта

```
telegram-mini-app/
├── index.html          # Главная страница
├── css/                # Стили
├── js/                 # JavaScript файлы
│   ├── pages/         # Страницы приложения
│   └── utils/         # Утилиты
└── PROJECT_PLAN.md    # План проекта
```

## Развертывание

1. Скопируйте файлы из `telegram-mini-app/` на сервер
2. Настройте Caddy для обслуживания статических файлов
3. Убедитесь, что порты 80 и 443 открыты

## Настройка Caddy

Добавьте в ваш `Caddyfile`:

```caddy
tg-task.workflow-ai-n8n.com {
    encode zstd gzip
    root * /home/dev/stack/sites/tg_task_create
    file_server
    
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        Access-Control-Allow-Origin "*"
    }
}
```

## Требования для разработки

- Любой современный браузер
- Любой HTTP-сервер (Python, Node.js, PHP или расширение для редактора)
- Git (для клонирования репозитория)

## Требования для продакшена

- Caddy 2.x
- Docker (для развертывания)
- HTTPS сертификат (автоматически через Caddy)

## Лицензия

MIT

