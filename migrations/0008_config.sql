-- Настройки, которые бот узнаёт сам, без секретов и деплоя.
-- share_chat — закрытый канал, куда бот кладёт карточки «Поделиться», чтобы отправлять их обычным фото Telegram.
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
