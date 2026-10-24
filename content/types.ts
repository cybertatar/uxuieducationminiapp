export type TrackId =
  | 'heuristics'
  | 'ux-laws'
  | 'hig'
  | 'material'
  | 'wcag'
  | 'design-systems'
  | 'ux-writing'
  | 'usability-testing'
  | 'figma-components'
  | 'figma-props'
  | 'figma-auto-layout'
  | 'figma-variables';

export type SectionId = 'ux' | 'guidelines' | 'figma';

export interface Link {
  title: string;
  url: string;
}

interface BaseQuestion {
  /** Стабильный id: по нему хранится прогресс, менять нельзя. */
  id: string;
  track: TrackId;
  /** Тема внутри трека, например «Видимость состояния системы». */
  topic: string;
  text: string;
  /** Суть разбора в одну строку — её видят сразу после ответа. */
  summary: string;
  /** Полный разбор: показывается сразу после ответа, и верного, и неверного. */
  explanation: string;
  /** Иллюстрация «как правильно» из web/src/illustrations. */
  fix?: string;
  /** Куда идти изучать тему. Первая ссылка — основная. */
  links: Link[];
}

/** Классический вопрос: текстовые варианты, опционально картинка-сценарий. */
export interface ChoiceQuestion extends BaseQuestion {
  kind?: 'choice';
  image?: string;
  options: string[];
  /** Индекс правильного варианта в options. */
  correct: number;
}

/** Варианты-картинки. Два варианта показываются как A/B, больше — сеткой. */
export interface ImageChoiceQuestion extends BaseQuestion {
  kind: 'image-choice';
  /** Картинка к самому вопросу, если нужна. */
  image?: string;
  options: string[];
  correct: number;
}

/** «Тапни на проблему»: правильный ответ — попасть в зону `zone` иллюстрации `image`. */
export interface HotspotQuestion extends BaseQuestion {
  kind: 'hotspot';
  image: string;
  zone: string;
}

/** «Расставь по порядку»: items перечислены в правильном порядке, на экране — перемешанными. */
export interface OrderQuestion extends BaseQuestion {
  kind: 'order';
  image?: string;
  items: string[];
}

/** «Выбери все верные»: засчитывается, только если отмечены все верные и ни одного лишнего. */
export interface MultiQuestion extends BaseQuestion {
  kind: 'multi';
  image?: string;
  /** Тексты вариантов, а с images: true — ключи иллюстраций, они показываются сеткой. */
  options: string[];
  /** Индексы верных вариантов в options. */
  correct: number[];
  images?: boolean;
}

/** «Найди все проблемы»: на иллюстрации `image` нужно отметить каждую из зон `zones`. */
export interface SpotQuestion extends BaseQuestion {
  kind: 'spot';
  image: string;
  zones: string[];
}

export type Question = ChoiceQuestion | ImageChoiceQuestion | HotspotQuestion | OrderQuestion | MultiQuestion | SpotQuestion;

export interface Track {
  id: TrackId;
  title: string;
  description: string;
  /** Иллюстрация обложки из web/src/illustrations. */
  art: string;
  /** Для сообщений бота, где картинок нет. */
  emoji: string;
}

/** Раздел на экране «Темы»: группа треков одной области. */
export interface Section {
  id: SectionId;
  title: string;
  tracks: TrackId[];
}
