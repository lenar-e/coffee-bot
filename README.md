# Coffee Bot (Telegraf)

Telegram-бот кофейни на Node.js + Telegraf с клиентской частью и админ-панелью.

## Функциональность

- Клиент:
  - просмотр меню и доступности товаров
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
│   ├── bot.js
│   ├── data
│   │   ├── orders.js
│   │   └── products.js
│   ├── handlers
│   │   ├── adminHandlers.js
│   │   ├── clientHandlers.js
│   │   ├── commonHandlers.js
│   │   └── scenes
│   │       ├── addProductScene.js
│   │       └── checkoutScene.js
│   ├── keyboards
│   │   ├── inlineKeyboards.js
│   │   └── replyKeyboards.js
│   └── services
│       ├── cartService.js
│       ├── orderService.js
│       └── productService.js
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
```

- `BOT_TOKEN` — токен Telegram-бота
- `ADMIN_ID` — Telegram ID администратора

## Установка и запуск

```bash
npm install
npm run dev
```

## Используемые технологии

- Node.js
- Telegraf
- dotenv
- In-memory хранение данных (без БД)