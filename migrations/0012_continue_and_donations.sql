-- «Продолжить» на главной: тема, по которой человек последний раз начинал тест (mode: 'track').
ALTER TABLE users ADD COLUMN last_track TEXT;

-- Поддержка автора звёздами Telegram. telegram_payment_charge_id нужен, чтобы при необходимости вернуть звёзды (refundStarPayment).
CREATE TABLE donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,                -- в звёздах
  charge_id TEXT NOT NULL UNIQUE,         -- telegram_payment_charge_id
  created_at INTEGER NOT NULL             -- unix ms
);

CREATE INDEX donations_user ON donations(user_id);
