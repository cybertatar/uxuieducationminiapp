// Анимация-гайд: как открыть мини-апп из чата с ботом.
// Dev-страница /onboarding.html. Кадр зависит только от времени t, поэтому скрипт
// scripts/render-onboarding.mjs снимает ровные кадры через window.setFrame(t) и склеивает их в MP4.
//
// Тему пользователя бот на /start не знает (Telegram сообщает её только открытому мини-аппу),
// поэтому у гайда свой фирменный фон — он одинаково смотрится и в светлом, и в тёмном чате.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { trackById } from '../../../content';
import type { Profile } from '../../../src/api-types';
import { Cat, type CatMood } from '../Cat';
import { Home } from '../screens/Home';
import avatar from '../../../brand/avatar-blue.png';

declare global {
  interface Window {
    setFrame: (t: number) => void;
    /** Длина цикла текущего варианта, мс — её читает скрипт рендера */
    obDuration: number;
  }
}

/** Новичок: ровно то, что человек увидит при первом открытии */
const profile: Profile = {
  firstName: 'Аня',
  streak: {
    current: 0,
    best: 0,
    todayDone: false,
    activeDays: 0,
    week: ['20', '21', '22', '23', '24', '25', '26'].map((d) => ({ date: `2026-10-${d}`, active: false, isToday: d === '22' })),
  },
  tracks: [...trackById.keys()].map((id) => ({ id, total: 40, answered: 0, mastered: 0, attempts: 0, correct: 0 })),
  reviewDue: 0,
  weakTopics: [],
  lessonsRead: [],
  lastTrack: null,
  supporter: false,
  settings: {
    dailyEnabled: false,
    dailyTime: '10:00',
    reminderEnabled: true,
    reminderTime: '20:00',
    tz: 'Europe/Moscow',
    pausedUntil: null,
    canMessage: true,
  },
};

const clamp = (x: number) => Math.min(1, Math.max(0, x));
/** Доля пройденного отрезка [from, to] */
const span = (t: number, from: number, to: number) => clamp((t - from) / (to - from));
const easeOut = (x: number) => 1 - (1 - x) ** 3;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
/** Появление с лёгким перелётом — для реплик кота */
const pop = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.7 * (x - 1) ** 3 + 1.7 * (x - 1) ** 2);

/**
 * Телефон в пропорциях iPhone 17: экран 402×874 pt, рамка ~2,3 мм, скругление экрана 55 pt.
 * Чат и приложение рисуются в настоящем размере экрана и уменьшаются целиком.
 */
const SCREEN = { width: 402, height: 874 };
type Point = { x: number; y: number };
type Target = 'start' | 'menu';
/** Отрезок времени [from, to], мс */
type Window_ = [number, number];

interface Scenario {
  /** Длина цикла, мс. Telegram крутит анимацию по кругу */
  duration: number;
  scale: number;
  phone: { x: number; y: number; bezel: number };
  fingerFrom: Point;
  burst: Point;
  cat: number;
  /** Заголовки шагов: когда каждый виден */
  titles: { text: [string, string]; shown: Window_[] }[];
  /** Реплики кота */
  bubbles: { text: string; shown: Window_ }[];
  /** Нажатия: на какую кнопку и когда палец касается её */
  taps: { target: Target; at: number }[];
  /** Когда палец появляется и исчезает */
  finger: Window_;
  /** Чат переходит от пустого («Старт») к диалогу; null — диалог с самого начала */
  started: Window_ | null;
  /** Мини-апп выезжает и закрывается */
  open: Window_;
  close: Window_;
}

const DONE: [string, string] = ['Готово!', 'Можно учиться 🎉'];

/**
 * Два варианта:
 * - chat — 400×400 для приветствия. Человек уже нажал «Старт», остаётся кнопка «Тренажёр».
 *   Telegram обрезает медиа в чате (Android — почти до квадрата), поэтому кадр квадратный:
 *   телефон целиком справа, текст и кот слева.
 * - wide — 480×270 (16:9) для картинки в описании бота (BotFather просит 640×360). Её видно в пустом чате,
 *   где вместо поля ввода только «Старт», поэтому шагов два: «Старт», затем «Тренажёр».
 *   Телефон крупнее и обрезан сверху — обе кнопки внизу.
 */
