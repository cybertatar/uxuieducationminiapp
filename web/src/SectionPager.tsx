import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';

interface Props<T extends string> {
  /** Подпись ряда пилюль для скринридера */
  label: string;
  /** Префикс id вкладок и панелей: на одной странице могут жить два пейджера */
  idPrefix: string;
  items: { id: T; title: string }[];
  active: T;
  onChange: (id: T) => void;
  renderPage: (id: T) => ReactNode;
}

/**
 * Разделы — страницы горизонтальной ленты со scroll-snap:
 * на телефоне их листают свайпом, как папки в Telegram, а пилюли сверху следуют за лентой.
 * Экран не прокручивается целиком: у каждого раздела своя прокрутка, поэтому пилюли всегда на месте,
 * а свайп из середины списка не дёргает страницу. Родитель — .screen--tracks.
 */
export function SectionPager<T extends string>({ label, idPrefix, items, active, onChange, renderPage }: Props<T>) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabRow = useRef<HTMLDivElement>(null);
  const pager = useRef<HTMLDivElement>(null);
  /** Куда лента едет после тапа по пилюле: промежуточные страницы по пути не выбираем */
  const target = useRef<number | null>(null);
  const activeIndex = Math.max(0, items.findIndex((f) => f.id === active));
  const current = items[activeIndex].id;

  // При открытии и смене ширины экрана встаём ровно на текущую страницу.
  // На смену раздела не реагируем: во время свайпа это дёрнуло бы ленту под пальцем.
  const indexRef = useRef(activeIndex);
  indexRef.current = activeIndex;
  useLayoutEffect(() => {
    const el = pager.current;
    if (!el) return;
    const snap = () => {
      if (target.current === null) el.scrollLeft = indexRef.current * el.clientWidth;
    };
    snap();
    window.addEventListener('resize', snap);
    return () => window.removeEventListener('resize', snap);
  }, []);

  // Палец перехватил ленту на полпути после тапа или анимация закончилась — снова слушаем свайпы
  useEffect(() => {
    const el = pager.current;
    if (!el) return;
    const release = () => (target.current = null);
    el.addEventListener('scrollend', release);
    el.addEventListener('touchstart', release, { passive: true });
    return () => {
      el.removeEventListener('scrollend', release);
      el.removeEventListener('touchstart', release);
    };
  }, []);

  // Активная пилюля всегда видна, даже если ряд не влез в узкий экран
  useEffect(() => {
    const row = tabRow.current;
    const tab = tabs.current[activeIndex];
    if (!row || !tab) return;
    const left = tab.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + tab.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: left - (row.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [activeIndex]);

  const change = (i: number) => {
    if (i === activeIndex) return;
    onChange(items[i].id);
  };

  const go = (i: number) => {
    const el = pager.current;
    if (!el || i === activeIndex) return;
    target.current = i;
    change(i);
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  const onScroll = () => {
    const el = pager.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (target.current !== null) {
      if (i === target.current && Math.abs(el.scrollLeft - i * el.clientWidth) < 2) target.current = null;
      return;
    }
    // Пилюля переключается, как только страница перевалила за середину — как в Telegram
    if (i !== activeIndex && i >= 0 && i < items.length) change(i);
  };

  // Стрелки переключают вкладки, как положено у role="tablist"
  const onKeyDown = (e: KeyboardEvent) => {
    const next = { ArrowRight: activeIndex + 1, ArrowLeft: activeIndex - 1, Home: 0, End: items.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const j = (next + items.length) % items.length;
    go(j);
    tabs.current[j]?.focus();
  };

  return (
    <>
      <div className="section-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown} ref={tabRow}>
        {items.map((f, i) => (
          <button
            key={f.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            id={`${idPrefix}-${f.id}`}
            role="tab"
            aria-selected={f.id === current}
            aria-controls={`${idPrefix}-panel-${f.id}`}
            tabIndex={f.id === current ? 0 : -1}
            className={`section-tab ${f.id === current ? 'is-active' : ''}`}
            onClick={() => go(i)}
          >
            {f.title}
          </button>
        ))}
      </div>
      <div className="section-pager" ref={pager} onScroll={onScroll}>
        {items.map((f) => (
          <div
            key={f.id}
            id={`${idPrefix}-panel-${f.id}`}
            role="tabpanel"
            aria-labelledby={`${idPrefix}-${f.id}`}
            // Соседние страницы видны только во время свайпа — ни фокусу, ни скринридеру они не нужны
            inert={f.id !== current}
            className="section-page"
          >
            {renderPage(f.id)}
          </div>
        ))}
      </div>
    </>
  );
}
