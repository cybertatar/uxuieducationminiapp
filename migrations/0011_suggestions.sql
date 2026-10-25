-- «Предложить вопрос»: вопросы, которые прислали пользователи.
-- Бот пересылает каждый автору (OWNER_USERNAME в src/bot.ts): «Принять» → «Опубликован» или «Отклонить».
-- О каждом шаге бот пишет тому, кто прислал вопрос; опубликованный вопрос подписан его ником (поле author в content).
CREATE TABLE suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  track TEXT NOT NULL,
  text TEXT NOT NULL,
  correct TEXT NOT NULL,
  wrong TEXT NOT NULL,                    -- JSON-массив неправильных вариантов, от 1 до 3
  explanation TEXT NOT NULL,
  source TEXT,                            -- ссылка на первоисточник
  screen TEXT,                            -- описание экрана, если вопрос про макет: иллюстрацию рисуем сами
  status TEXT NOT NULL DEFAULT 'new',     -- new | accepted | rejected | published
  created_at INTEGER NOT NULL,            -- unix ms
  resolved_at INTEGER                     -- когда статус меняли последний раз
);

CREATE INDEX suggestions_user ON suggestions (user_id, created_at);
