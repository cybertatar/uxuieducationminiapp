import { lessonForTopic, type Link, type TrackId } from '../../content';
import { ExternalLink } from './ExternalLink';

interface Props {
  track: TrackId;
  topic: string;
  links: Link[];
  onLesson: (id: string) => void;
}

/** Куда идти разбираться с темой: урок учебника простым языком, если он есть, и статьи-первоисточники */
export function StudyLinks({ track, topic, links, onLesson }: Props) {
  const lesson = lessonForTopic(track, topic);
  return (
    <div className="study-links">
      {lesson && (
        <button className="study-links__lesson" onClick={() => onLesson(lesson.id)}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M3 6a2 2 0 0 1 2-2h4a2.75 2.75 0 0 1 2.25 1.17V20.5A2.75 2.75 0 0 0 9 19.25H5a2 2 0 0 1-2-2z" />
            <path d="M21 6a2 2 0 0 0-2-2h-4a2.75 2.75 0 0 0-2.25 1.17V20.5A2.75 2.75 0 0 1 15 19.25h4a2 2 0 0 0 2-2z" />
          </svg>
          <span>
            <span className="study-links__label">Урок в учебнике</span>
            <span className="study-links__title">{lesson.title}</span>
          </span>
          <span className="chevron" aria-hidden>
            ›
          </span>
        </button>
      )}
      {links.map((l) => (
        <ExternalLink key={l.url} link={l} />
      ))}
    </div>
  );
}
