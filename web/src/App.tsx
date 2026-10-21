import { useCallback, useEffect, useState } from 'react';
import type { SectionId, TrackId } from '../../content';
import type { Profile } from '../../src/api-types';
import { api } from './api';
import { Cat } from './Cat';
import { ErrorBoundary } from './ErrorBoundary';
import { Home, type HomeTab } from './screens/Home';
import { Quiz, type QuizResult } from './screens/Quiz';
import { Result } from './screens/Result';
import { Settings } from './screens/Settings';

export type SessionMode = { mode: 'track'; track: TrackId } | { mode: 'review' };

type Screen =
  | { name: 'home' }
  | { name: 'quiz'; session: SessionMode; questionIds: string[] }
  | { name: 'result'; session: SessionMode; result: QuizResult }
  | { name: 'settings' };

export function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [starting, setStarting] = useState(false);
  const [tab, setTab] = useState<HomeTab>('progress');
  const [section, setSection] = useState<SectionId>('ux');

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
      case 'result':
        return (
          <Result
            result={screen.result}
            onHome={goHome}
            onAgain={() => start(screen.session)}
            canRepeat={screen.session.mode === 'track'}
            starting={starting}
          />
        );
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
            onSection={setSection}
            onStart={start}
            onSettings={() => setScreen({ name: 'settings' })}
          />
        );
    }
  }
}
