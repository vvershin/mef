# ⚡ Быстрый старт

## 1. Установка зависимостей

```bash
# Admin Panel
cd admin
npm install

# Mini App
cd ../miniapp
npm install
```

## 2. Запуск Admin Panel

```bash
cd admin
npm run dev
```

Откройте http://localhost:5173

## 3. Создайте первое мероприятие

1. Нажмите "Создать мероприятие"
2. Заполните:
   - Название: "Концерт рок-группы"
   - Описание: "Выступление местной рок-группы"
   - Категория: Концерт
   - Дата: выберите будущую дату
   - Место: "Клуб Космонавт"
   - Цена: "500₽" или отметьте "Бесплатно"
3. Нажмите "Создать"

## 4. Экспортируйте данные

1. Нажмите "Экспорт JSON"
2. Сохраните файл
3. Скопируйте его в `docs/events.json`:
   ```bash
   cp ~/Downloads/events.json docs/events.json
   ```

## 5. Настройте GitHub Pages

### Создайте репозиторий на GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### Включите GitHub Pages

1. Откройте Settings → Pages
2. Source: **GitHub Actions**
3. Сохраните

### Дождитесь деплоя

Перейдите в Actions → Deploy Mini App → дождитесь зеленой галочки ✅

## 6. Настройте Mini App

Создайте `miniapp/.env`:

```env
VITE_EVENTS_URL=https://your-username.github.io/your-repo/events.json
```

Замените на ваши данные!

## 7. Создайте Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/newbot`
3. Придумайте имя: "Events Bot"
4. Придумайте username: "your_events_bot"
5. Скопируйте токен (не понадобится для Mini App)

## 8. Создайте Mini App

1. В [@BotFather](https://t.me/BotFather) отправьте `/newapp`
2. Выберите вашего бота
3. Название: "Афиша мероприятий"
4. Описание: "Каталог мероприятий с фильтрами"
5. Загрузите фото (512x512 px)
6. **URL**: `https://your-username.github.io/your-repo/`
7. Короткое имя: `events`

## 9. Откройте Mini App

1. Найдите вашего бота в Telegram
2. Нажмите "Menu" → "Афиша мероприятий"
3. Или отправьте боту любое сообщение - появится кнопка

## 10. Готово! 🎉

Теперь:
- Создавайте мероприятия в Admin Panel
- Экспортируйте в `docs/events.json`
- Делайте `git push`
- Пользователи видят обновления в Mini App

---

## Следующие шаги

### Добавьте изображения

1. Загрузите фото на [Imgur](https://imgur.com)
2. Скопируйте прямую ссылку
3. Вставьте в поле "Ссылка на изображение"

### Настройте автообновление

Каждый раз при `git push` GitHub Actions автоматически обновит Mini App.

### Пригласите пользователей

Отправьте ссылку на бота: `https://t.me/your_events_bot`

---

**Нужна помощь?** Читайте [README.md](README.md)
