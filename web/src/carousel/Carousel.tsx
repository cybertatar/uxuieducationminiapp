// Карусель для Instagram (кейс в портфолио). Dev-страница /carousel.html, слайды 1080×1350.
// PNG снимаются скриптом из docs/DEVELOPMENT.md, исходные скриншоты лежат в ./shots.
import QRCode from 'qrcode';
import { useEffect, useState, type ReactNode } from 'react';
import { questions, tracks } from '../../../content';
import { Cat, type CatMood } from '../Cat';
import { plural, questionsWord } from '../format';
import { illustrations } from '../illustrations';
import { Wireframe } from '../Wireframe';
import ab from './shots/ab.png';
import feedback from './shots/feedback.png';
import grid from './shots/grid.png';
import home from './shots/home.png';
import hotspot from './shots/hotspot.png';
import settings from './shots/settings.png';
import avatarBlue from '../../../brand/avatar-blue.png';
import avatarMint from '../../../brand/avatar-mint.png';
import avatarYellow from '../../../brand/avatar-yellow.png';

const BOT_URL = 't.me/uxuitrainer_bot';

const visualCount = questions.filter((q) => q.kind === 'hotspot' || q.kind === 'image-choice' || ('image' in q && q.image)).length;
const TOTAL = 11;

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
        <p className="lead">Тесты по эвристикам, законам UX, Apple HIG, Material и WCAG — прямо в Telegram</p>
        <div className="cover__art">
          <Cat mood="happy" size={360} />
          <Phone src={home} className="cover__phone" />
        </div>
        <span className="swipe pixel">листай →</span>
      </Slide>

      {/* 2. Задача */}
      <Slide n={2}>
        <Tag>Задача</Tag>
        <h2>Дизайнеры читают гайдлайны, но редко проверяют себя</h2>
        <div className="cards">
          <div className="card">
            <b>Знания разбросаны</b>
            <span>NN/g, Laws of UX, Apple HIG, Material, WCAG — десятки сайтов на английском</span>
          </div>
          <div className="card">
            <b>Тесты скучные</b>
            <span>Стена текста и четыре варианта ответа — бросают на третьем вопросе</span>
          </div>
          <div className="card">
            <b>Нет привычки</b>
            <span>Без регулярной практики прочитанное быстро забывается</span>
          </div>
        </div>
        <div className="goal">
          <span className="pixel">Цель</span>
          <p>5 минут практики в день там, где дизайнеры и так проводят время, — в Telegram</p>
        </div>
      </Slide>

      {/* 3. Решение */}
      <Slide n={3}>
        <Tag>Решение</Tag>
        <h2>Mini App для тренировки и бот для привычки</h2>
        <div className="split">
          <div className="card card--big">
            <b>Mini App</b>
            <ul>
              <li>Сессии по 10 вопросов</li>
              <li>Разбор каждого ответа</li>
              <li>Прогресс по темам</li>
              <li>Стрик и повторение ошибок</li>
            </ul>
          </div>
          <div className="card card--big">
            <b>Бот</b>
            <ul>
              <li>Вопрос дня прямо в чат</li>
              <li>Напоминание о стрике</li>
              <li>Время, пояс и пауза — в настройках</li>
              <li>По умолчанию молчит</li>
            </ul>
          </div>
        </div>
        <div className="stats">
          <div>
            <b>{tracks.length}</b>
            <span>{plural(tracks.length, 'тема', 'темы', 'тем')}</span>
          </div>
          <div>
            <b>{questions.length}</b>
            <span>{questionsWord(questions.length)}</span>
          </div>
          <div>
            <b>{visualCount}</b>
            <span>на макетах</span>
          </div>
        </div>
      </Slide>

      {/* 4. Темы */}
      <Slide n={4}>
        <Tag>Контент</Tag>
        <h2>Пять тем — от базы до гайдлайнов платформ</h2>
        <div className="tracks">
          {tracks.map((t) => (
            <div key={t.id} className="track-row">
              <div className="track-row__art">
                <Wireframe name={t.art} />
              </div>
              <div>
                <b>{t.title}</b>
                <span>
                  {questions.filter((q) => q.track === t.id).length} {questionsWord(questions.filter((q) => q.track === t.id).length)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="note">Каждый факт сверен с первоисточником: nngroup.com, lawsofux.com, developer.apple.com, документация Google, w3.org</p>
      </Slide>

      {/* 5. Форматы */}
      <Slide n={5}>
        <Tag>Форматы</Tag>
        <h2>Меньше текста — больше макетов</h2>
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

      {/* 6. Разбор */}
      <Slide n={6} className="explain">
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
              <b>Первоисточник</b>
              <span>ссылка на статью, чтобы копнуть глубже</span>
            </li>
          </ol>
        </div>
      </Slide>

      {/* 7. Итерации */}
      <Slide n={7}>
        <Tag>Итерации</Tag>
        <h2>Протестировали — поправили</h2>
        <p className="lead">Каждая правка — после живого теста в Telegram</p>
        <div className="iterations">
          {[
            ['Простыни текста наскучивают', 'Вопросы на макетах, вайрфреймы и кот-маскот'],
            ['Варианты A и B мелкие', 'Варианты друг под другом на всю ширину'],
            ['Кнопка спорит со скруглениями экрана', 'Своя кнопка с отступом от safe area'],
            ['Верный ответ наугад ничему не учит', 'Разбор после любого ответа'],
            ['Не хватает гайдлайнов платформ', 'Новые темы: HIG, Material, WCAG'],
          ].map(([was, now]) => (
            <div key={was} className="iteration">
              <span className="iteration__was">{was}</span>
              <span className="iteration__arrow pixel">→</span>
              <span className="iteration__now">{now}</span>
            </div>
          ))}
        </div>
      </Slide>

      {/* 8. Привычка */}
      <Slide n={8} className="habit">
        <Tag>Привычка</Tag>
        <h2>Возвращаться хочется, а бот не раздражает</h2>
        <div className="habit__body">
          <div className="habit__list">
            <div className="card">
              <b>Стрик 🔥</b>
              <span>день засчитывается за сессию или за вопрос дня</span>
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
              <b>Бот по умолчанию молчит</b>
              <span>вопрос дня — только после выбора времени; пауза на 7 дней в один тап</span>
            </div>
          </div>
          <Phone src={settings} className="phone--tall" />
        </div>
      </Slide>

      {/* 9. Кот */}
      <Slide n={9} className="mascot">
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

      {/* 10. Под капотом */}
      <Slide n={10}>
        <Tag>Под капотом</Tag>
        <h2>Бесплатно, быстро, проверяемо</h2>
        <div className="tech">
          {[
            ['Telegram Mini App', 'React + Vite, нативная тема Telegram, светлая и тёмная'],
            ['Cloudflare Workers + D1', 'API, бот и база в одном воркере — на бесплатном тарифе'],
            [`${Object.keys(illustrations).length} ${plural(Object.keys(illustrations).length, 'иллюстрация', 'иллюстрации', 'иллюстраций')} кодом`, 'вайрфреймы собираются из деталей и сами меняют цвета под тему'],
            ['Больше 300 автотестов', 'стрики, повторения, часовые пояса и проверка каждого вопроса: картинки, ссылки, разбор'],
          ].map(([t, d]) => (
            <div key={t} className="tech__row">
              <b>{t}</b>
              <span>{d}</span>
            </div>
          ))}
        </div>
      </Slide>

      {/* 11. Призыв */}
      <Slide n={11} className="cta">
        <Tag>Попробовать</Tag>
        <h2>Пять минут в день — и гайдлайны в голове</h2>
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
