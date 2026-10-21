import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { questionsByTrack, sections, trackById, type SectionId, type TrackId } from '../../../content';
import type { Profile } from '../../../src/api-types';
import { accuracy, trackHighlights } from '../../../src/stats';
import type { SessionMode } from '../App';
import { Cat, CAT_NAME, type CatMood } from '../Cat';
import { days, plural, questionsWord, WEEKDAYS } from '../format';
import { AUTHOR_URL, haptic, openTelegramLink } from '../tg';
import { Wireframe } from '../Wireframe';

export type HomeTab = 'progress' | 'tracks';

/** Фильтр на вкладке «Темы»: все разделы сразу или один */
export type SectionFilter = 'all' | SectionId;

interface Props {
  profile: Profile | null;
  starting: boolean;
  tab: HomeTab;
  onTab: (tab: HomeTab) => void;
  /** Раздел на вкладке «Темы»: хранится в App, чтобы не сбрасываться после сессии */
  section: SectionFilter;
  onSection: (section: SectionFilter) => void;
  onStart: (s: SessionMode) => void;
  onSettings: () => void;
}

/** Главная из двух вкладок: прогресс с трекером занятий и список тем. */
export function Home({ profile, starting, tab, onTab, section, onSection, onStart, onSettings }: Props) {
  return (
    <>
      {!profile ? <HomeSkeleton /> : tab === 'progress' ? <ProgressTab profile={profile} starting={starting} onStart={onStart} onSettings={onSettings} onTab={onTab} /> : <TracksTab profile={profile} starting={starting} onStart={onStart} section={section} onSection={onSection} />}
      <TabBar tab={tab} onTab={onTab} />
    </>
  );
}

type TabProps = Pick<Props, 'starting' | 'onStart'> & { profile: Profile };

function ProgressTab({ profile, starting, onStart, onSettings, onTab }: TabProps & Pick<Props, 'onSettings' | 'onTab'>) {
  const { streak } = profile;
  // Новичок ещё не прошёл ни одной сессии — сразу предлагаем начать, а не искать тесты на соседней вкладке
  const firstRun = streak.activeDays === 0;
  const answered = profile.tracks.some((t) => t.attempts > 0);
  const [mood, phrase] = catLine(profile);

  return (
    <main className="screen" aria-busy={starting}>
      <h1 className="visually-hidden">Прогресс</h1>
      <section className="hello">
        <Cat mood={mood} size={76} />
        <p className="hello__bubble">{phrase}</p>
      </section>

      {firstRun && <FirstRun starting={starting} onStart={onStart} onTab={onTab} />}

      <section className="streak card">
        <div className="streak__head">
          <div className={`streak__flame ${streak.todayDone ? 'is-lit' : ''}`} aria-hidden>
            🔥
          </div>
          <div>
            <div className="streak__count">
              {streak.current} <span>{days(streak.current)} подряд</span>
            </div>
            <div className="hint">
              {streak.todayDone
                ? 'Сегодня засчитано. Возвращайся завтра!'
                : streak.current > 0
                  ? 'Пройди сессию сегодня, чтобы не потерять стрик'
                  : 'Пройди первую сессию и начни стрик'}
            </div>
          </div>
        </div>
        <ol className="week" aria-label="Активность на этой неделе">
          {streak.week.map((d, i) => (
            <li key={d.date} className={`week__day ${d.active ? 'is-active' : ''} ${d.isToday ? 'is-today' : ''}`}>
              <span className="week__dot">{d.active ? '✓' : ''}</span>
              <span className="week__label">{WEEKDAYS[i]}</span>
            </li>
          ))}
        </ol>
      </section>

      {profile.reviewDue > 0 && (
        <button className="card review" disabled={starting} onClick={() => onStart({ mode: 'review' })}>
          <span className="review__icon" aria-hidden>
            ↻
          </span>
          <span className="review__body">
            <span className="review__title">Повторение</span>
            <span className="hint">
              {profile.reviewDue} {questionsWord(profile.reviewDue)}, к которым пора вернуться
            </span>
          </span>
          <span className="chevron" aria-hidden>
            ›
          </span>
        </button>
      )}

      {answered && (
        <>
          <h2 className="section-title">Статистика</h2>
          <Stats profile={profile} starting={starting} onStart={onStart} />
        </>
      )}

      <button className="cell" onClick={onSettings}>
        <span>🔔 Уведомления</span>
        <span className="cell__value">
          {profile.settings.dailyEnabled ? `Вопрос дня в ${profile.settings.dailyTime}` : 'Выключены'} ›
        </span>
      </button>

      <footer className="author">
        Автор —{' '}
        <button className="link" onClick={() => openTelegramLink(AUTHOR_URL)}>
          Daniil Tyncherov
        </button>
      </footer>
    </main>
  );
}

