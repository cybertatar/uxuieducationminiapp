// Картинка для анонса в Telegram-канале. Dev-страница /post.html, 1280×720 (16:9).
// PNG снимается скриптом scripts/render-post.mjs в brand/telegram/post.png.
import { lessons, questions, sections, tracks } from '../../../content';
import { Cat } from '../Cat';
import { plural } from '../format';
import hotspot from './hotspot.png';
import lesson from './lesson.png';
import { Phone } from './Phone';

const BOT_URL = 't.me/uxuitrainer_bot';
/** «1000+», а не точное число: подпись не устаревает с каждым новым вопросом */
const QUESTIONS = `${Math.floor(questions.length / 100) * 100}+`;

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
          Учит основам UX/UI и Figma, а {QUESTIONS} вопросов закрепляют знания
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
        <Phone src={hotspot} className="post__phone post__phone--back" back />
        <Phone src={lesson} className="post__phone post__phone--front" back />
        <div className="post__cat">
          <Cat mood="happy" size={200} />
        </div>
      </div>
    </section>
  );
}
