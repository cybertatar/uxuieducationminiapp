// Карусель для Instagram (кейс в портфолио). Dev-страница /carousel.html, слайды 1080×1350.
// PNG снимаются скриптом из docs/DEVELOPMENT.md, исходные скриншоты лежат в ./shots.
import QRCode from 'qrcode';
import { useEffect, useState, type ReactNode } from 'react';
import { lessons, questions, sections, tracks } from '../../../content';
import { Cat, type CatMood } from '../Cat';
import { plural, questionsWord } from '../format';
import { illustrations } from '../illustrations';
import { Wireframe } from '../Wireframe';
import ab from './shots/ab.png';
import feedback from './shots/feedback.png';
import grid from './shots/grid.png';
import home from './shots/home.png';
import hotspot from './shots/hotspot.png';
import lesson from './shots/lesson.png';
import result from './shots/result.png';
import avatarBlue from '../../../brand/avatar-blue.png';
import avatarMint from '../../../brand/avatar-mint.png';
import avatarYellow from '../../../brand/avatar-yellow.png';

const BOT_URL = 't.me/uxuitrainer_bot';

const visualCount = questions.filter((q) => ('image' in q && q.image) || q.kind === 'image-choice' || (q.kind === 'multi' && q.images)).length;
const TOTAL = 12;
/** «1000+», а не точное число: подпись не устаревает с каждым новым вопросом */
const QUESTIONS = `${Math.floor(questions.length / 100) * 100}+`;
const lessonsWord = (n: number) => plural(n, 'урок', 'урока', 'уроков');

function Slide({ n, children, className = '' }: { n: number; children: ReactNode; className?: string }) {
  return (
    <section className={`slide ${className}`} data-slide={n}>
      {children}
      <footer className="slide__footer">
        <span className="pixel">UX-тренажёр</span>
        <span className="pixel">
          {String(n).padStart(2, '0')}/{TOTAL}
        </span>
      </footer>
    </section>
  );
}

const Phone = ({ src, className = '' }: { src: string; className?: string }) => (
  <div className={`phone ${className}`}>
    <img src={src} alt="" />
  </div>
);

const Tag = ({ children }: { children: ReactNode }) => <span className="tag pixel">{children}</span>;

