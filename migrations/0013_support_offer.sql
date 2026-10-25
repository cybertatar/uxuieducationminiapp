-- Предложение поддержать проект: впервые после третьего пройденного теста, дальше не чаще раза в три недели
-- (правило — shouldOfferSupport в src/support.ts).
-- sessions_done — сколько сессий человек довёл до экрана итогов. Для тех, кто занимался раньше,
-- берём число дней занятий: в день засчитывается хотя бы одна сессия.
ALTER TABLE users ADD COLUMN sessions_done INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN support_offered_at INTEGER;  -- unix ms последнего показа; NULL — ещё не показывали

UPDATE users SET sessions_done = (SELECT COUNT(*) FROM activity WHERE activity.user_id = users.id);
