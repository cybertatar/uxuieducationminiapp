# Разработка

Как устроен проект, как запустить его локально и выложить свою копию.

## Стек

Всё работает на бесплатном тарифе Cloudflare и живёт в одном воркере:

| Часть | Технология |
|---|---|
| Mini App | React + Vite, нативная тема Telegram (`web/`) |
| API и бот | Cloudflare Worker: Hono + grammY (`src/`) |
| База | Cloudflare D1 (SQLite) (`migrations/`) |
| Рассылки | Cron Trigger раз в минуту |
| Контент | TypeScript-файлы в `content/` |

## Локальная разработка

```bash
npm install
cp .dev.vars.example .dev.vars   # DEV_AUTH=1 пускает в API без Telegram
npm run dev                      # API на :8787, фронтенд на :5173
```

Откройте http://localhost:5173: приложение заработает под тестовым пользователем.
Боту нужен настоящий токен и публичный адрес, поэтому его удобнее проверять после деплоя.

```bash
npm test            # логика стриков, повторений, часовых поясов, авторизации и проверка контента
npm run typecheck
```

## Деплой (один раз)

1. **Бот.** В [@BotFather](https://t.me/BotFather): `/newbot` → сохраните токен.
2. **Cloudflare.** Зарегистрируйтесь на cloudflare.com (бесплатно), затем:
   ```bash
   npx wrangler login
   npx wrangler d1 create ux-quiz           # скопируйте database_id в wrangler.toml
   npx wrangler secret put BOT_TOKEN
   npx wrangler secret put WEBHOOK_SECRET   # любая длинная строка из букв, цифр, _ и -
   npm run deploy
   ```
3. Пропишите в `wrangler.toml` → `WEBAPP_URL` адрес, который выдал деплой (`https://ux-quiz.<ваш-аккаунт>.workers.dev`), и выполните `npm run deploy` ещё раз.
4. Откройте в браузере `https://<адрес>/bot/setup?secret=<WEBHOOK_SECRET>`. Это подключит вебхук, команды и кнопку меню.
5. В BotFather: `/newapp` (или Bot Settings → Configure Mini App) → укажите тот же URL.

Последующие обновления: `npm run deploy`.

## Как добавить вопрос

Вопросы лежат в `content/*.ts`, по файлу на трек; новый трек регистрируется в `content/index.ts` (и в `TrackId` в `content/types.ts`) и добавляется в один из разделов `sections` там же, его обложка — в `web/src/illustrations/`. Есть три формата.

**Обычный вопрос** (варианты текстом, картинка необязательна):

```ts
{
  id: 'h-040',                 // уникальный и неизменный: по нему хранится прогресс
  track: 'heuristics',
  topic: 'Видимость состояния системы',
  image: 'h-pay-double',       // необязательно: иллюстрация-сценарий
  text: 'Текст вопроса',
  options: ['Правильный', 'Неправильный 1', 'Неправильный 2', 'Неправильный 3'],
  correct: 0,                  // при показе варианты перемешиваются
  summary: 'Суть в одну строку — видна сразу после ответа',
  explanation: 'Полный разбор — виден сразу после ответа',
  fix: 'h-pay-loading',        // необязательно: картинка «как правильно»
  links: [{ title: 'NN/g: ...', url: 'https://...' }],
}
```

**Ответы-картинки** (`kind: 'image-choice'`): `options` — это ключи иллюстраций. Два варианта показываются как A/B, четыре — сеткой 2×2.

**«Тапни на проблему»** (`kind: 'hotspot'`): `image` — иллюстрация, `zone` — ключ зоны в ней (см. `zones` у иллюстрации).

Вопросы с картинками бот в чате не задаёт, они есть только в приложении.

### Иллюстрации

Вайрфреймы рисуются кодом в `web/src/illustrations/` из деталей `kit.ts` (экраны, поля, кнопки, иконки). Цвета задаются классами, поэтому картинки сами подстраиваются под светлую и тёмную тему Telegram. Все иллюстрации разом видны на странице `http://localhost:5173/gallery.html` при запущенном `npm run dev`.

Кот Кегль — пиксельный спрайт в `web/src/Cat.tsx`: один символ строки — один пиксель.

`npm test` проверит, что id уникальны, индексы корректны, все иллюстрации и зоны существуют, а у каждого вопроса есть суть, разбор и ссылка.

## Структура

```
content/      вопросы и треки
src/          воркер: api.ts (REST для Mini App), bot.ts (бот и рассылки),
              streak.ts, review.ts, select.ts — чистая логика, покрытая тестами
web/          Mini App (illustrations/ — вайрфреймы, Cat.tsx — маскот)
migrations/   схема D1
tests/        vitest
```

## Профиль бота

Описание бота (в пустом чате) и короткое описание (в профиле) задаются в `src/texts.ts` и применяются при каждом деплое через `/bot/setup`. Количество тем и вопросов подставляется автоматически.

Аватарки с котом лежат в `brand/`. Поставить аватарку можно только вручную: в @BotFather → `/setuserpic` → выбрать бота → отправить PNG.

## Карусель для Instagram

Слайды — dev-страница `http://localhost:5173/carousel.html` (`web/src/carousel/`): они собираются из настоящих компонентов приложения, поэтому числа тем, вопросов и иллюстраций всегда актуальны. Скриншоты экранов лежат в `web/src/carousel/shots/`.

Снять PNG 1080×1350 в `brand/instagram/`: запустить `npm run dev:web` и выполнить `node scripts/render-carousel.mjs` (нужен Playwright с Chromium). Текст поста — `brand/instagram/caption.md`.