const SCENARIOS: Record<'chat' | 'wide', Scenario> = {
  chat: {
    duration: 7000,
    scale: 0.43,
    phone: { x: 201, y: 5, bezel: 7 },
    fingerFrom: { x: 330, y: 200 },
    burst: { x: 294, y: 170 },
    cat: 96,
    titles: [
      { text: ['Нажми «Тренажёр»', 'внизу чата'], shown: [[-1000, 1850], [6000, 99999]] },
      { text: DONE, shown: [[2050, 5800]] },
    ],
    bubbles: [
      { text: 'Мяу! Жми сюда 👉', shown: [350, 1700] },
      { text: 'Мур! Поехали 🐾', shown: [2300, 5400] },
    ],
    taps: [{ target: 'menu', at: 1550 }],
    finger: [600, 1850],
    started: null,
    open: [1850, 2400],
    close: [5700, 6200],
  },
  wide: {
    duration: 9800,
    scale: 0.5,
    phone: { x: 237, y: -189, bezel: 7 },
    fingerFrom: { x: 420, y: 110 },
    burst: { x: 344, y: 150 },
    cat: 80,
    titles: [
      { text: ['Нажми «Старт»', 'внизу чата'], shown: [[-1000, 1650], [9400, 99999]] },
      { text: ['Теперь — кнопка', '«Тренажёр»'], shown: [[1850, 3550]] },
      { text: DONE, shown: [[3750, 8500]] },
    ],
    bubbles: [
      { text: 'Мяу! Начнём? 👉', shown: [300, 1500] },
      { text: 'А теперь сюда 👉', shown: [2100, 3400] },
      { text: 'Мур! Поехали 🐾', shown: [4100, 8100] },
    ],
    taps: [
      { target: 'start', at: 1400 },
      { target: 'menu', at: 3250 },
    ],
    finger: [500, 3550],
    started: [1550, 2050],
    open: [3550, 4100],
    close: [8400, 8900],
  },
};

const params = new URLSearchParams(location.search);
const scenario = SCENARIOS[params.get('layout') === 'wide' ? 'wide' : 'chat'];
const layout = params.get('layout') === 'wide' ? 'wide' : 'chat';
const SCREEN_SCALE = scenario.scale;
const PHONE = scenario.phone;

/** Видимость на отрезке с плавным входом и выходом за fade мс */
const visible = (t: number, [from, to]: Window_, fade = 200) => span(t, from, from + fade) * (1 - span(t, to, to + fade));

/** Конфетти: детерминированный «случайный» набор, чтобы каждый рендер давал те же кадры */
const CONFETTI = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  const angle = -Math.PI / 2 + (r(1) - 0.5) * 2.4;
  const speed = 260 + r(2) * 220;
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    spin: (r(3) - 0.5) * 900,
    size: 6 + Math.round(r(4) * 4),
    color: ['#ffd166', '#c8f0d0', '#ffffff', '#ff8a00', '#ffd166'][i % 5],
  };
});

