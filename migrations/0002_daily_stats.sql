-- Ответы по дням — для календаря занятий. Дни до этой миграции есть только в activity, без числа ответов.
CREATE TABLE daily_stats (
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,                     -- локальная дата YYYY-MM-DD
  answers INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
