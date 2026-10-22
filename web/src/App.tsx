import { useCallback, useEffect, useState } from 'react';
import { tracks, type TrackId } from '../../content';
import type { Profile } from '../../src/api-types';
import { api } from './api';
import { Cat } from './Cat';
import { ErrorBoundary } from './ErrorBoundary';
import { Home, type HomeTab, type SectionFilter } from './screens/Home';
import { Quiz, type QuizResult } from './screens/Quiz';
import { Result } from './screens/Result';
import { Calendar } from './screens/Calendar';
import { Settings } from './screens/Settings';

export type SessionMode = { mode: 'track'; track: TrackId } | { mode: 'review' } | { mode: 'warmup' };

/** Куда звать после разминки: тема, где больше всего ошибок (при равенстве — раньше в списке тем). Без ошибок — null. */
function warmupNext(result: QuizResult): TrackId | null {
  const mistakes = new Map<TrackId, number>();
  for (const q of result.mistakes) mistakes.set(q.track, (mistakes.get(q.track) ?? 0) + 1);
  let best: TrackId | null = null;
  for (const t of tracks) if ((mistakes.get(t.id) ?? 0) > (best ? mistakes.get(best)! : 0)) best = t.id;
  return best;
}

type Screen =
  | { name: 'home' }
  | { name: 'quiz'; session: SessionMode; questionIds: string[] }
  | { name: 'result'; session: SessionMode; result: QuizResult }
  | { name: 'settings' }
  | { name: 'calendar' };

/** Последний открытый раздел тем помним на устройстве: кто учит Figma, не переключается каждый раз */
const SECTION_KEY = 'tracks-section';

function loadSection(): SectionFilter {
  try {
    return (localStorage.getItem(SECTION_KEY) as SectionFilter | null) ?? 'all';
  } catch {
    return 'all';
  }
}

function saveSection(section: SectionFilter) {
  try {
    localStorage.setItem(SECTION_KEY, section);
  } catch {
    // Хранилище недоступно — просто не запоминаем
  }
}

export function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [starting, setStarting] = useState(false);
  const [tab, setTab] = useState<HomeTab>('progress');
  const [section, setSection] = useState<SectionFilter>(loadSection);

  const refresh = useCallback(() => {
    api
      .me()
      .then((p) => {
        setProfile(p);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(refresh, [refresh]);

  const start = async (session: SessionMode) => {
    if (starting) return;
    setStarting(true);
    try {
      const { questionIds } = await api.session(session);
      if (questionIds.length > 0) setScreen({ name: 'quiz', session, questionIds });
    } catch {
      setError(true);
    } finally {
      setStarting(false);
    }
  };

  const goHome = () => {
    setScreen({ name: 'home' });
    // Экран результатов длинный — без этого главная открылась бы с его прокруткой
    window.scrollTo({ top: 0 });
    refresh();
  };

  if (error && !profile) {
    return (
      <main className="screen screen--center">
        <div className="empty">
          <Cat mood="sleep" size={96} />
          <p>Не получилось загрузиться. Проверь интернет и попробуй ещё раз.</p>
          <button className="button button--secondary" onClick={refresh}>
            Повторить
          </button>
        </div>
      </main>
    );
  }

  return <ErrorBoundary onReset={goHome}>{renderScreen()}</ErrorBoundary>;

  function renderScreen() {
    switch (screen.name) {
      case 'quiz':
        return (
          <Quiz
            key={screen.questionIds.join()}
            questionIds={screen.questionIds}
            streakCounted={profile?.streak.todayDone ?? false}
            onExit={goHome}
            onFinish={(result) => setScreen({ name: 'result', session: screen.session, result })}
          />
        );
      case 'result': {
        const next = screen.session.mode === 'warmup' ? warmupNext(screen.result) : undefined;
        return (
          <Result
            result={screen.result}
            onHome={goHome}
            onAgain={() => start(screen.session)}
            canRepeat={screen.session.mode === 'track'}
            starting={starting}
            warmup={
              next === undefined
                ? undefined
                : {
                    track: next,
                    onTrack: (track) => start({ mode: 'track', track }),
                    onTracks: () => {
                      setTab('tracks');
                      goHome();
                    },
                  }
            }
          />
        );
      }
      case 'calendar':
        return profile && <Calendar profile={profile} onBack={goHome} />;
      case 'settings':
        return profile && <Settings profile={profile} onBack={goHome} onChange={setProfile} />;
      default:
        return (
          <Home
            profile={profile}
            starting={starting}
            tab={tab}
            onTab={setTab}
            section={section}
            onSection={(s) => {
              setSection(s);
              saveSection(s);
            }}
            onStart={start}
            onSettings={() => setScreen({ name: 'settings' })}
            onCalendar={() => {
              setScreen({ name: 'calendar' });
              window.scrollTo({ top: 0 });
            }}
          />
        );
    }
  }
}
