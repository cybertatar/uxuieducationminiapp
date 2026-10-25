-- «Сообщить о проблеме» с экрана вопроса.
-- Бот пересылает каждое сообщение автору (OWNER_USERNAME в src/bot.ts) вместе с данными об ответе и устройстве,
-- автор отмечает «Исправлено» или «Не ошибка».
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  reason TEXT NOT NULL,                   -- ключ из REPORT_REASONS в src/api-types.ts
  comment TEXT,
  answer TEXT,                            -- JSON ReportAnswer: что человек ответил, null — ещё не отвечал
  context TEXT,                           -- JSON ReportContext: сессия, место в ней, устройство, версия приложения
  status TEXT NOT NULL DEFAULT 'new',     -- new | fixed | rejected
  created_at INTEGER NOT NULL,            -- unix ms
  resolved_at INTEGER
);

CREATE INDEX reports_user ON reports (user_id, created_at);
CREATE INDEX reports_question ON reports (question_id);
