import { useEffect } from 'react';
import { lessons, readingMinutes, trackById, type TrackId } from '../../../content';
import type { Profile } from '../../../src/api-types';
import { BackButton } from '../buttons';
import { plural } from '../format';

interface Props {
  track: TrackId;
  profile: Profile;
  onBack: () => void;
  onLesson: (id: string) => void;
}

/** Тема учебника: «Продолжить» на первый непрочитанный урок и список уроков по порядку */
export function LearnTrack({ track, profile, onBack, onLesson }: Props) {
  const read = new Set(profile.lessonsRead);
  const list = lessons.filter((l) => l.track === track);
  const done = list.filter((l) => read.has(l.id)).length;
  const next = list.find((l) => !read.has(l.id));

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [track]);

  return (
    <main className="screen">
      <BackButton onClick={onBack} />
      <header className="lesson__head">
        <span className="chip">Учебник</span>
        <h1 className="page-title">{trackById.get(track)!.title}</h1>
        <p className="hint">
          {list.length} {plural(list.length, 'урок', 'урока', 'уроков')} · {done === list.length ? 'все прочитаны' : `прочитано ${done}`}
        </p>
      </header>

      {next && (
        <button className="card learn__next" onClick={() => onLesson(next.id)}>
          <span className="learn__next-icon" aria-hidden>
            ▶
          </span>
          <span className="learn__body">
            <span className="hint">{done === 0 ? 'Начни с первого урока' : 'Продолжить'}</span>
            <span className="learn__title">{next.title}</span>
          </span>
          <span className="chevron" aria-hidden>
            ›
          </span>
        </button>
      )}

      <ol className="group learn__list">
        {list.map((l, i) => {
          const isRead = read.has(l.id);
          return (
            <li key={l.id}>
              <button className="cell learn__item" onClick={() => onLesson(l.id)}>
                <span className={`learn__num ${isRead ? 'is-read' : ''}`} aria-hidden>
                  {isRead ? '✓' : i + 1}
                </span>
                <span className="learn__body">
                  <span className="learn__title">{l.title}</span>
                  <span className="hint">{l.description}</span>
                  <span className="learn__meta">
                    {readingMinutes(l)} мин{isRead && <span className="visually-hidden">, прочитано</span>}
                  </span>
                </span>
                <span className="chevron" aria-hidden>
                  ›
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
