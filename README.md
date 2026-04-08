Швидкий старт
# 1. Встановити залежності
npm install

# 2. Запустити dev-сервер
npm run dev

# Відкрити http://localhost:3000
🧱 Технологічний стек
Рівень	Технологія
Фреймворк	React 18 + TypeScript
Збірка	Vite 5
Роутинг	React Router v6
Отримання даних	TanStack Query v5 (кеш, staleTime)
Глобальний стан	Zustand + persist (localStorage)
Типізація	Повна типізація (strict TS)
Шрифти	Teko · JetBrains Mono · Rajdhani
API	OpenDota API (безкоштовно, без ключа)
📁 Структура проєкту
src/
├── api/
│   └── opendota.ts       # усі методи API
├── components/
│   ├── ui/               # перевикористовувані компоненти
│   ├── layout/           # Navbar
│   ├── player/           # SearchBar, PlayerHeader, MatchesTable, Charts
│   ├── heroes/           # HeroesPage
│   ├── leaderboard/      # LeaderboardPage
│   └── meta/             # MetaPage
├── hooks/
│   └── useData.ts        # React Query хуки
├── pages/
│   ├── HomePage.tsx
│   └── PlayerPage.tsx
├── store/
│   └── appStore.ts       # Zustand
├── types/
│   └── index.ts          # усі TypeScript типи
└── utils/
    ├── constants.ts      # герої, ранги, атрибути
    └── helpers.ts        # утиліти
📄 Сторінки
URL	Опис
/	Пошук за Steam ID, історія
/player/:id	Профіль: огляд, матчі, герої, KDA-граф
/heroes	База героїв з фільтрами та сортуванням
/leaderboard	Топ-100 гравців рангу Immortal
/meta	Метагейм: піки/бани/винрейт за атрибутами
🔜 Подальший розвиток
🔧 Бекенд (Node.js + Express + PostgreSQL)
server/
├── src/
│   ├── routes/      # REST API
│   ├── services/    # бізнес-логіка
│   ├── db/          # Prisma ORM
│   └── jobs/        # фонове оновлення матчів (Bull queue)
🎯 Інтеграція CS2
Steam Web API для базової статистики
FACEIT API для змагальних матчів
Система рейтингу CS
📌 Заплановані функції
 Порівняння двох гравців
 Matchups героїв (проти кого сильні/слабкі)
 Перегляд професійних матчів
 Сповіщення про матчі
 Mobile-first PWA
⚠️ Ліміти API

OpenDota — 50 000 запитів/місяць безкоштовно. Для продакшену:

Зареєструватися на https://api.opendota.com
 → отримати API ключ
Додати ?api_key=YOUR_KEY до запитів у src/api/opendota.ts
Отримати 2 000 000 запитів/місяць за $10/місяць