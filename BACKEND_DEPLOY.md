# CyberAware Backend: запуск и бесплатный деплой (2026)

## 1) Локальный запуск

1. Установите зависимости:

```bash
npm install
```

2. Создайте файл `.env` по примеру из [` .env.example `](.env.example):

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=7d
```

3. Запустите сервер:

```bash
npm run dev
```

Сервер поднимется на `http://localhost:3000`.

---

## 2) MongoDB Atlas (бесплатно)

1. Создайте бесплатный кластер (Free Tier) в MongoDB Atlas.
2. В `Database Access` создайте пользователя БД.
3. В `Network Access` добавьте IP (для теста можно `0.0.0.0/0`, для продакшна лучше ограничить).
4. В `Connect` скопируйте connection string и подставьте логин/пароль.
5. Сохраните строку как `MONGODB_URI`.

---

## 3) Deploy на Render.com (бесплатно)

1. Загрузите проект в GitHub.
2. На Render: **New +** → **Web Service** → подключите репозиторий.
3. Настройки сервиса:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. В `Environment` добавьте переменные:
   - `MONGODB_URI` = строка из Atlas
   - `JWT_SECRET` = длинный случайный секрет
   - `JWT_EXPIRES_IN` = `7d`
   - `PORT` не обязателен (Render задаёт сам)
5. Нажмите **Deploy**.

После деплоя API будет доступно по URL Render, например:

- `POST https://your-service.onrender.com/api/auth/register`
- `POST https://your-service.onrender.com/api/auth/login`

---

## 4) Варианты деплоя: Railway / Vercel

- **Railway**: аналогично Render — Node service + env vars (`MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`).
- **Vercel**: удобнее для serverless API, но для классического Express-сервера Render/Railway обычно проще.

---

## 5) Важно по безопасности

- Пароли хешируются через `bcrypt` в [`routes/auth.js`](routes/auth.js).
- В БД хранится только `passwordHash` в [`models/User.js`](models/User.js).
- JWT подписывается через `JWT_SECRET` в [`routes/auth.js`](routes/auth.js).
- Никогда не коммитьте реальный `.env` в репозиторий.