/** С чего начать: первая тема и короткий путь к выбору другой */
const FIRST_TRACK = 'heuristics';

function FirstRun({ starting, onStart, onTab }: Pick<Props, 'starting' | 'onStart' | 'onTab'>) {
  const track = trackById.get(FIRST_TRACK)!;
  return (
    <section className="card first-run">
      <span className="track__art" aria-hidden>
        <Wireframe name={track.art} />
      </span>
      <h2 className="first-run__title">Начни с первой сессии</h2>
      <p className="hint">
        10 вопросов по теме «{track.title}» — база любого дизайн-ревью. Это займёт около 5 минут.
      </p>
      <button className="button button--primary" disabled={starting} onClick={() => onStart({ mode: 'track', track: FIRST_TRACK })}>
        Начать
      </button>
      <button
        className="link first-run__other"
        onClick={() => {
          onTab('tracks');
          window.scrollTo({ top: 0 });
        }}
      >
        Выбрать другую тему
      </button>
    </section>
  );
}

const FILTERS: { id: SectionFilter; title: string }[] = [{ id: 'all', title: 'Все' }, ...sections.map((s) => ({ id: s.id, title: s.title }))];

/**
 * Темы по разделам. Разделы — страницы горизонтальной ленты со scroll-snap:
 * на телефоне их листают свайпом, как папки в Telegram, а пилюли сверху следуют за лентой.
 * Экран не прокручивается целиком: у каждого раздела своя прокрутка, поэтому пилюли всегда на месте,
 * а свайп из середины списка не дёргает страницу.
 */
