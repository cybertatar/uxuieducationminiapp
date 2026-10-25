import { useCallback, useEffect, useState } from 'react';
import { lessonById, nextLesson, tracks, type SectionId, type TrackId } from '../../content';
import type { Profile } from '../../src/api-types';
import { api } from './api';
import { Cat } from './Cat';
import { ErrorBoundary } from './ErrorBoundary';
import { OverscrollCat } from './OverscrollCat';
import { Home, learnSections, type HomeTab, type SectionFilter } from './screens/Home';
import { LearnTrack } from './screens/LearnTrack';
import { Lesson } from './screens/Lesson';
import { Quiz, type QuizResult } from './screens/Quiz';
import { Result } from './screens/Result';
import { Calendar } from './screens/Calendar';
import { Settings } from './screens/Settings';
import { Suggest } from './screens/Suggest';
import { Support, SupportOffer } from './screens/Support';
import { tg } from './tg';

export type SessionMode = { mode: 'track'; track: TrackId } | { mode: 'review' } | { mode: 'warmup' } | { mode: 'lesson'; lesson: string };

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
  | { name: 'learn-track'; track: TrackId }
  | { name: 'lesson'; id: string }
  | { name: 'settings' }
  | { name: 'calendar' }
  | { name: 'support' }
  /** back — куда вернуться: на главную или к итогам сессии, не потеряв их */
  | { name: 'suggest'; track?: TrackId; back: Screen };

/**
 * Ссылка t.me/<бот>?startapp=<id урока> — из «Поделиться уроком»: сразу открываем этот урок.
 * Остальные метки (share_result, vc…) — только источник для статистики, их читает воркер.
 */
function initialScreen(): Screen {
  const param = tg?.initDataUnsafe?.start_param;
  return param && lessonById.has(param) ? { name: 'lesson', id: param } : { name: 'home' };
}

/** Последний открытый раздел тем и тему учебника помним на устройстве: кто учит Figma, не переключается каждый раз */
const SECTION_KEY = 'tracks-section';
const LEARN_KEY = 'learn-section';

function loadPref<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(key) as T | null) ?? fallback;
  } catch {
    return fallback;
  }
}

function savePref(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Хранилище недоступно — просто не запоминаем
  }
}

export function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [starting, setStarting] = useState(false);
  // Предложение поддержать ждёт возвращения на главную: экран итогов им не перебиваем
  const [offerSupport, setOfferSupport] = useState(false);
  const [tab, setTab] = useState<HomeTab>('progress');
  const [section, setSection] = useState<SectionFilter>(() => loadPref<SectionFilter>(SECTION_KEY, 'all'));
  // Неизвестный раздел пейджер сам заменит первым
  const [learnSection, setLearnSection] = useState<SectionId>(() => loadPref<SectionId>(LEARN_KEY, learnSections[0].id));

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

  const openSupport = () => {
    setScreen({ name: 'support' });
    window.scrollTo({ top: 0 });
  };

  const openLesson = (id: string) => setScreen({ name: 'lesson', id });
  const openSuggest = (back: Screen, track?: TrackId) => {
    setScreen({ name: 'suggest', track, back });
    window.scrollTo({ top: 0 });
  };
  // Тема учебника: сюда ведут «Назад» из урока и «Учебник» после закрепления
  const openLearnTrack = (track: TrackId) => {
    setTab('learn');
    setScreen({ name: 'learn-track', track });
  };

  // Отметку ставим сразу: сеть не должна задерживать галочку в списке уроков
  const markRead = (id: string) => {
    setProfile((p) => (p && !p.lessonsRead.includes(id) ? { ...p, lessonsRead: [...p.lessonsRead, id] } : p));
    api.lessonRead(id).catch(() => {
      // Не критично: урок отметится при следующем прочтении
    });
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

  return (
    <ErrorBoundary onReset={goHome}>
      {renderScreen()}
      {offerSupport && screen.name === 'home' && profile && (
        <SupportOffer
          onSupport={() => {
            setOfferSupport(false);
            openSupport();
          }}
          onClose={() => setOfferSupport(false)}
        />
      )}
      <OverscrollCat />
    </ErrorBoundary>
  );

  function renderScreen() {
    switch (screen.name) {
      case 'quiz':
        return (
          <Quiz
            key={screen.questionIds.join()}
            session={screen.session}
            questionIds={screen.questionIds}
            streakCounted={profile?.streak.todayDone ?? false}
            onExit={goHome}
            onFinish={(result) => setScreen({ name: 'result', session: screen.session, result })}
          />
        );
      case 'lesson': {
        const lesson = lessonById.get(screen.id)!;
        return (
          <Lesson
            key={lesson.id}
            lesson={lesson}
            read={profile?.lessonsRead.includes(lesson.id) ?? false}
            starting={starting}
            onBack={() => openLearnTrack(lesson.track)}
            onRead={() => markRead(lesson.id)}
            onPractice={() => start({ mode: 'lesson', lesson: lesson.id })}
          />
        );
      }
      case 'result': {
        const { session } = screen;
        const next = session.mode === 'warmup' ? warmupNext(screen.result) : undefined;
        return (
          <Result
            result={screen.result}
            session={session}
            profile={profile}
            onProfile={setProfile}
            onOfferSupport={() => setOfferSupport(true)}
            onSettings={() => setScreen({ name: 'settings' })}
            onHome={goHome}
            onAgain={() => start(screen.session)}
            onLesson={openLesson}
            onSuggest={
              session.mode === 'track'
                ? () => openSuggest(screen, session.track)
                : session.mode === 'lesson'
                  ? () => openSuggest(screen, lessonById.get(session.lesson)!.track)
                  : undefined
            }
            canRepeat={session.mode === 'track'}
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
            lesson={
              session.mode === 'lesson'
                ? {
                    next: nextLesson(session.lesson),
                    track: lessonById.get(session.lesson)!.track,
                    onNext: openLesson,
                    onTrack: (track) => start({ mode: 'track', track }),
                    onLessons: () => openLearnTrack(lessonById.get(session.lesson)!.track),
                  }
                : undefined
            }
          />
        );
      }
      case 'learn-track':
        return profile && <LearnTrack track={screen.track} profile={profile} onBack={goHome} onLesson={openLesson} />;
      case 'calendar':
        return profile && <Calendar profile={profile} onBack={goHome} onSettings={() => setScreen({ name: 'settings' })} />;
      case 'suggest':
        return <Suggest track={screen.track} onBack={() => setScreen(screen.back)} />;
      case 'support':
        return <Support profile={profile} onBack={goHome} onProfile={setProfile} />;
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
              savePref(SECTION_KEY, s);
            }}
            learnSection={learnSection}
            onLearnSection={(s) => {
              setLearnSection(s);
              savePref(LEARN_KEY, s);
            }}
            onLearnTrack={openLearnTrack}
            onStart={start}
            onLesson={openLesson}
            onSettings={() => setScreen({ name: 'settings' })}
            onSuggest={() => openSuggest({ name: 'home' })}
            onSupport={openSupport}
            onCalendar={() => {
              setScreen({ name: 'calendar' });
              window.scrollTo({ top: 0 });
            }}
          />
        );
    }
  }
}
