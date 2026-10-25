// Картинки карточек «Поделиться»: результат, стрик и урок. Dev-страница /share.html, 1280×720.
// JPG снимает scripts/render-share.mjs в web/public/share/: воркер отдаёт их Telegram по адресу /share/<имя>.jpg.
// Это запасные картинки без цифр: обычно Mini App рисует свою карточку с данными человека (web/src/share-card.ts),
// а эти уходят, если она не нарисовалась. Примеры своих карточек — внизу страницы.
import type { ReactNode } from 'react';
import { lessons, questions, tracks } from '../../../content';
import { Cat, type CatMood } from '../Cat';
import { plural } from '../format';
import { renderShareCard, type ShareCardData } from '../share-card';
import { Wireframe } from '../Wireframe';

const BOT_URL = 't.me/uxuitrainer_bot';
const QUESTIONS = `${Math.floor(questions.length / 100) * 100}+`;
const WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Примеры карточек, которые рисует Mini App: крайние случаи по длине и счёту */
const SAMPLES: ShareCardData[] = [
  { kind: 'result', tag: 'Законы UX', score: '2 из 10', headline: 'Есть над чем поработать', answers: [false, true, false, false, false, true, false, false, false, false], mood: 'sad' },
  { kind: 'result', tag: 'Урок «Видимость состояния»', score: '3 из 3', headline: 'Без единой ошибки!', answers: [true, true, true], mood: 'celebrate' },
  { kind: 'streak', current: 7, best: 12, week: WEEK.map((label, i) => ({ label, active: i !== 2, isToday: i === 6 })) },
  { kind: 'streak', current: 1, best: 1, week: WEEK.map((label, i) => ({ label, active: i === 3, isToday: i === 3 })) },
  { kind: 'lesson', tag: 'Учебник · Эвристики Нильсена', title: 'Видимость состояния', description: 'Интерфейс не должен молчать: как и когда сообщать, что происходит.', meta: '2 мин · по материалам NN/g' },
  { kind: 'lesson', tag: 'Учебник · Доступность (WCAG 2.2)', title: 'Размер цели касания и расстояние между интерактивными элементами', description: 'Почему 24 пикселя — минимум, а 44 — норма, и что делать, если кнопки стоят вплотную друг к другу в плотном интерфейсе.', meta: '6 мин · по материалам W3C' },
];

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
      <Card name="result" mood="celebrate" tag="UX-тренажёр" title={<>Проверь себя<br />в UX и Figma</>} lead={`${QUESTIONS} вопросов по UX, гайдлайнам и Figma с разбором каждого ответа`} />

      <Card name="streak" mood="happy" tag="Стрик" title={<>Учусь<br />каждый день</>} lead={`По несколько вопросов в день — и кот Кегль доволен. ${tracks.length} ${plural(tracks.length, 'тема', 'темы', 'тем')} на выбор.`} />

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

      <h2 className="share-deck__title">Свои карточки — их рисует Mini App</h2>
      {SAMPLES.map((d, i) => (
        <img key={i} className="share-sample" src={`data:image/jpeg;base64,${renderShareCard(d)}`} width={1280} height={720} alt="" />
      ))}
    </div>
  );
}
