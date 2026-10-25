-- Предложение поддержать проект: один раз, после третьего пройденного теста.
-- sessions_done — сколько сессий человек довёл до экрана итогов. Для тех, кто занимался раньше,
-- берём число дней занятий: в день засчитывается хотя бы одна сессия.
ALTER TABLE users ADD COLUMN sessions_done INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN support_offered INTEGER NOT NULL DEFAULT 0;  -- модалку уже показали

UPDATE users SET sessions_done = (SELECT COUNT(*) FROM activity WHERE activity.user_id = users.id);
