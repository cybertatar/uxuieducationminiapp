-- Диагностика обрезанных карточек: кто загрузил картинку и как Telegram её скачивал.
ALTER TABLE share_images ADD COLUMN client TEXT;   -- User-Agent Mini App, загрузившего картинку
ALTER TABLE share_images ADD COLUMN fetches TEXT;  -- строки «метод Range User-Agent» от скачиваний
