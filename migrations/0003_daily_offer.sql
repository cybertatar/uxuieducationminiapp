-- Предложение присылать вопрос дня уходит один раз: после первой сессии в приложении или первого ответа в чате.
-- Раньше оно приходило на /start — всем, кто уже писал боту (или включил вопрос дня), повторно не предлагаем.
ALTER TABLE users ADD COLUMN daily_offered INTEGER NOT NULL DEFAULT 0;
UPDATE users SET daily_offered = 1 WHERE can_message = 1 OR daily_enabled = 1;
