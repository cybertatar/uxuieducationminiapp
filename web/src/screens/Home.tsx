import type { ReactNode } from 'react';
import { lessons, questionsByTrack, sections, trackById, type SectionId, type TrackId } from '../../../content';
import type { Profile } from '../../../src/api-types';
import { accuracy, trackHighlights } from '../../../src/stats';
import type { SessionMode } from '../App';
import { Cat, CAT_NAME, type CatMood } from '../Cat';
import { days, plural, questionsWord, shortDate, WEEKDAYS } from '../format';
import { notificationsOff, notificationsSummary } from '../notify';
import { AUTHOR_URL, openTelegramLink } from '../tg';
import { SectionPager } from '../SectionPager';
import { StudyLinks } from '../StudyLinks';
import { SuggestCard } from '../SuggestCard';
import { APP_VERSION } from '../version';
import { Wireframe } from '../Wireframe';

export type HomeTab = 'progress' | 'tracks' | 'learn';

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
  /** Открытый раздел учебника: хранится в App, как и раздел тем */
  learnSection: SectionId;
  onLearnSection: (section: SectionId) => void;
  /** Открыть тему учебника со списком уроков */
  onLearnTrack: (track: TrackId) => void;
  onLesson: (id: string) => void;
  onSettings: () => void;
  onCalendar: () => void;
  onSuggest: () => void;
}

/** Главная из трёх вкладок: прогресс с трекером занятий, список тем и учебник. */
export function Home({ profile, starting, tab, onTab, section, onSection, onStart, learnSection, onLearnSection, onLearnTrack, onLesson, onSettings, onCalendar, onSuggest }: Props) {
  return (
    <>
      {!profile ? (
        <HomeSkeleton />
      ) : tab === 'progress' ? (
        <ProgressTab profile={profile} starting={starting} onStart={onStart} onSettings={onSettings} onCalendar={onCalendar} onTab={onTab} onLesson={onLesson} />
      ) : tab === 'tracks' ? (
        <TracksTab profile={profile} starting={starting} onStart={onStart} section={section} onSection={onSection} onSuggest={onSuggest} />
      ) : (
        <LearnTab profile={profile} learnSection={learnSection} onLearnSection={onLearnSection} onLearnTrack={onLearnTrack} />
      )}
      <TabBar tab={tab} onTab={onTab} />
    </>
  );
}

type TabProps = Pick<Props, 'starting' | 'onStart'> & { profile: Profile };

function ProgressTab({ profile, starting, onStart, onSettings, onCalendar, onTab, onLesson }: TabProps & Pick<Props, 'onSettings' | 'onCalendar' | 'onTab' | 'onLesson'>) {
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

      {/* Вся карточка стрика ведёт в календарь занятий: поверх неё растянута прозрачная кнопка */}
      <section className="streak card">
        <button className="streak__open" onClick={onCalendar} aria-label="Открыть календарь занятий" />
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
          <span className="streak__more" aria-hidden>
            Календарь ›
          </span>
        </div>
        <ol className="week" aria-label="Активность на этой неделе">
          {streak.week.map((d, i) => (
            <li key={d.date} className={`week__day ${d.active ? 'is-active' : ''} ${d.isToday ? 'is-today' : ''}`}>
              <span className="week__dot">{d.active ? '✓' : ''}</span>
              <span className="week__label">{WEEKDAYS[i]}</span>
            </li>
          ))}
        </ol>
        <NotifyRow settings={profile.settings} onClick={onSettings} />
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

      {profile.weakTopics.length > 0 && <Reading topics={profile.weakTopics} onLesson={onLesson} />}

      <footer className="author">
        Автор —{' '}
        <button className="link" onClick={() => openTelegramLink(AUTHOR_URL)}>
          Daniil Tyncherov
        </button>
        <div className="author__version">
          Версия {APP_VERSION}
        </div>
      </footer>
    </main>
  );
}

