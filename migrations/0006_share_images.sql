-- Картинки карточек «Поделиться», нарисованные в Mini App по данным человека.
-- Telegram скачивает фото по ссылке, когда сообщение отправляют; через два дня строку удаляет cron.
CREATE TABLE share_images (
  id TEXT PRIMARY KEY,
  data BLOB NOT NULL,                     -- JPEG
  created_at INTEGER NOT NULL             -- unix ms
);
CREATE INDEX share_images_created ON share_images (created_at);
