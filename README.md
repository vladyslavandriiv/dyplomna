

## 🚀 Швидкий старт

```bash
# 1. Встановити залежності
npm install

# 2. Запустити dev-сервер
npm run dev
````

👉 Відкрити в браузері: [http://localhost:3000](http://localhost:3000)

---

## 🧱 Технологічний стек

| Рівень          | Технологія                       |
| --------------- | -------------------------------- |
| Фреймворк       | React 18 + TypeScript            |
| Збірка          | Vite 5                           |
| Роутинг         | React Router v6                  |
| Отримання даних | TanStack Query v5                |
| Глобальний стан | Zustand + persist (localStorage) |
| Типізація       | Strict TypeScript                |
| API             | OpenDota API                     |

---

## 📁 Структура проєкту

```
src/
├── api/
│   └── opendota.ts
├── components/
│   ├── ui/
│   ├── layout/
│   ├── player/
│   ├── heroes/
│   ├── leaderboard/
│   └── meta/
├── hooks/
│   └── useData.ts
├── pages/
│   ├── HomePage.tsx
│   └── PlayerPage.tsx
├── store/
│   └── appStore.ts
├── types/
│   └── index.ts
└── utils/
    ├── constants.ts
    └── helpers.ts
```

---

## 📄 Сторінки

* `/` — пошук за Steam ID, історія запитів
* `/player/:id` — профіль гравця (огляд, матчі, герої, KDA-граф)
* `/heroes` — база героїв з фільтрами та сортуванням
* `/leaderboard` — топ-100 гравців рангу Immortal
* `/meta` — метагейм (популярність, винрейт, бани)

---

## 🔜 Подальший розвиток

### 🔧 Бекенд (Node.js + Express + PostgreSQL)

```
server/
├── src/
│   ├── routes/
│   ├── services/
│   ├── db/
│   └── jobs/
```

---

### 🎯 Інтеграція CS2

* Steam Web API (базова статистика)
* FACEIT API (змагальні матчі)
* Власна система рейтингу

---

### 📌 Заплановані функції

* [ ] Порівняння двох гравців
* [ ] Hero matchups (контрпіки)
* [ ] Перегляд професійних матчів
* [ ] Сповіщення про матчі
* [ ] Mobile-first PWA

---

## ⚠️ Ліміти API

OpenDota API:

* **50 000 запитів/місяць** — безкоштовно
* **2 000 000 запитів/місяць** — $10/місяць

### Для продакшену:

1. Зареєструватися: [https://api.opendota.com](https://api.opendota.com)
2. Отримати API ключ
3. Додати до запитів:

```
?api_key=YOUR_KEY
```

---

