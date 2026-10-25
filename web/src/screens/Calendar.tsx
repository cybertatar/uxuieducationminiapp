import { useEffect, useLayoutEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import type { HistoryDay, HistoryResponse, Profile } from '../../../src/api-types';
import { addMonths, dayLevel, monthGrid, monthOf, summarize, yearWeeks, type YearMonth } from '../../../src/calendar';
import { addDays } from '../../../src/time';
import { api } from '../api';
import { BackButton } from '../buttons';
import { days, plural, WEEKDAYS } from '../format';
import { notificationsSummary } from '../notify';
import { ShareButton } from '../share';

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const monthTitle = (ym: YearMonth) => `${MONTHS[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`;
const longDate = (d: string) => `${Number(d.slice(8))} ${MONTHS_GEN[Number(d.slice(5, 7)) - 1]}`;
const answersWord = (n: number) => plural(n, 'ответ', 'ответа', 'ответов');
const percent = (x: number) => `${Math.round(x * 100)}%`;

interface Props {
  profile: Profile;
  onBack: () => void;
  onSettings: () => void;
}

/** Календарь занятий: месяц с днями стрика, итоги и карта за год */
export function Calendar({ profile, onBack, onSettings }: Props) {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .history()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  return (
    <main className="screen calendar">
      <BackButton onClick={onBack} />
      <h1 className="page-title">Календарь</h1>
      <StreakTiles profile={profile} />
      {profile.streak.current > 0 && <ShareButton className="share-button--block" label="Поделиться стриком" request={{ kind: 'streak' }} />}
      {data ? (
        <>
          <MonthCard data={data} />
          <h2 className="section-title">За год</h2>
          <YearCard data={data} />
        </>
      ) : error ? (
        <p className="hint calendar__error">Не получилось загрузить историю. Проверь интернет и открой календарь ещё раз.</p>
      ) : (
        <>
          <div className="card skeleton" style={{ height: 330 }} />
          <div className="card skeleton" style={{ height: 150 }} />
        </>
      )}
      {/* Стрик и напоминания о нём — рядом: сюда приходят те, кому стрик важен */}
      <button className="cell calendar__notify" onClick={onSettings}>
        <span>🔔 Уведомления</span>
        <span className="cell__value">{notificationsSummary(profile.settings)} ›</span>
      </button>
    </main>
  );
}

function StreakTiles({ profile }: { profile: Profile }) {
  const { current, best, activeDays } = profile.streak;
  const tiles: [string, string][] = [
    [`${current}`, `${days(current)} подряд`],
    [`${best}`, 'рекорд стрика'],
    [`${activeDays}`, `${days(activeDays)} занятий`],
  ];
  return (
    <dl className="calendar__tiles">
      {tiles.map(([value, label]) => (
        <div key={label} className="stats__tile">
          <dt className="hint">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function MonthCard({ data }: { data: HistoryResponse }) {
  const byDate = useMemo(() => new Map(data.days.map((d) => [d.date, d])), [data]);
  const thisMonth = monthOf(data.today);
  const firstMonth = data.days.length ? monthOf(data.days[0].date) : thisMonth;
  const [month, setMonth] = useState(thisMonth);
  const [selected, setSelected] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);

  const canPrev = month > firstMonth;
  const canNext = month < thisMonth;
  const go = (n: number) => {
    setMonth((m) => addMonths(m, n));
    setSelected(null);
  };

  // Свайп по месяцу листает его, как в системном календаре
  const onTouchStart = (e: TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (dx > 50 && canPrev) go(-1);
    if (dx < -50 && canNext) go(1);
  };

  const grid = monthGrid(month);
  const monthDays = grid.flat().filter((d): d is string => !!d).map((d) => byDate.get(d)).filter((d): d is HistoryDay => !!d);
  const total = summarize(monthDays);
  const pick = selected ? byDate.get(selected) : undefined;
  const active = (d: string | null) => !!d && !!byDate.get(d)?.active;

  return (
    <section className="card month" aria-label="Месяц" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="month__head">
        <button className="month__nav" onClick={() => go(-1)} disabled={!canPrev} aria-label="Предыдущий месяц">
          ‹
        </button>
        <h2 className="month__title" aria-live="polite">
          {monthTitle(month)}
        </h2>
        <button className="month__nav" onClick={() => go(1)} disabled={!canNext} aria-label="Следующий месяц">
          ›
        </button>
      </div>
      <div className="month__weekdays" aria-hidden>
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="month__grid" role="grid">
        {grid.map((week, i) => (
          <div key={i} className="month__week" role="row">
            {week.map((d, j) => {
              if (!d) return <span key={j} className="day day--empty" role="gridcell" />;
              const info = byDate.get(d);
              const level = dayLevel(info);
              // Дни стрика подряд соединены полосой, как цепочка
              const chainPrev = info?.active && active(addDays(d, -1)) && j > 0;
              const chainNext = info?.active && active(addDays(d, 1)) && j < 6;
              const label = `${longDate(d)}: ${info?.active ? 'день засчитан' : 'не засчитан'}${info?.answers ? `, ${info.answers} ${answersWord(info.answers)}` : ''}`;
              return (
                <span key={d} role="gridcell" className={`day ${chainPrev ? 'chain-prev' : ''} ${chainNext ? 'chain-next' : ''}`}>
                  <button
                    className={`day__dot level-${level} ${d === data.today ? 'is-today' : ''} ${d === selected ? 'is-selected' : ''} ${d > data.today ? 'is-future' : ''}`}
                    disabled={d > data.today}
                    aria-label={label}
                    aria-pressed={d === selected}
                    onClick={() => setSelected(d === selected ? null : d)}
                  >
                    {Number(d.slice(8))}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <p className="month__summary" aria-live="polite">
        {selected ? (
          <>
            <b>{longDate(selected)}</b>
            {pick?.active ? ' · день засчитан' : ' · без занятий'}
            {pick?.answers ? ` · ${pick.answers} ${answersWord(pick.answers)}, ${percent(pick.correct / pick.answers)} верных` : ''}
          </>
        ) : total.activeDays === 0 && total.answers === 0 ? (
          'В этом месяце занятий не было'
        ) : (
          <>
            <b>
              {total.activeDays} {plural(total.activeDays, 'день', 'дня', 'дней')}
            </b>
            {total.answers > 0 && ` · ${total.answers} ${answersWord(total.answers)}`}
            {total.accuracy !== null && ` · ${percent(total.accuracy)} верных`}
          </>
        )}
      </p>
    </section>
  );
}

/** Карта за год: столбец — неделя, клетка — день, ярче — больше ответов. Прокручена к текущей неделе. */
function YearCard({ data }: { data: HistoryResponse }) {
  const byDate = useMemo(() => new Map(data.days.map((d) => [d.date, d])), [data]);
  const weeks = useMemo(() => yearWeeks(data.today), [data.today]);
  const scroller = useRef<HTMLDivElement>(null);
  const yearAgo = addDays(data.today, -364);
  const year = summarize(data.days.filter((d) => d.date >= yearAgo));

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  return (
    <section className="card year">
      <p className="hint">
        {year.activeDays} {plural(year.activeDays, 'день', 'дня', 'дней')} с занятиями
        {year.answers > 0 && ` · ${year.answers} ${answersWord(year.answers)}`}
      </p>
      <div className="year__scroll" ref={scroller}>
        <div className="year__months" aria-hidden>
          {weeks.map((w, i) => {
            // Подпись месяца — над неделей, в которую попало его первое число
            const first = w.find((d) => d?.endsWith('-01'));
            return <span key={i}>{first ? MONTHS_SHORT[Number(first.slice(5, 7)) - 1] : ''}</span>;
          })}
        </div>
        <div className="year__grid" role="img" aria-label={`Карта занятий за год: ${year.activeDays} ${plural(year.activeDays, 'день', 'дня', 'дней')} с занятиями`}>
          {weeks.map((w, i) => (
            <div key={i} className="year__week">
              {w.map((d, j) => (
                <span key={j} className={`year__cell ${d ? `level-${dayLevel(byDate.get(d))}` : 'is-empty'} ${d === data.today ? 'is-today' : ''}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="year__legend" aria-hidden>
        <span>Меньше</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`year__cell level-${l}`} />
        ))}
        <span>Больше</span>
      </div>
    </section>
  );
}
