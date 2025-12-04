# Telegram Mini App - Task Manager

Telegram Mini App для управления задачами, проектами и сотрудниками.

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

### Автоматическое развертывание

Используйте скрипт `deploy.ps1` для автоматического развертывания на сервер:

```powershell
.\deploy.ps1
```

### Ручное развертывание

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

## Требования

- Caddy 2.x
- Docker (для развертывания)
- HTTPS сертификат (автоматически через Caddy)

## Лицензия

MIT