export function Onboarding() {
  const [t, setT] = useState(() => Number(params.get('t') ?? 0));
  // Палец целится в центры настоящих кнопок: их положение в кадре меряем один раз
  const root = useRef<HTMLDivElement>(null);
  const [buttons, setButtons] = useState<Record<Target, Point>>({ start: { x: 0, y: 0 }, menu: { x: 0, y: 0 } });
  useLayoutEffect(() => {
    const frame = root.current!.getBoundingClientRect();
    const center = (selector: string) => {
      const r = root.current!.querySelector(selector)!.getBoundingClientRect();
      return { x: r.left - frame.left + r.width / 2, y: r.top - frame.top + r.height / 2 };
    };
    setButtons({ start: center('.ob__start'), menu: center('.ob__menu') });
  }, []);

  useEffect(() => {
    window.obDuration = scenario.duration;
    window.setFrame = (ms) => flushSync(() => setT(ms));
    // Без ?t= анимация просто играет по кругу — удобно смотреть в браузере
    if (params.has('t')) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setT((now - start) % scenario.duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const { taps, duration } = scenario;

  // Палец: появляется, едет к первой кнопке, нажимает, едет к следующей
  let pos = scenario.fingerFrom;
  let press = 0;
  const pressed: Record<Target, number> = { start: 0, menu: 0 };
  taps.forEach((tap, i) => {
    const from = i === 0 ? scenario.fingerFrom : buttons[taps[i - 1].target];
    const leave = i === 0 ? scenario.finger[0] + 100 : taps[i - 1].at + 400;
    const move = easeInOut(span(t, leave, tap.at - 50));
    if (t >= leave) pos = { x: from.x + (buttons[tap.target].x - from.x) * move, y: from.y + (buttons[tap.target].y - from.y) * move };
    const p = span(t, tap.at - 50, tap.at + 50) * (1 - span(t, tap.at + 150, tap.at + 250));
    pressed[tap.target] = Math.max(pressed[tap.target], p);
    press = Math.max(press, p);
  });
  const finger = visible(t, scenario.finger, 250);

  const started = scenario.started ? easeOut(span(t, ...scenario.started)) * (1 - span(t, scenario.close[1] + 100, scenario.close[1] + 500)) : 1;
  const open = easeOut(span(t, ...scenario.open)) * (1 - easeInOut(span(t, ...scenario.close)));
  const opened = scenario.open[0];
  const burst = t - opened - 100;

  const mood: CatMood = t > opened + 50 && t < scenario.close[0] - 300 ? (t < opened + 1550 ? 'celebrate' : 'happy') : 'idle';
  // Кот подпрыгивает, когда открылся тренажёр, а в остальное время спокойно дышит
  const jump = Math.sin(Math.PI * span(t, opened + 50, opened + 400)) * 22 + Math.sin(Math.PI * span(t, opened + 400, opened + 650)) * 8;
  const breathe = Math.sin((t / duration) * Math.PI * 6) * 1.5;

  return (
    <div className={`ob ob--${layout}`} ref={root}>
      <div className="ob__dots" aria-hidden />

      <header className="ob__heading">
        <span className="ob__tag">UX/UI Trainer</span>
        <div className="ob__steps">
          {scenario.titles.map(({ text, shown }) => {
            // Заголовки сменяют друг друга: старый уходит целиком, и только потом появляется новый
            const o = Math.max(...shown.map((w) => visible(t, w)));
            return (
              <h1 key={text.join()} style={{ opacity: o, transform: `translateY(${(1 - o) * 8}px)` }}>
                {text[0]}
                <br />
                {text[1]}
              </h1>
            );
          })}
        </div>
      </header>

      <div className="ob__phone" style={{ left: PHONE.x, top: PHONE.y, padding: PHONE.bezel, ['--s' as string]: SCREEN_SCALE }}>
        <span className="ob__side ob__side--action" />
        <span className="ob__side ob__side--volume-up" />
        <span className="ob__side ob__side--volume-down" />
        <span className="ob__side ob__side--power" />
        <div className="ob__screen" style={{ width: SCREEN.width * SCREEN_SCALE, height: SCREEN.height * SCREEN_SCALE }}>
          <div className="ob__scaled" style={{ transform: `scale(${SCREEN_SCALE})` }}>
            <Chat open={open} started={started} pressed={pressed} />
            <div className="ob__app" style={{ transform: `translateY(${(1 - open) * 100}%)` }}>
              <div className="ob__tg-buttons">
                <span>✕ Закрыть</span>
                <span>⋯</span>
              </div>
              <Home
                profile={profile}
                starting={false}
                tab="progress"
                onTab={() => {}}
                section="all"
                onSection={() => {}}
                onStart={() => {}}
                learnSection="ux"
                onLearnSection={() => {}}
                onLearnTrack={() => {}}
                onLesson={() => {}}
                onSettings={() => {}}
                onCalendar={() => {}}
                onSuggest={() => {}}
                onSupport={() => {}}
              />
            </div>
          </div>
          <span className="ob__island" />
          <span className="ob__home-indicator" />
        </div>
      </div>

      {burst > 0 && burst < 1600 && (
        <div className="ob__confetti" aria-hidden>
          {CONFETTI.map((c, i) => {
            const s = burst / 1000;
            return (
              <i
                key={i}
                style={{
                  left: scenario.burst.x + c.vx * s,
                  top: scenario.burst.y + c.vy * s + 520 * s * s,
                  width: c.size,
                  height: c.size,
                  background: c.color,
                  opacity: 1 - span(burst, 1000, 1600),
                  transform: `rotate(${c.spin * s}deg)`,
                }}
              />
            );
          })}
        </div>
      )}

      {taps.map(({ target, at }) => {
        const ripple = span(t, at, at + 550);
        return (
          <div
            key={target}
            className="ob__ripple"
            style={{ left: buttons[target].x, top: buttons[target].y, opacity: ripple > 0 ? 1 - ripple : 0, transform: `translate(-50%, -50%) scale(${0.4 + ripple * 1.4})` }}
          />
        );
      })}
      <div className="ob__finger" style={{ left: pos.x, top: pos.y, opacity: finger, transform: `translate(-50%, -50%) scale(${1 - press * 0.2})` }} />

      <div className="ob__cat" style={{ transform: `translateY(${-jump - breathe}px)` }}>
        <Cat mood={mood} size={scenario.cat} />
      </div>
      {scenario.bubbles.map(({ text, shown: [from, to] }) => (
        <Bubble key={text} scale={pop(span(t, from, from + 400)) * (1 - span(t, to, to + 150))}>
          {text}
        </Bubble>
      ))}
    </div>
  );
}

/** Реплика кота: выскакивает из-за его головы */
function Bubble({ scale, children }: { scale: number; children: string }) {
  if (scale <= 0) return null;
  return (
    <div className="ob__bubble-cat" style={{ transform: `scale(${scale})`, opacity: Math.min(1, scale * 2) }}>
      {children}
    </div>
  );
}

/** Чат с ботом в современном Telegram для iOS: прозрачный статус-бар, стеклянные капсулы шапки и поля ввода */
function Chat({ open, started, pressed }: { open: number; started: number; pressed: Record<Target, number> }) {
  return (
    <div className="ob__chat" style={{ filter: `brightness(${1 - open * 0.35})` }}>
      <div className="ob__wallpaper" aria-hidden />
      <div className="ob__status">
        <span>10:24</span>
        <span className="ob__status-icons" aria-hidden>
          <svg viewBox="0 0 20 14" className="ob__wifi">
            <path d="M10 13.5 7.4 10.6a3.6 3.6 0 0 1 5.2 0zM4.6 7.9a7.6 7.6 0 0 1 10.8 0l-1.6 1.7a5.3 5.3 0 0 0-7.6 0zM1.8 5.1a11.6 11.6 0 0 1 16.4 0l-1.6 1.7a9.3 9.3 0 0 0-13.2 0z" />
          </svg>
          <span className="ob__battery">80</span>
        </span>
      </div>
      <header className="ob__header">
        <span className="ob__glass ob__glass--round ob__back">
          <svg viewBox="0 0 24 24">
            <path d="M15 4 7 12l8 8" />
          </svg>
        </span>
        <span className="ob__glass ob__title">
          <b>UX/UI Trainer</b>
          <span>бот</span>
        </span>
        <span className="ob__glass ob__glass--round ob__avatar">
          <img src={avatar} alt="" />
        </span>
      </header>
      <div className="ob__body">
        {/* Пустой чат до «Старт»: карточка с описанием бота и одна большая кнопка */}
        <div className="ob__layer ob__empty" style={{ opacity: clamp(1 - started * 2) }}>
          <div className="ob__about">
            <div className="ob__about-pic">
              <Cat mood="idle" size={64} />
            </div>
            <b>Что умеет этот бот?</b>
            <p>Тренажёр для UX/UI-дизайнеров с котом Кеглем 🐈 Тесты по эвристикам, законам UX, HIG, WCAG и Figma.</p>
          </div>
          <div className="ob__start-row">
            <span className="ob__glass ob__start" style={{ transform: `scale(${1 - pressed.start * 0.05})` }}>
              Старт
            </span>
          </div>
        </div>
        {/* Диалог после «Старт»: приветствие и поле ввода с кнопкой меню. Слои сменяются по очереди, без наложения */}
        <div className="ob__layer" style={{ opacity: clamp(started * 2 - 1), transform: `translateY(${(1 - started) * 30}px)` }}>
          <div className="ob__messages">
            <div className="ob__bubble ob__bubble--out">
              /start<span className="ob__time">10:24 ✓✓</span>
            </div>
            <div className="ob__bubble">
              Привет, Аня! 👋 Я Кегль, кот-тренажёр для&nbsp;дизайнеров&nbsp;🐈
              <br />
              <br />
              Тесты, разборы и стрик — в приложении.
              <span className="ob__time">10:24</span>
            </div>
          </div>
          <footer className="ob__input">
            <span className="ob__menu" style={{ transform: `scale(${1 - pressed.menu * 0.08})`, boxShadow: `0 0 0 ${pressed.menu * 6}px rgba(255, 255, 255, 0.45), 0 4px 12px rgba(0, 80, 160, 0.3)` }}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <rect x="4" y="5" width="16" height="14" rx="3.5" />
                <path d="M4 9.5h16" />
              </svg>
              Тренажёр
            </span>
            <span className="ob__glass ob__glass--round ob__icon" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="m20 11.5-7.8 7.8a5 5 0 0 1-7.1-7.1l8.2-8.2a3.4 3.4 0 0 1 4.8 4.8l-8.1 8.1a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4" />
              </svg>
            </span>
            <span className="ob__glass ob__field">
              Сообщение
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M20.5 12A8.5 8.5 0 1 1 12 3.5M20.5 12h-5a3.5 3.5 0 0 1-3.5-3.5v-5M20.5 12 12 3.5" />
              </svg>
            </span>
            <span className="ob__glass ob__glass--round ob__icon" aria-hidden>
              <svg viewBox="0 0 24 24">
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M6 11a6 6 0 0 0 12 0M12 17v4" />
              </svg>
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
