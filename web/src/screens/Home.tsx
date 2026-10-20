import { questions, trackById } from '../../../content';
import type { Profile } from '../../../src/api-types';
import { accuracy, trackHighlights } from '../../../src/stats';
import type { SessionMode } from '../App';
import { Cat, CAT_NAME, type CatMood } from '../Cat';
import { days, plural, questionsWord, WEEKDAYS } from '../format';
import { AUTHOR_URL, openTelegramLink } from '../tg';
import { Wireframe } from '../Wireframe';

export type HomeTab = 'progress' | 'tracks';

interface Props {
  profile: Profile | null;
  starting: boolean;
  tab: HomeTab;
  onTab: (tab: HomeTab) => void;
  onStart: (s: SessionMode) => void;
  onSettings: () => void;
}

/** Главная из двух вкладок: прогресс с трекером занятий и список тем. */
export function Home({ profile, starting, tab, onTab, onStart, onSettings }: Props) {
  return (
    <>
      {!profile ? <HomeSkeleton /> : tab === 'progress' ? <ProgressTab profile={profile} starting={starting} onStart={onStart} onSettings={onSettings} /> : <TracksTab profile={profile} starting={starting} onStart={onStart} />}
      <TabBar tab={tab} onTab={onTab} />
    </>
  );
}

type TabProps = Pick<Props, 'starting' | 'onStart'> & { profile: Profile };

function ProgressTab({ profile, starting, onStart, onSettings }: TabProps & Pick<Props, 'onSettings'>) {
  const { streak } = profile;
  const [mood, phrase] = catLine(profile);

  return (
    <div className="screen" aria-busy={starting}>
      <section className="hello">
        <Cat mood={mood} size={76} />
        <p className="hello__bubble">{phrase}</p>
      </section>

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

      <h2 className="section-title">Статистика</h2>
      <Stats profile={profile} starting={starting} onStart={onStart} />

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
    </div>
  );
}

function TracksTab({ profile, starting, onStart }: TabProps) {
  return (
    <div className="screen" aria-busy={starting}>
      <h1 className="page-title">Темы</h1>
      <p className="hint section-hint">
        {profile.tracks.length} {plural(profile.tracks.length, 'тема', 'темы', 'тем')} · {questions.length} {questionsWord(questions.length)}
      </p>
      <div className="tracks">
        {profile.tracks.map((t) => {
          const track = trackById.get(t.id)!;
          const pct = Math.round((t.mastered / t.total) * 100);
          return (
            <button
              key={t.id}
              className="card track"
              disabled={starting}
              onClick={() => onStart({ mode: 'track', track: t.id })}
            >
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

const TAB_ICONS: Record<HomeTab, string> = {
  progress: 'M4 20V11M10 20V5M16 20v-6M22 20H2',
  tracks: 'M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5zM13 4h5.5c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5H13z',
};

const TAB_LABELS: Record<HomeTab, string> = { progress: 'Прогресс', tracks: 'Темы' };

function TabBar({ tab, onTab }: Pick<Props, 'tab' | 'onTab'>) {
  return (
    <nav className="tabbar" aria-label="Разделы">
      <div className="tabbar__row" role="tablist">
        {(Object.keys(TAB_LABELS) as HomeTab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`tabbar__item ${tab === t ? 'is-active' : ''}`}
            onClick={() => {
              if (t === tab) return;
              onTab(t);
              window.scrollTo({ top: 0 });
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d={TAB_ICONS[t]} />
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
    <div className="screen" aria-busy>
      <div className="card skeleton" style={{ height: 76 }} />
      <div className="card skeleton" style={{ height: 148 }} />
      <div className="skeleton skeleton--text" style={{ width: 100, marginTop: 24 }} />
      <div className="card skeleton" style={{ height: 260 }} />
    </div>
  );
}