function TracksTab({ profile, starting, onStart, section, onSection }: TabProps & Pick<Props, 'section' | 'onSection'>) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabRow = useRef<HTMLDivElement>(null);
  const pager = useRef<HTMLDivElement>(null);
  const pages = useRef<(HTMLDivElement | null)[]>([]);
  /** Куда лента едет после тапа по пилюле: промежуточные страницы по пути не выбираем */
  const target = useRef<number | null>(null);
  const activeIndex = Math.max(0, FILTERS.findIndex((f) => f.id === section));
  const active = FILTERS[activeIndex].id;
  const progress = new Map(profile.tracks.map((t) => [t.id, t]));

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
    haptic.tap();
    onSection(FILTERS[i].id);
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
    if (i !== activeIndex && i >= 0 && i < FILTERS.length) change(i);
  };

  // Стрелки переключают вкладки, как положено у role="tablist"
  const onKeyDown = (e: KeyboardEvent) => {
    const next = { ArrowRight: activeIndex + 1, ArrowLeft: activeIndex - 1, Home: 0, End: FILTERS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const j = (next + FILTERS.length) % FILTERS.length;
    go(j);
    tabs.current[j]?.focus();
  };

  return (
    <main className="screen screen--tracks" aria-busy={starting}>
      <h1 className="visually-hidden">Темы</h1>
      <div className="section-tabs" role="tablist" aria-label="Разделы тем" onKeyDown={onKeyDown} ref={tabRow}>
        {FILTERS.map((f, i) => (
          <button
            key={f.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            id={`section-${f.id}`}
            role="tab"
            aria-selected={f.id === active}
            aria-controls={`section-panel-${f.id}`}
            tabIndex={f.id === active ? 0 : -1}
            className={`section-tab ${f.id === active ? 'is-active' : ''}`}
            onClick={() => go(i)}
          >
            {f.title}
          </button>
        ))}
      </div>
      <div className="section-pager" ref={pager} onScroll={onScroll}>
        {FILTERS.map((f, i) => {
          const shown = f.id === 'all' ? sections : sections.filter((s) => s.id === f.id);
          const trackCount = shown.reduce((n, s) => n + s.tracks.length, 0);
          const count = shown.reduce((n, s) => n + s.tracks.reduce((m, id) => m + questionsByTrack(id).length, 0), 0);
          return (
            <div
              key={f.id}
              ref={(el) => {
                pages.current[i] = el;
              }}
              id={`section-panel-${f.id}`}
              role="tabpanel"
              aria-labelledby={`section-${f.id}`}
              // Соседние страницы видны только во время свайпа — ни фокусу, ни скринридеру они не нужны
              inert={f.id !== active}
              className="section-page"
            >
              <p className="hint section-hint">
                {trackCount} {plural(trackCount, 'тема', 'темы', 'тем')} · {count} {questionsWord(count)}
              </p>
              {shown.map((s) =>
                f.id === 'all' ? (
                  <section key={s.id} className="section-page__group" aria-labelledby={`group-${s.id}`}>
                    <h2 id={`group-${s.id}`} className="section-title">
                      {s.title}
                    </h2>
                    <TrackList ids={s.tracks} progress={progress} starting={starting} onStart={onStart} />
                  </section>
                ) : (
                  <TrackList key={s.id} ids={s.tracks} progress={progress} starting={starting} onStart={onStart} />
                ),
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

type TrackProgress = Profile['tracks'][number];

function TrackList({ ids, progress, starting, onStart }: Pick<Props, 'starting' | 'onStart'> & { ids: TrackId[]; progress: Map<TrackId, TrackProgress> }) {
  return (
    <div className="tracks">
      {ids.map((id) => {
        const t = progress.get(id)!;
        const track = trackById.get(id)!;
        const pct = Math.round((t.mastered / t.total) * 100);
        return (
          <button key={id} className="card track" disabled={starting} onClick={() => onStart({ mode: 'track', track: id })}>
            <span className="track__art" aria-hidden>
              <Wireframe name={track.art} />
            </span>
            <span className="track__body">
              <span className="track__title">{track.title}</span>
              <span className="hint">{track.description}</span>
              <span className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <span className="progress__fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="track__meta">
                Освоено {t.mastered} из {t.total}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const percent = (x: number) => `${Math.round(x * 100)}%`;

/** Сколько освоено, цифры по ответам и занятиям, сильная тема и тема, которую стоит подтянуть */
function Stats({ profile, starting, onStart }: TabProps) {
  const sum = (key: 'total' | 'mastered' | 'attempts' | 'correct') => profile.tracks.reduce((n, t) => n + t[key], 0);
  const total = sum('total');
  const mastered = sum('mastered');
  const attempts = sum('attempts');
  const acc = accuracy({ attempts, correct: sum('correct') });
  const { strongest, weakest } = trackHighlights(profile.tracks);
  const { best, activeDays } = profile.streak;

  const tiles: [string, string][] = [
    [acc === null ? '—' : percent(acc), 'верных ответов'],
    [`${attempts}`, plural(attempts, 'ответ', 'ответа', 'ответов')],
    [`${activeDays}`, `${days(activeDays)} занятий`],
    [`${best}`, `${days(best)} — рекорд стрика`],
  ];

  return (
    <section className="card stats">
      <div className="stats__head">
        <div className="stats__big">
          {mastered} <span>из {total}</span>
        </div>
        <div className="hint">
          {plural(mastered, 'вопрос освоен', 'вопроса освоено', 'вопросов освоено')} · {percent(mastered / total)}
        </div>
      </div>
      <span className="progress" role="progressbar" aria-label="Освоено вопросов" aria-valuenow={Math.round((mastered / total) * 100)} aria-valuemin={0} aria-valuemax={100}>
        <span className="progress__fill" style={{ width: percent(mastered / total) }} />
      </span>

      <dl className="stats__grid">
        {tiles.map(([value, label]) => (
          <div key={label} className="stats__tile">
            <dt className="hint">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {strongest && weakest ? (
        <div className="stats__tracks">
          <div className="stats__row">
            <span className="stats__row-body">
              <span className="hint">Сильнее всего</span>
              <span>
                {trackById.get(strongest.id)!.title} · {percent(strongest.accuracy)}
              </span>
            </span>
          </div>
          <button className="stats__row" disabled={starting} onClick={() => onStart({ mode: 'track', track: weakest.id })}>
            <span className="stats__row-body">
              <span className="hint">Стоит подтянуть</span>
              <span>
                {trackById.get(weakest.id)!.title} · {percent(weakest.accuracy)}
              </span>
            </span>
            <span className="chevron" aria-hidden>
              ›
            </span>
          </button>
        </div>
      ) : (
        <p className="hint stats__note">
          {attempts === 0
            ? 'Ответь на первые вопросы — здесь появится статистика.'
            : 'Порешай пару тем — покажу, где получается лучше всего, а что стоит подтянуть.'}
        </p>
      )}
    </section>
  );
}

/** Иконки вкладок 24×24: столбики прогресса и стопка карточек тем */
const TAB_ICONS: Record<HomeTab, ReactNode> = {
  progress: (
    <>
      <rect x="3.5" y="12" width="4.5" height="8.5" rx="2" />
      <rect x="9.75" y="7" width="4.5" height="13.5" rx="2" />
      <rect x="16" y="3.5" width="4.5" height="17" rx="2" />
    </>
  ),
  tracks: (
    <>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2.5" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="2.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="2.5" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="2.5" />
    </>
  ),
};

const TAB_LABELS: Record<HomeTab, string> = { progress: 'Прогресс', tracks: 'Темы' };

/** Плавающий таббар-капсула над контентом */
function TabBar({ tab, onTab }: Pick<Props, 'tab' | 'onTab'>) {
  return (
    <nav className="tabbar" aria-label="Разделы">
      <div className="tabbar__pill" role="tablist">
        {(Object.keys(TAB_LABELS) as HomeTab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`tabbar__item ${tab === t ? 'is-active' : ''}`}
            onClick={() => {
              if (t === tab) return;
              haptic.tap();
              onTab(t);
              window.scrollTo({ top: 0 });
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              {TAB_ICONS[t]}
            </svg>
            <span>{TAB_LABELS[t]}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/** Что говорит кот на главной — по ситуации */
function catLine(p: Profile): [CatMood, string] {
  const name = p.firstName ? `, ${p.firstName}` : '';
  if (p.streak.todayDone) return ['happy', `Сегодня всё засчитано${name}! Можно ещё — для удовольствия.`];
  if (p.reviewDue > 0) return ['idle', `Есть ${p.reviewDue} ${questionsWord(p.reviewDue)} на повторение. Разберём?`];
  if (p.streak.current > 0) return ['idle', `Стрик ${p.streak.current} ${days(p.streak.current)} — не дай ему сгореть!`];
  return ['idle', `Мяу${name}! Я ${CAT_NAME}. Пройдём 10 вопросов?`];
}

function HomeSkeleton() {
  return (
    <main className="screen" aria-busy>
      <div className="card skeleton" style={{ height: 76 }} />
      <div className="card skeleton" style={{ height: 148 }} />
      <div className="skeleton skeleton--text" style={{ width: 100, marginTop: 24 }} />
      <div className="card skeleton" style={{ height: 260 }} />
    </main>
  );
}
