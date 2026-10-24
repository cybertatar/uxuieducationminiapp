-- Прочитанные уроки «Учебника». Урок считается прочитанным, когда человек долистал до «Запомни главное».
CREATE TABLE lesson_reads (
  user_id INTEGER NOT NULL,
  lesson_id TEXT NOT NULL,
  read_at INTEGER NOT NULL,               -- unix ms, первое прочтение
  PRIMARY KEY (user_id, lesson_id)
);
