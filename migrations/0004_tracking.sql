-- Откуда пришёл пользователь: метка из ссылки t.me/<бот>?start=<метка> или ?startapp=<метка>.
-- Пишется один раз, при первом появлении. NULL — пришёл без метки или до этой миграции.
ALTER TABLE users ADD COLUMN source TEXT;

-- Каждый ответ отдельной строкой: какой вариант выбран, а не только верно ли.
-- option — индекс в исходном массиве options (для «тапни на проблему»: 0 — попал, 1 — нет).
CREATE TABLE answer_log (
  user_id INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  option INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  via TEXT NOT NULL,                      -- 'app' или 'chat'
  created_at INTEGER NOT NULL             -- unix ms
);

CREATE INDEX answer_log_question ON answer_log(question_id);
