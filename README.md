# 🎭 Telegram Events Manager

Полностью serverless система управления мероприятиями с Telegram Mini App.

## 🎯 Возможности

### Admin Panel (Локальная админка)
- ✏️ Создание и редактирование мероприятий
- 📊 Табличный интерфейс с сортировкой
- 🗑️ Автоматическое удаление прошедших событий
- 💾 Экспорт/импорт данных в JSON
- ⭐ Отметка избранных мероприятий
- 🏷️ Категории, теги, изображения

### Telegram Mini App (Для пользователей)
- 📱 Каталог мероприятий с красивыми карточками
- 🔍 Мощные фильтры:
  - По категориям (концерты, театр, выставки и т.д.)
  - По датам (сегодня, завтра, неделя, месяц)
  - По цене (бесплатно/платно)
  - Текстовый поиск
- ⭐ Избранное (сохраняется в Telegram Cloud Storage)
- 📄 Детальный просмотр событий
- 🔗 Прямые ссылки на регистрацию/билеты
- 🎨 Адаптация под тему Telegram (светлая/темная)

## 🏗️ Архитектура

```
┌─────────────────────────────────────────┐
│  GitHub Pages (Хранилище данных)        │
│  └── docs/events.json                   │
└─────────────────────────────────────────┘
              ▲                    ▲
              │                    │
    ┌─────────┴──────┐   ┌─────────┴──────────┐
    │ Admin Panel    │   │  Telegram Mini App │
    │ (Локально)     │   │  (Пользователи)    │
    │                │   │                    │
    │ - Редактирует  │   │ - Читает данные    │
    │ - Экспортирует │   │ - Фильтрует        │
    │ - Git push     │   │ - Cloud Storage    │
    └────────────────┘   └────────────────────┘
```

**Преимущества:**
- ✅ Без серверов и баз данных
- ✅ Полностью бесплатно
- ✅ Автоматическое обновление
- ✅ Версионность (Git)

## 📦 Установка

### 1. Клонируйте репозиторий

```bash
git clone <your-repo-url>
cd tgAdmin
```

### 2. Установите зависимости

```bash
# Для Admin Panel
cd admin
npm install

# Для Mini App
cd ../miniapp
npm install
```

### 3. Настройте Mini App

Создайте файл `miniapp/.env`:

```env
VITE_EVENTS_URL=https://your-username.github.io/your-repo/events.json
```

Замените `your-username` и `your-repo` на ваши данные.

## 🚀 Запуск

### Admin Panel (локально)

```bash
cd admin
npm run dev
```

Откройте http://localhost:5173

### Mini App (для разработки)

```bash
cd miniapp
npm run dev
```

Откройте http://localhost:5174

## 📤 Деплой

### 1. Настройте GitHub Pages

1. Перейдите в Settings → Pages вашего репозитория
2. Source: GitHub Actions
3. Сохраните

### 2. Workflow автоматически задеплоит Mini App

При каждом `git push` в ветку `main`:
- Собирается Mini App
- Копируется `events.json`
- Публикуется на GitHub Pages

### 3. Создайте Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Отправьте `/newapp`
5. Выберите вашего бота
6. Укажите URL: `https://your-username.github.io/your-repo/`
7. Загрузите иконку и описание

## 📝 Workflow использования

### Создание мероприятий

1. **Запустите Admin Panel**
   ```bash
   cd admin
   npm run dev
   ```

2. **Создайте мероприятия**
   - Нажмите "Создать мероприятие"
   - Заполните форму
   - Сохраните

3. **Экспортируйте данные**
   - Нажмите "Экспорт JSON"
   - Сохраните файл как `docs/events.json`

4. **Опубликуйте**
   ```bash
   git add docs/events.json
   git commit -m "Update events"
   git push
   ```

5. **Готово!** 
   - GitHub Actions автоматически задеплоит изменения
   - Пользователи увидят обновления в Mini App

### Очистка старых событий

В Admin Panel нажмите "Очистить старые" - все прошедшие мероприятия будут удалены.

## 🎨 Категории мероприятий

- 🎵 Концерт
- 🎭 Театр
- 🖼️ Выставка
- ⚽ Спорт
- 🎪 Фестиваль
- 🎨 Мастер-класс
- 💼 Конференция
- 🎉 Вечеринка
- 🎬 Кино
- 📌 Другое

## 🔧 Структура проекта

```
tgAdmin/
├── admin/                      # Админ-панель
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventsTable.tsx
│   │   │   └── EventEditor.tsx
│   │   ├── utils/
│   │   │   ├── storage.ts
│   │   │   └── validation.ts
│   │   └── App.tsx
│   └── package.json
├── miniapp/                    # Telegram Mini App
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventDetails.tsx
│   │   │   └── FilterPanel.tsx
│   │   ├── hooks/
│   │   │   ├── useTelegram.ts
│   │   │   └── useCloudStorage.ts
│   │   ├── api/
│   │   │   └── events.ts
│   │   └── App.tsx
│   └── package.json
├── shared/                     # Общие типы
│   └── types.ts
├── docs/                       # GitHub Pages
│   └── events.json            # База данных
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD
└── README.md
```

## 🔐 Безопасность

- Данные публичны (events.json доступен всем)
- Избранное каждого пользователя хранится в его личном Cloud Storage
- Никакой аутентификации не требуется
- Telegram автоматически авторизует пользователей

## 🐛 Troubleshooting

### Mini App не загружает данные

1. Проверьте `VITE_EVENTS_URL` в `.env`
2. Убедитесь, что `docs/events.json` существует
3. Проверьте, что GitHub Pages активирован
4. Откройте URL напрямую в браузере

### Admin Panel не сохраняет данные

Данные хранятся в localStorage браузера. Проверьте:
- Не используете ли режим инкогнито
- Есть ли место в localStorage

### GitHub Actions не деплоит

1. Settings → Actions → General → Workflow permissions → Read and write
2. Settings → Pages → Source → GitHub Actions

## 📱 Тестирование Mini App

### Локально (без Telegram)

```bash
cd miniapp
npm run dev
```

Откройте http://localhost:5174 - приложение работает как обычный сайт.

### В Telegram

1. Создайте тестового бота через @BotFather
2. Используйте ngrok для локального тестирования:
   ```bash
   ngrok http 5174
   ```
3. Укажите ngrok URL в настройках Mini App

## 🎓 Дополнительные возможности

### Добавление изображений

Используйте любой бесплатный хостинг:
- [Imgur](https://imgur.com)
- [ImgBB](https://imgbb.com)
- GitHub (загрузите в репозиторий)

### Уведомления

Можно добавить Telegram бота, который будет:
- Отправлять уведомления о новых событиях
- Напоминать о предстоящих мероприятиях
- Публиковать в канал

### Аналитика

Добавьте Google Analytics или Yandex Metrika в Mini App для отслеживания:
- Популярных категорий
- Количества просмотров
- Конверсии в регистрации

## 📄 Лицензия

MIT

## 🤝 Поддержка

Если возникли вопросы:
1. Проверьте этот README
2. Посмотрите примеры в коде
3. Откройте Issue в репозитории

---

**Создано с ❤️ для управления мероприятиями в Telegram**
