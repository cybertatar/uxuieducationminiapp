// Картинка для анонса в Telegram-канале. Dev-страница /post.html, 1280×720 (16:9).
// PNG снимается скриптом scripts/render-post.mjs в brand/telegram/post.png.
import { questions, sections, tracks } from '../../../content';
import { Cat } from '../Cat';
import { plural, questionsWord } from '../format';
import hotspot from './hotspot.png';
import themes from './themes.png';

const BOT_URL = 't.me/uxuitrainer_bot';

/**
 * iPhone 390×844 pt в полноэкранном режиме Telegram. Скриншоты сняты с отступами
 * --tg-safe-area-inset-top: 54px, --tg-content-safe-area-inset-top: 46px, --tg-safe-area-inset-bottom: 34px,
 * поэтому интерфейс сам стоит ниже статус-бара и плавающих кнопок Telegram, которые рисуются поверх.
 */
const Phone = ({ src, className, back = false }: { src: string; className: string; back?: boolean }) => (
  <div className={`mock ${className}`}>
    <div className="mock__screen">
      <div className="mock__status">
        <span className="mock__time">9:41</span>
        <span className="mock__island" />
        <svg className="mock__icons" viewBox="0 0 68 12" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0.5" width="3" height="11.5" rx="1" />
          <path d="M31 3.2a9.6 9.6 0 0 1 12.6 0l-1.4 1.5a7.6 7.6 0 0 0-9.8 0zM33.4 5.8a6 6 0 0 1 7.8 0l-1.4 1.5a4 4 0 0 0-5 0zM35.8 8.4a2.4 2.4 0 0 1 3 0L37.3 10z" />
          <rect x="44.5" y="0.5" width="21" height="11" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.4" />
          <rect x="46.5" y="2.5" width="17" height="7" rx="1.6" />
          <path d="M66.6 4.2v3.6a1.9 1.9 0 0 0 0-3.6z" opacity="0.4" />
        </svg>
      </div>
      <div className="mock__tg">
        <span className="mock__pill">
          {back ? (
            <svg className="mock__back" viewBox="0 0 8 14" aria-hidden>
              <path d="M7 1 1 7l6 6" />
            </svg>
          ) : (
            <svg className="mock__close" viewBox="0 0 12 12" aria-hidden>
              <path d="m1 1 10 10M11 1 1 11" />
            </svg>
          )}
          {back ? 'Назад' : 'Закрыть'}
        </span>
        <span className="mock__pill mock__pill--icons">
          <svg className="mock__chevron" viewBox="0 0 14 8" aria-hidden>
            <path d="m1 1 6 6 6-6" />
          </svg>
          <svg className="mock__more" viewBox="0 0 18 4" aria-hidden>
            <circle cx="2" cy="2" r="2" />
            <circle cx="9" cy="2" r="2" />
            <circle cx="16" cy="2" r="2" />
          </svg>
        </span>
      </div>
      <img src={src} alt="" />
      <div className="mock__home" />
    </div>
  </div>
);

export function Post() {
  return (
    <section className="post">
      <div className="post__text">
        <span className="tag pixel">Бесплатно · без рекламы</span>
        <h1>
          UX-тренажёр
          <br />с котом Кеглем
        </h1>
        <p className="post__lead">
          {questions.length} {questionsWord(questions.length)} для дизайнеров с разбором каждого ответа — прямо в Telegram
        </p>
        <div className="post__sections">
          {sections.map((s) => (
            <span key={s.id}>{s.title}</span>
          ))}
          <span className="post__count">
            {tracks.length} {plural(tracks.length, 'тема', 'темы', 'тем')}
          </span>
        </div>
        <span className="post__link pixel">{BOT_URL}</span>
      </div>
      <div className="post__art">
        <Phone src={themes} className="post__phone post__phone--back" />
        <Phone src={hotspot} className="post__phone post__phone--front" back />
        <div className="post__cat">
          <Cat mood="happy" size={200} />
        </div>
      </div>
    </section>
  );
}
