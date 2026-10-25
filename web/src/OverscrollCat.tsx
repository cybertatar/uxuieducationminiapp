import { useEffect, useRef } from 'react';
import { HangingCat, RunningCat } from './CatPoses';
import { haptic } from './tg';

/** Сколько нужно протянуть вниз, прежде чем верхний кот начнёт выезжать: чтобы он не появлялся от лёгкого оттягивания */
const HANG_DELAY = 60;

/** Клубок 9×9: светлые и тёмные витки нитки */
const YARN = ['..YYYYY..', '.YyYYYyY.', 'YYYyYYYyY', 'YyYYyYYYY', 'YYyYYyYyY', 'YYYyYYyYY', 'YyYYYyYYY', '.YYyYYYy.', '..YYYYY..'];

function Yarn() {
  return (
    <svg className="yarn" viewBox="0 0 9 9" shapeRendering="crispEdges">
      {YARN.flatMap((row, y) => [...row].map((ch, x) => (ch === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} className={ch === 'Y' ? 'yarn__wool' : 'yarn__thread'} />)))}
    </svg>
  );
}

/**
 * Пасхалка на iPhone. Протянешь страницу дальше конца — внизу Кегль гоняется за клубком,
 * дальше начала — сверху висит, вытянувшись, уцепившись лапами за край.
 * Во время «пружинки» scrollY уходит за границы страницы: кот выезжает на столько же, но не дальше своей высоты,
 * так что нижний бегает по полу экрана, а верхний висит у верхнего края. На Android пружинки нет — там котов не видно.
 * Стили обновляем напрямую, без ререндеров.
 */
export function OverscrollCat() {
  const bottom = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const full = new Set<HTMLElement>();

    const show = (el: HTMLElement | null, over: number) => {
      if (!el) return;
      const height = el.offsetHeight;
      const shown = Math.max(0, Math.min(over, height));
      el.style.setProperty('--over', `${shown}px`);
      // Пока страницу не тянут, кот спрятан целиком; анимации идут, только когда его видно
      el.classList.toggle('is-out', shown > 0);
      const isFull = shown >= height;
      // Один тап отдачи на каждое полное появление, а не на каждый кадр
      if (isFull && !full.has(el)) haptic.tap();
      if (isFull) full.add(el);
      else full.delete(el);
    };

    const update = () => {
      frame = 0;
      show(bottom.current, window.scrollY + window.innerHeight - document.documentElement.scrollHeight);
      show(top.current, -window.scrollY - HANG_DELAY);
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
    <>
      <div ref={bottom} className="overscroll-cat overscroll-cat--bottom" aria-hidden>
        <div className="chase">
          <RunningCat size={78} />
          <Yarn />
        </div>
      </div>
      <div ref={top} className="overscroll-cat overscroll-cat--top" aria-hidden>
        <HangingCat size={66} />
      </div>
    </>
  );
}
