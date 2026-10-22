// Анимация-гайд для приветствия бота: где в чате кнопка, которая открывает мини-апп.
// Dev-страница /onboarding.html. Кадр зависит только от времени t, поэтому скрипт
// scripts/render-onboarding.mjs снимает ровные кадры через window.setFrame(t) и склеивает их в MP4.
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { trackById } from '../../../content';
import type { Profile } from '../../../src/api-types';
import { Home } from '../screens/Home';
import avatar from '../../../brand/avatar-blue.png';

/** Длина цикла, мс. Telegram крутит анимацию по кругу */
export const DURATION = 6000;

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

/** Центр кнопки меню в координатах кадра 360×600 */
const BUTTON = { x: 58, y: 572 };
const FINGER_FROM = { x: 250, y: 430 };

export function Onboarding() {
  const [t, setT] = useState(() => Number(new URLSearchParams(location.search).get('t') ?? 0));

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

  const tip = span(t, 300, 700) * (1 - span(t, 1650, 1850));
  const move = easeInOut(span(t, 600, 1450));
  const press = span(t, 1450, 1550) * (1 - span(t, 1650, 1750));
  const finger = span(t, 500, 750) * (1 - span(t, 1750, 2000));
  const ripple = span(t, 1500, 2000);
  // Мини-апп выезжает после нажатия, а в конце закрывается свайпом вниз — и цикл начинается с того же чата
  const open = easeOut(span(t, 1750, 2300)) * (1 - easeInOut(span(t, 5100, 5600)));

  const fx = FINGER_FROM.x + (BUTTON.x - FINGER_FROM.x) * move;
  const fy = FINGER_FROM.y + (BUTTON.y - FINGER_FROM.y) * move;

  return (
    <div className="ob">
      <Chat open={open} press={press} tip={tip} />

      <div className="ob__ripple" style={{ left: BUTTON.x, top: BUTTON.y, opacity: ripple > 0 ? 1 - ripple : 0, transform: `translate(-50%, -50%) scale(${0.4 + ripple * 1.6})` }} />
      <div className="ob__finger" style={{ left: fx, top: fy, opacity: finger, transform: `translate(-50%, -50%) scale(${1 - press * 0.2})` }} />

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
  );
}

/** Чат с ботом: шапка, приветствие и поле ввода с кнопкой меню */
function Chat({ open, press, tip }: { open: number; press: number; tip: number }) {
  return (
    <div className="ob__chat" style={{ transform: `scale(${1 - open * 0.04})`, filter: `brightness(${1 - open * 0.35})` }}>
      <header className="ob__header">
        <span className="ob__back">‹</span>
        <span className="ob__title">
          <b>UX/UI Trainer</b>
          <span>бот</span>
        </span>
        <img className="ob__avatar" src={avatar} alt="" />
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
        <span className="ob__menu" style={{ transform: `scale(${1 - press * 0.08})` }}>
          Тренажёр
        </span>
        <span className="ob__field">Сообщение</span>
        <span className="ob__mic" aria-hidden>
          <svg viewBox="0 0 24 24">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M6 11a6 6 0 0 0 12 0M12 17v4" />
          </svg>
        </span>
      </footer>
      <div className="ob__tip" style={{ opacity: tip, transform: `translateY(${(1 - tip) * 6}px)` }}>
        Тренажёр открывается здесь
      </div>
    </div>
  );
}
