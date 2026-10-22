// Картинка для анонса в Telegram-канале. Dev-страница /post.html, 1280×720 (16:9).
// PNG снимается скриптом scripts/render-post.mjs в brand/telegram/post.png.
import { questions, sections, tracks } from '../../../content';
import { Cat } from '../Cat';
import { plural, questionsWord } from '../format';
import hotspot from './hotspot.png';
import themes from './themes.png';
import { Phone } from './Phone';

const BOT_URL = 't.me/uxuitrainer_bot';

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
