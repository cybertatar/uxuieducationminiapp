// Анимация-гайд для приветствия бота: где в чате кнопка, которая открывает мини-апп.
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

/** Длина цикла, мс. Telegram крутит анимацию по кругу */
export const DURATION = 7000;

declare global {
  interface Window {
    setFrame: (t: number) => void;
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
const SCREEN_SCALE = 262 / SCREEN.width;
const PHONE = { x: 96, y: 112, bezel: 9 };
const FINGER_FROM = { x: 320, y: 470 };
/** Откуда летит конфетти — середина экрана телефона */
const BURST = { x: PHONE.x + PHONE.bezel + 131, y: PHONE.y + 250 };

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
  const [t, setT] = useState(() => Number(new URLSearchParams(location.search).get('t') ?? 0));
  // Палец целится в центр настоящей кнопки меню: её положение меряем в кадре один раз
  const root = useRef<HTMLDivElement>(null);
  const [button, setButton] = useState({ x: 140, y: 650 });
  useLayoutEffect(() => {
    const menu = root.current?.querySelector('.ob__menu')?.getBoundingClientRect();
    const frame = root.current?.getBoundingClientRect();
    if (menu && frame) setButton({ x: menu.left - frame.left + menu.width / 2, y: menu.top - frame.top + menu.height / 2 });
  }, []);

  useEffect(() => {
    window.setFrame = (ms) => flushSync(() => setT(ms));
    // Без ?t= анимация просто играет по кругу — удобно смотреть в браузере
    if (new URLSearchParams(location.search).has('t')) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setT((now - start) % DURATION);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Шаг 1: кот зовёт нажать, палец едет к кнопке и нажимает
  const callout = pop(span(t, 350, 750)) * (1 - span(t, 1700, 1850));
  const move = easeInOut(span(t, 700, 1550));
  const press = span(t, 1550, 1650) * (1 - span(t, 1750, 1850));
  const finger = span(t, 600, 850) * (1 - span(t, 1850, 2100));
  const ripple = span(t, 1600, 2150);
  // Шаг 2: мини-апп выезжает, конфетти, кот радуется. В конце мини-апп закрывается, и цикл начинается с того же чата
  const open = easeOut(span(t, 1850, 2400)) * (1 - easeInOut(span(t, 5700, 6200)));
  const cheer = pop(span(t, 2300, 2700)) * (1 - span(t, 5400, 5600));
  const burst = t - 1950;
  // Заголовок шага: старый уходит целиком, и только потом появляется новый
  const swap = span(t, 1850, 2250) * (1 - span(t, 5800, 6200));
  const first = 1 - clamp(swap * 2);
  const second = clamp(swap * 2 - 1);

  const mood: CatMood = t > 1900 && t < 5600 ? (t < 3400 ? 'celebrate' : 'happy') : 'idle';
  // Кот подпрыгивает, когда открылся тренажёр, а в остальное время спокойно дышит
  const jump = Math.sin(Math.PI * span(t, 1900, 2250)) * 22 + Math.sin(Math.PI * span(t, 2250, 2500)) * 8;
  const breathe = Math.sin((t / DURATION) * Math.PI * 6) * 1.5;

  const fx = FINGER_FROM.x + (button.x - FINGER_FROM.x) * move;
  const fy = FINGER_FROM.y + (button.y - FINGER_FROM.y) * move;

  return (
    <div className="ob" ref={root}>
      <div className="ob__dots" aria-hidden />

      <header className="ob__heading">
        <span className="ob__tag">UX/UI Trainer</span>
        <div className="ob__steps">
          <h1 style={{ opacity: first, transform: `translateY(${(first - 1) * 10}px)` }}>
            Нажми «Тренажёр»
            <br />
            слева от поля ввода
          </h1>
          <h1 style={{ opacity: second, transform: `translateY(${(1 - second) * 10}px)` }}>
            Готово! Можно
            <br />
            учиться 🎉
          </h1>
        </div>
      </header>

      <div className="ob__phone" style={{ left: PHONE.x, top: PHONE.y, padding: PHONE.bezel }}>
        <span className="ob__side ob__side--action" />
        <span className="ob__side ob__side--volume-up" />
        <span className="ob__side ob__side--volume-down" />
        <span className="ob__side ob__side--power" />
        <div className="ob__screen" style={{ width: SCREEN.width * SCREEN_SCALE, height: SCREEN.height * SCREEN_SCALE }}>
          <div className="ob__scaled" style={{ transform: `scale(${SCREEN_SCALE})` }}>
            <Chat open={open} press={press} />
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
                onSettings={() => {}}
                onCalendar={() => {}}
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
                  left: BURST.x + c.vx * s,
                  top: BURST.y + c.vy * s + 520 * s * s,
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

      <div className="ob__ripple" style={{ left: button.x, top: button.y, opacity: ripple > 0 ? 1 - ripple : 0, transform: `translate(-50%, -50%) scale(${0.4 + ripple * 1.4})` }} />
      <div className="ob__finger" style={{ left: fx, top: fy, opacity: finger, transform: `translate(-50%, -50%) scale(${1 - press * 0.2})` }} />

      <div className="ob__cat" style={{ transform: `translateY(${-jump - breathe}px)` }}>
        <Cat mood={mood} size={108} />
      </div>
      <Bubble scale={callout}>Мяу! Жми сюда 👉</Bubble>
      <Bubble scale={cheer}>Мур! Поехали 🐾</Bubble>
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
function Chat({ open, press }: { open: number; press: number }) {
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
        <span className="ob__menu" style={{ transform: `scale(${1 - press * 0.08})`, boxShadow: `0 0 0 ${press * 6}px rgba(255, 255, 255, 0.45), 0 4px 12px rgba(0, 80, 160, 0.3)` }}>
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
  );
}
