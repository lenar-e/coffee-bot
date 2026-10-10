# Coffee Bot (Telegraf)

🌐 *[English version](README.md)*

Telegram-бот кофейни на Node.js + TypeScript + Telegraf с клиентской частью и админ-панелью.

## Функциональность

- Клиент:
  - просмотр категорий меню и проваливание в товары категории
  - просмотр доступности товаров
  - добавление товаров в корзину
  - оформление заказа через пошаговую сцену (имя, телефон)
  - подтверждение отправки заказа
- Администратор:
  - просмотр товаров
  - добавление товара через пошаговую сцену
  - удаление товара
  - переключение доступности товара
  - просмотр заказов
  - принятие/отклонение заказа
  - получение уведомлений о новых заказах

## Структура проекта

```text
.
├── src
│   ├── bot.ts
│   ├── data
│   │   ├── orders.ts
│   │   └── products.ts
│   ├── handlers
│   │   ├── adminHandlers.ts
│   │   ├── clientHandlers.ts
│   │   ├── commonHandlers.ts
│   │   └── scenes
│   │       ├── addProductScene.ts
│   │       └── checkoutScene.ts
│   ├── keyboards
│   │   ├── inlineKeyboards.ts
│   │   └── replyKeyboards.ts
│   └── services
│       ├── cartService.ts
│       ├── orderService.ts
│       └── productService.ts
├── .env
├── .env.example
├── package.json
└── README.md
```

## Переменные окружения

Создайте `.env` (или скопируйте из `.env.example`) и заполните:

```env
BOT_TOKEN=token
ADMIN_ID=telegram_id
# Опционально, если сеть блокирует Telegram API:
# HTTPS_PROXY=http://user:pass@proxy-host:port
```

- `BOT_TOKEN` — токен Telegram-бота
- `ADMIN_ID` — Telegram ID администратора
- `HTTPS_PROXY` — опциональный HTTP/HTTPS прокси для доступа к `api.telegram.org`

## Установка и запуск

```bash
npm install
npm run dev
```

## Используемые технологии

- Node.js
- TypeScript
- Telegraf
- dotenv
- In-memory хранение данных (без БД)