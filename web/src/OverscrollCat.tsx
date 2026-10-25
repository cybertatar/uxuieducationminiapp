import { useEffect, useRef } from 'react';
import { Cat } from './Cat';
import { haptic } from './tg';

/** С какой высоты «пружинки» кот целиком выглянул и заговорил */
const PEEK = 96;

/**
 * Пасхалка: если на iPhone протянуть страницу дальше конца, снизу выглядывает Кегль.
 * Во время «пружинки» scrollY уходит за конец страницы — на столько кот и поднимается.
 * На Android пружинки нет, поэтому там он не появляется. Обновляем стили напрямую, без ререндеров.
 */
export function OverscrollCat() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let frame = 0;
    let said = false;
    const update = () => {
      frame = 0;
      const over = window.scrollY + window.innerHeight - document.documentElement.scrollHeight;
      const shown = Math.max(0, Math.min(over, PEEK * 1.5));
      el.style.setProperty('--over', `${shown}px`);
      const peeking = shown >= PEEK;
      el.classList.toggle('is-peeking', peeking);
      // Один тап отдачи на каждое выглядывание, а не на каждый кадр
      if (peeking && !said) haptic.tap();
      said = peeking;
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={root} className="overscroll-cat" aria-hidden>
      <span className="overscroll-cat__bubble">Дальше только я</span>
      <Cat mood="happy" size={72} />
    </div>
  );
}
