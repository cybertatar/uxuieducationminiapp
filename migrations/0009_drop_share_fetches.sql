-- Журнал скачиваний карточек был нужен, чтобы найти, где обрезается фото; причина найдена.
ALTER TABLE share_images DROP COLUMN fetches;
