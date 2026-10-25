-- «Что-то не так с вопросом?»: сообщения о неточностях из разбора ответа.
-- Бот пересылает каждое автору (OWNER_USERNAME в src/bot.ts), тот отмечает «Исправлено» или «Не ошибка».
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  reason TEXT NOT NULL,                   -- ключ из REPORT_REASONS в src/api-types.ts
  comment TEXT,
  option INTEGER,                         -- что человек ответил: индекс варианта, в особых механиках 0 — верно, 1 — нет
  status TEXT NOT NULL DEFAULT 'new',     -- new | fixed | rejected
  created_at INTEGER NOT NULL,            -- unix ms
  resolved_at INTEGER
);

CREATE INDEX reports_user ON reports (user_id, created_at);
CREATE INDEX reports_question ON reports (question_id);