/**
 * Уведомления — строкой внизу карточки стрика: напоминания нужны ради него, а карточку видят все.
 * Иконка без подписи в шапке терялась рядом с облачком кота. Пока ничего не приходит, строка выделена и зовёт включить.
 */
function NotifyRow({ settings, onClick }: { settings: Profile['settings']; onClick: () => void }) {
  const off = notificationsOff(settings) || !!settings.pausedUntil;
  const text = settings.pausedUntil ? `Уведомления на паузе до ${shortDate(settings.pausedUntil)}` : off ? 'Напоминания выключены' : notificationsSummary(settings);
  return (
    <button className={`streak__notify ${off ? 'is-off' : ''}`} onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
        <path d="M10 21h4" />
      </svg>
      <span className="streak__notify-text">{text}</span>
      <span className="streak__notify-action">{off ? 'Включить' : 'Изменить'} ›</span>
    </button>
  );
}

/** С чего начать: разминка по всем разделам и короткий путь к выбору темы */
const WARMUP_ART = ['track-heuristics', 'track-hig', 'track-figma-components'];

function FirstRun({ starting, onStart, onTab }: Pick<Props, 'starting' | 'onStart' | 'onTab'>) {
  return (
    <section className="card first-run">
      <span className="first-run__art" aria-hidden>
        {WARMUP_ART.map((name) => (
          <span key={name} className="track__art">
            <Wireframe name={name} />
          </span>
        ))}
      </span>
      <h2 className="first-run__title">Начни с разминки</h2>
      <p className="hint">10 вопросов из UX, гайдлайнов и Figma. По ответам покажу, какие темы стоит подтянуть. Это займёт около 5 минут.</p>
      <button className="button button--primary" disabled={starting} onClick={() => onStart({ mode: 'warmup' })}>
        Начать
      </button>
      <button
        className="link first-run__other"
        onClick={() => {
          onTab('tracks');
          window.scrollTo({ top: 0 });
        }}
      >
        Выбрать тему самому
      </button>
    </section>
  );
}

const FILTERS: { id: SectionFilter; title: string }[] = [{ id: 'all', title: 'Все' }, ...sections.map((s) => ({ id: s.id, title: s.title }))];

