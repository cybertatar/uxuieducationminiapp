import { trackById } from '../../../content';
import type { Profile } from '../../../src/api-types';
import type { SessionMode } from '../App';
import { Cat, CAT_NAME, type CatMood } from '../Cat';
import { accuracy, levelFor, trackHighlights } from '../../../src/stats';
import { days, plural, questionsWord, WEEKDAYS } from '../format';
import { AUTHOR_URL, openTelegramLink } from '../tg';
import { Wireframe } from '../Wireframe';

interface Props {
  profile: Profile | null;
  starting: boolean;
  onStart: (s: SessionMode) => void;
  onSettings: () => void;
}

export function Home({ profile, starting, onStart, onSettings }: Props) {
  if (!profile) return <HomeSkeleton />;
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

      <h2 className="section-title">Твой прогресс</h2>
      <Stats profile={profile} starting={starting} onStart={onStart} />

      <h2 className="section-title">Темы</h2>
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

const percent = (x: number) => `${Math.round(x * 100)}%`;

/** Уровень, цифры, которыми можно гордиться, и тема, которую стоит подтянуть */
function Stats({ profile, starting, onStart }: Pick<Props, 'starting' | 'onStart'> & { profile: Profile }) {
  const sum = (key: 'total' | 'mastered' | 'attempts' | 'correct') => profile.tracks.reduce((n, t) => n + t[key], 0);
  const total = sum('total');
  const mastered = sum('mastered');
  const attempts = sum('attempts');
  const acc = accuracy({ attempts, correct: sum('correct') });
  const { level, next, left, progress } = levelFor(mastered);
  const { strongest, weakest } = trackHighlights(profile.tracks);
  const best = profile.streak.best;

  const tiles: [string, string][] = [
    [`${mastered}`, `освоено из ${total}`],
    [acc === null ? '—' : percent(acc), 'верных ответов'],
    [`${attempts}`, plural(attempts, 'ответ', 'ответа', 'ответов')],
    [`${best}`, `${days(best)} — рекорд стрика`],
  ];

  return (
    <section className="card stats">
      <div className="stats__level">
        <span className="stats__badge" aria-hidden>
          {level.emoji}
        </span>
        <div className="stats__level-body">
          <div className="stats__title">{level.title}</div>
          <div className="hint">
            {next
              ? `Ещё ${left} ${plural(left, 'освоенный вопрос', 'освоенных вопроса', 'освоенных вопросов')} до уровня «${next.title}» ${next.emoji}`
              : 'Высший уровень. Кегль снимает шляпу!'}
          </div>
        </div>
      </div>
      <span className="progress" role="progressbar" aria-label="До следующего уровня" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <span className="progress__fill" style={{ width: percent(progress) }} />
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
            <span aria-hidden>💪</span>
            <span className="stats__row-body">
              <span className="hint">Сильная сторона</span>
              <span>
                {trackById.get(strongest.id)!.title} · {percent(strongest.accuracy)}
              </span>
            </span>
          </div>
          <button className="stats__row" disabled={starting} onClick={() => onStart({ mode: 'track', track: weakest.id })}>
            <span aria-hidden>🎯</span>
            <span className="stats__row-body">
              <span className="hint">Есть куда расти</span>
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
            ? 'Ответь на первые вопросы — здесь появится твоя статистика.'
            : 'Порешай пару тем — покажу твою сильную сторону и где есть куда расти.'}
        </p>
      )}
    </section>
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
      <div className="skeleton skeleton--text" style={{ width: 120, marginTop: 24 }} />
      <div className="card skeleton" style={{ height: 260 }} />
      <div className="skeleton skeleton--text" style={{ width: 80, marginTop: 24 }} />
      <div className="card skeleton" style={{ height: 132 }} />
      <div className="card skeleton" style={{ height: 132 }} />
    </div>
  );
}
