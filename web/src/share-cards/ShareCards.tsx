// Картинки карточек «Поделиться»: результат, стрик и урок. Dev-страница /share.html, 1280×720.
// JPG снимает scripts/render-share.mjs в web/public/share/: воркер отдаёт их Telegram по адресу /share/<имя>.jpg.
// Цифры конкретного человека — в подписи к картинке, а сама картинка общая.
import type { ReactNode } from 'react';
import { lessons, questions, tracks } from '../../../content';
import { Cat, type CatMood } from '../Cat';
import { plural } from '../format';
import { Wireframe } from '../Wireframe';

const BOT_URL = 't.me/uxuitrainer_bot';
const QUESTIONS = `${Math.floor(questions.length / 100) * 100}+`;
/** Девять верных из десяти: результат, к которому хочется стремиться, но не идеальный */
const DOTS = [1, 1, 1, 0, 1, 1, 1, 1, 1, 1];
const WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function Card({ name, mood, tag, title, lead, art, children }: { name: string; mood: CatMood; tag: string; title: ReactNode; lead: string; art?: ReactNode; children?: ReactNode }) {
  return (
    <section className="share-card" data-name={name}>
      <div className="share-card__text">
        <span className="tag pixel">{tag}</span>
        <h1>{title}</h1>
        <p className="share-card__lead">{lead}</p>
        {children}
        <span className="share-card__link pixel">{BOT_URL}</span>
      </div>
      <div className="share-card__art">
        {art}
        <div className="share-card__cat">
          <Cat mood={mood} size={240} />
        </div>
      </div>
    </section>
  );
}

export function ShareCards() {
  return (
    <div className="share-deck">
      <Card name="result" mood="celebrate" tag="UX-тренажёр" title={<>А сколько<br />наберёшь ты?</>} lead={`${QUESTIONS} вопросов по UX, гайдлайнам и Figma с разбором каждого ответа`}>
        <ol className="share-card__dots" aria-hidden>
          {DOTS.map((ok, i) => (
            <li key={i} className={ok ? 'is-correct' : 'is-wrong'} />
          ))}
        </ol>
      </Card>

      <Card name="streak" mood="happy" tag="Стрик" title={<>Учусь<br />каждый день</>} lead={`По несколько вопросов в день — и кот Кегль доволен. ${tracks.length} ${plural(tracks.length, 'тема', 'темы', 'тем')} на выбор.`}>
        <ol className="share-card__week" aria-hidden>
          {WEEK.map((d) => (
            <li key={d}>
              <span>✓</span>
              {d}
            </li>
          ))}
        </ol>
      </Card>

      <Card
        name="lesson"
        mood="idle"
        tag="Учебник"
        title={<>Урок простым<br />языком</>}
        lead={`${lessons.length} ${plural(lessons.length, 'урок', 'урока', 'уроков')}: пересказ NN/g, Laws of UX, Apple, Google, W3C и справки Figma. После каждого — три вопроса.`}
        art={
          <div className="share-card__pages">
            {['track-heuristics', 'track-hig', 'track-figma-components'].map((n) => (
              <span key={n} className="share-card__page">
                <Wireframe name={n} />
              </span>
            ))}
          </div>
        }
      />
    </div>
  );
}
