export type TrackId = 'heuristics' | 'ux-laws';

export interface Link {
  title: string;
  url: string;
}

export interface Question {
  /** Стабильный id: по нему хранится прогресс, менять нельзя. */
  id: string;
  track: TrackId;
  /** Тема внутри трека, например «Видимость состояния системы». */
  topic: string;
  text: string;
  /** Путь к картинке из web/public, например /images/h-modal.svg */
  image?: string;
  options: string[];
  /** Индекс правильного варианта в options. */
  correct: number;
  /** Короткий разбор: почему правильный ответ правильный. */
  explanation: string;
  /** Куда идти изучать тему. Первая ссылка — основная. */
  links: Link[];
}

export interface Track {
  id: TrackId;
  title: string;
  description: string;
  emoji: string;
}