/** Темы по разделам: пилюли сверху, разделы листаются свайпом */
function TracksTab({ profile, starting, onStart, section, onSection, onSuggest }: TabProps & Pick<Props, 'section' | 'onSection' | 'onSuggest'>) {
  const progress = new Map(profile.tracks.map((t) => [t.id, t]));
  return (
    <main className="screen screen--tracks" aria-busy={starting}>
      <h1 className="visually-hidden">Темы</h1>
      <SectionPager
        label="Разделы тем"
        idPrefix="section"
        items={FILTERS}
        active={section}
        onChange={onSection}
        renderPage={(id) => {
          const shown = id === 'all' ? sections : sections.filter((s) => s.id === id);
          const trackCount = shown.reduce((n, s) => n + s.tracks.length, 0);
          const count = shown.reduce((n, s) => n + s.tracks.reduce((m, t) => m + questionsByTrack(t).length, 0), 0);
          return (
            <>
              <p className="hint section-hint">
                {trackCount} {plural(trackCount, 'тема', 'темы', 'тем')} · {count} {questionsWord(count)}
              </p>
              {shown.map((s) =>
                id === 'all' ? (
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
              <SuggestCard onClick={onSuggest} />
            </>
          );
        }}
      />
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

/** Разделы учебника — те, где у тем есть уроки; темы внутри раздела — в порядке списка тем */
export const learnSections = sections
  .map((s) => ({ id: s.id, title: s.title, tracks: s.tracks.filter((t) => lessons.some((l) => l.track === t)) }))
  .filter((s) => s.tracks.length > 0);

/** Учебник: пилюли разделов, в разделе — темы с прогрессом; тап открывает тему с уроками */
function LearnTab({ profile, learnSection, onLearnSection, onLearnTrack }: { profile: Profile } & Pick<Props, 'learnSection' | 'onLearnSection' | 'onLearnTrack'>) {
  const read = new Set(profile.lessonsRead);
  return (
    <main className="screen screen--tracks">
      <h1 className="visually-hidden">Учебник</h1>
      <SectionPager
        label="Разделы учебника"
        idPrefix="learn"
        items={learnSections}
        active={learnSection}
        onChange={onLearnSection}
        renderPage={(id) => {
          const section = learnSections.find((s) => s.id === id)!;
          const total = lessons.filter((l) => section.tracks.includes(l.track)).length;
          return (
            <>
              <p className="hint section-hint">
                {section.tracks.length} {plural(section.tracks.length, 'тема', 'темы', 'тем')} · {total} {plural(total, 'урок', 'урока', 'уроков')}
              </p>
              <div className="learn__topics">
                {section.tracks.map((t) => {
                  const track = trackById.get(t)!;
                  const list = lessons.filter((l) => l.track === t);
                  const done = list.filter((l) => read.has(l.id)).length;
                  const pct = Math.round((done / list.length) * 100);
                  return (
                    <button key={t} className="card learn__topic" onClick={() => onLearnTrack(t)}>
                      <span className="learn__emoji" aria-hidden>
                        {track.emoji}
                      </span>
                      <span className="learn__body">
                        <span className="learn__title">{track.title}</span>
                        <span className="hint">
                          {list.length} {plural(list.length, 'урок', 'урока', 'уроков')} · {done === list.length ? 'все прочитаны' : `прочитано ${done}`}
                        </span>
                        <span className="progress learn__progress" role="progressbar" aria-label="Прочитано уроков" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                          <span className="progress__fill" style={{ width: `${pct}%` }} />
                        </span>
                      </span>
                      <span className="chevron" aria-hidden>
                        ›
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="hint learn__note">
                Уроки — пересказ статей NN/g, Laws of UX, Apple, Google, W3C и справки Figma простыми словами. После каждого — три вопроса, чтобы закрепить.
              </p>
            </>
          );
        }}
      />
    </main>
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

/** Темы, где больше всего ошибок: урок учебника простым языком и статья-первоисточник */
function Reading({ topics, onLesson }: { topics: Profile['weakTopics'] } & Pick<Props, 'onLesson'>) {
  return (
    <>
      <h2 className="section-title">Что почитать</h2>
      <p className="hint section-hint">Уроки и статьи по темам, в которых у тебя больше всего ошибок.</p>
      <div className="mistakes">
        {topics.map((t) => (
          <div key={`${t.track}|${t.topic}`} className="card mistake">
            <span className="reading__head">
              <span className="chip">{t.topic}</span>
              <span className="hint nowrap">
                {t.mistakes} {plural(t.mistakes, 'ошибка', 'ошибки', 'ошибок')}
              </span>
            </span>
            <StudyLinks track={t.track} topic={t.topic} links={[t.link]} onLesson={onLesson} />
          </div>
        ))}
      </div>
    </>
  );
}

/** Иконки вкладок 24×24: столбики прогресса, стопка карточек тем и раскрытая книга */
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
  learn: (
    <>
      <path d="M3 6a2 2 0 0 1 2-2h4a2.75 2.75 0 0 1 2.25 1.17V20.5A2.75 2.75 0 0 0 9 19.25H5a2 2 0 0 1-2-2z" />
      <path d="M21 6a2 2 0 0 0-2-2h-4a2.75 2.75 0 0 0-2.25 1.17V20.5A2.75 2.75 0 0 1 15 19.25h4a2 2 0 0 0 2-2z" />
    </>
  ),
};

const TAB_LABELS: Record<HomeTab, string> = { progress: 'Прогресс', tracks: 'Темы', learn: 'Учебник' };

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
