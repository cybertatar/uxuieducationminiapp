CREATE TABLE users (
  id INTEGER PRIMARY KEY,                 -- Telegram user id
  first_name TEXT,
  username TEXT,
  tz TEXT NOT NULL DEFAULT 'Europe/Moscow',
  created_at INTEGER NOT NULL,

  -- уведомления
  can_message INTEGER NOT NULL DEFAULT 0, -- пользователь запустил бота и не заблокировал его
  daily_enabled INTEGER NOT NULL DEFAULT 0,
  daily_time TEXT NOT NULL DEFAULT '10:00',
  reminder_enabled INTEGER NOT NULL DEFAULT 1,
  reminder_time TEXT NOT NULL DEFAULT '20:00',
  paused_until TEXT,                      -- локальная дата YYYY-MM-DD, до которой не беспокоить
  next_daily_at INTEGER,                  -- unix ms, когда отправить следующий вопрос дня
  next_reminder_at INTEGER,               -- unix ms, когда проверить стрик

  -- стрик
  streak_current INTEGER NOT NULL DEFAULT 0,
  streak_best INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT                   -- локальная дата последнего засчитанного дня
);

CREATE INDEX users_next_daily ON users(next_daily_at);
CREATE INDEX users_next_reminder ON users(next_reminder_at);

CREATE TABLE answers (
  user_id INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  correct_total INTEGER NOT NULL DEFAULT 0,
  last_correct INTEGER NOT NULL DEFAULT 0,
  box INTEGER NOT NULL DEFAULT 0,         -- ступень интервального повторения
  due_date TEXT,                          -- когда повторить; NULL — повторять не нужно
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, question_id)
);

CREATE INDEX answers_due ON answers(user_id, due_date);

CREATE TABLE activity (
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,                     -- локальная дата YYYY-MM-DD
  PRIMARY KEY (user_id, date)
);