export function Carousel() {
  const [qr, setQr] = useState('');
  useEffect(() => {
    QRCode.toString(`https://${BOT_URL}`, { type: 'svg', margin: 0, color: { dark: '#17171c', light: '#ffffff' } }).then(setQr);
  }, []);

  const moods: [CatMood, string][] = [
    ['idle', 'ждёт'],
    ['happy', 'верно'],
    ['sad', 'ошибка'],
    ['celebrate', 'отлично'],
    ['sleep', 'офлайн'],
  ];

  return (
    <div className="deck">
      {/* 1. Обложка */}
      <Slide n={1} className="cover">
        <Tag>Кейс · Telegram Mini App</Tag>
        <h1 className="cover__title">
          UX-тренажёр
          <br />с котом Кеглем
        </h1>
        <p className="lead">Учит основам UX/UI, гайдлайнов и Figma, а тесты не дают знаниям вылететь из головы</p>
        <div className="cover__art">
          <Cat mood="happy" size={360} />
          <Phone src={home} className="cover__phone" />
        </div>
        <span className="swipe pixel">листай →</span>
      </Slide>

      {/* 2. Задача */}
      <Slide n={2}>
        <Tag>Задача</Tag>
        <h2>Основы дизайна сложно выучить и легко забыть</h2>
        <div className="cards">
          <div className="card">
            <b>Знания разбросаны</b>
            <span>NN/g, Laws of UX, Apple, Google, W3C, справка Figma — десятки сайтов на английском</span>
          </div>
          <div className="card">
            <b>Статьи — не для новичков</b>
            <span>Длинно, сложно и без примеров — непонятно, с чего начать</span>
          </div>
          <div className="card">
            <b>Прочитал — забыл</b>
            <span>Без практики и повторения теория выветривается за неделю</span>
          </div>
        </div>
        <div className="goal">
          <span className="pixel">Цель</span>
          <p>Учиться по 5 минут в день там, где дизайнеры и так проводят время, — в Telegram: урок, практика, повторение</p>
        </div>
      </Slide>

      {/* 3. Решение */}
      <Slide n={3}>
        <Tag>Решение</Tag>
        <h2>Учебник объясняет, тесты закрепляют, бот напоминает</h2>
        <div className="split">
          <div className="card card--big">
            <b>Учиться</b>
            <ul>
              <li>Уроки простым языком</li>
              <li>Примеры из жизни и макеты</li>
              <li>Три вопроса после урока</li>
              <li>Следующий урок по порядку</li>
            </ul>
          </div>
          <div className="card card--big">
            <b>Закреплять</b>
            <ul>
              <li>Сессии по 10 вопросов</li>
              <li>Разбор каждого ответа</li>
              <li>Повторение ошибок</li>
              <li>Стрик и вопрос дня в чате</li>
            </ul>
          </div>
        </div>
        <div className="stats">
          <div>
            <b>{lessons.length}</b>
            <span>{lessonsWord(lessons.length)}</span>
          </div>
          <div>
            <b>{questions.length}</b>
            <span>{questionsWord(questions.length)}</span>
          </div>
          <div>
            <b>{tracks.length}</b>
            <span>{plural(tracks.length, 'тема', 'темы', 'тем')}</span>
          </div>
        </div>
      </Slide>

      {/* 4. Темы */}
      <Slide n={4}>
        <Tag>Контент</Tag>
        <h2>
          {tracks.length} {plural(tracks.length, 'тема', 'темы', 'тем')} в трёх разделах
        </h2>
        <div className="sections">
          {sections.map((sec) => (
            <div key={sec.id} className="section-card">
              <b>{sec.title}</b>
              <div className="section-card__tracks">
                {sec.tracks.map((id) => {
                  const t = tracks.find((x) => x.id === id)!;
                  return (
                    <span key={id} className="section-card__track">
                      {t.emoji} {t.title}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="note">Каждый факт сверен с первоисточником</p>
      </Slide>

      {/* 5. Учебник */}
      <Slide n={5} className="explain">
        <Tag>Учебник</Tag>
        <h2>Сначала — урок простым языком</h2>
        <p className="lead">
          {lessons.length} {lessonsWord(lessons.length)} по всем {tracks.length} темам — от эвристик до автолейаута
        </p>
        <div className="explain__body">
          <Phone src={lesson} className="phone--tall" />
          <ol className="callouts">
            <li>
              <b>Простым языком</b>
              <span>пересказ NN/g, Laws of UX, Apple, Google, W3C и справки Figma</span>
            </li>
            <li>
              <b>Примеры из жизни</b>
              <span>лифт, врач, аварийный выход — чтобы принцип запомнился</span>
            </li>
            <li>
              <b>Так себе / лучше</b>
              <span>два вайрфрейма рядом вместо абзаца текста</span>
            </li>
            <li>
              <b>Сразу практика</b>
              <span>три вопроса на закрепление, а дальше — следующий урок</span>
            </li>
          </ol>
        </div>
      </Slide>

      {/* 6. Форматы */}
      <Slide n={6}>
        <Tag>Форматы</Tag>
        <h2>Закрепляем на макетах, а не на тексте</h2>
        <p className="lead">
          {visualCount} {questionsWord(visualCount)} на вайрфреймах: тапни, сравни, выбери
        </p>
        <div className="phones">
          {[
            [hotspot, 'Найди проблему', 'тапом по макету'],
            [ab, 'A или B', 'какой вариант лучше'],
            [grid, 'Ответ картинкой', 'сетка 2×2'],
          ].map(([src, title, sub]) => (
            <figure key={title}>
              <Phone src={src} />
              <figcaption>
                <b>{title}</b>
                <span>{sub}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Slide>

      {/* 7. Разбор */}
      <Slide n={7} className="explain">
        <Tag>Разбор</Tag>
        <h2>Даже угаданный ответ должен чему-то учить</h2>
        <div className="explain__body">
          <Phone src={feedback} className="phone--tall" />
          <ol className="callouts">
            <li>
              <b>Суть в одну строку</b>
              <span>видна сразу — для тех, кто торопится</span>
            </li>
            <li>
              <b>Полное объяснение</b>
              <span>после любого ответа, а не только после ошибки</span>
            </li>
            <li>
              <b>Как правильно</b>
              <span>исправленный вайрфрейм рядом с ошибкой</span>
            </li>
            <li>
              <b>Урок и первоисточник</b>
              <span>из ошибки — сразу в урок учебника или в статью</span>
            </li>
          </ol>
        </div>
      </Slide>

      {/* 8. Итерации */}
      <Slide n={8}>
        <Tag>Итерации</Tag>
        <h2>Протестировали — поправили</h2>
        <div className="iterations">
          {[
            ['Простыни текста наскучивают', 'Вопросы на макетах, вайрфреймы и кот-маскот'],
            ['Верный ответ наугад ничему не учит', 'Разбор после любого ответа'],
            ['Не хватает гайдлайнов и Figma', 'Новые темы: HIG, Material, WCAG и шесть тем по Figma'],
            ['Тест проверяет, но не объясняет', 'Учебник: урок по каждой теме ошибки'],
            ['Настройки уведомлений теряются внизу', 'Строка прямо в карточке стрика'],
          ].map(([was, now]) => (
            <div key={was} className="iteration">
              <span className="iteration__was">{was}</span>
              <span className="iteration__arrow pixel">→</span>
              <span className="iteration__now">{now}</span>
            </div>
          ))}
        </div>
      </Slide>

      {/* 9. Привычка */}
      <Slide n={9} className="habit">
        <Tag>Привычка</Tag>
        <h2>Чтобы хотелось вернуться — и позвать друзей</h2>
        <div className="habit__body">
          <div className="habit__list">
            <div className="card">
              <b>Стрик 🔥</b>
              <span>день засчитывается за сессию или за вопрос дня; напомнить можно в один тап</span>
            </div>
            <div className="card">
              <b>Повторение ошибок</b>
              <div className="spaced">
                {['1 день', '3 дня', '7 дней'].map((d, i) => (
                  <span key={d} className="spaced__step" style={{ opacity: 1 - i * 0.2 }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="card">
              <b>Поделиться</b>
              <span>результат, стрик или урок уходят в чат карточкой с твоими цифрами</span>
            </div>
          </div>
          <Phone src={result} className="phone--tall" />
        </div>
      </Slide>

      {/* 10. Кот */}
      <Slide n={10} className="mascot">
        <Tag>Маскот</Tag>
        <h2>Кегль реагирует на каждый ответ</h2>
        <div className="moods">
          {moods.map(([m, label]) => (
            <figure key={m}>
              <Cat mood={m} size={168} />
              <figcaption className="pixel">{label}</figcaption>
            </figure>
          ))}
        </div>
        <div className="avatars">
          {[avatarBlue, avatarYellow, avatarMint].map((src) => (
            <img key={src} src={src} alt="" />
          ))}
          <span>Аватарки бота — тот же спрайт на разных фонах</span>
        </div>
        <div className="sprite card">
          <pre>{`....K..............K....\n....KOK..........KOK....\n..KWWWWWWWWWWWWWWWWWWK..\nSSKWWWEEWWWWWWWEEWWWKSS\n..KWWWWWWWWOOWWWWWWWWK..\n......KOOOOOOOOOOK......`}</pre>
          <span>Пиксельный спрайт описан строками кода: один символ — один пиксель. Цвета берутся из темы Telegram.</span>
        </div>
      </Slide>

      {/* 11. Под капотом */}
      <Slide n={11}>
        <Tag>Под капотом</Tag>
        <h2>Бесплатно, быстро, проверяемо</h2>
        <div className="tech">
          {[
            ['Telegram Mini App', 'React + Vite, нативная тема Telegram, светлая и тёмная'],
            ['Cloudflare Workers + D1', 'API, бот и база в одном воркере — на бесплатном тарифе'],
            [`${Object.keys(illustrations).length} ${plural(Object.keys(illustrations).length, 'иллюстрация', 'иллюстрации', 'иллюстраций')} кодом`, 'вайрфреймы собираются из деталей и сами меняют цвета под тему'],
            ['Больше 2400 автотестов', 'стрики, повторения, часовые пояса, шеринг и проверка каждого вопроса и урока: картинки, ссылки, разбор'],
          ].map(([t, d]) => (
            <div key={t} className="tech__row">
              <b>{t}</b>
              <span>{d}</span>
            </div>
          ))}
        </div>
      </Slide>

      {/* 12. Призыв */}
      <Slide n={12} className="cta">
        <Tag>Попробовать</Tag>
        <h2>Пять минут в день — и основы в голове</h2>
        <div className="cta__body">
          <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} />
          <div className="cta__link">
            <span className="pixel">Telegram</span>
            <b>{BOT_URL}</b>
            <span>Отсканируй QR-код или найди бота по ссылке</span>
          </div>
        </div>
        <div className="cta__cat">
          <Cat mood="celebrate" size={260} />
        </div>
        <p className="note">Проект некоммерческий — для дизайн-сообщества</p>
      </Slide>
    </div>
  );
}
