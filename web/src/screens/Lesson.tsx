import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { readingMinutes, trackById, type Lesson as LessonData, type LessonBlock } from '../../../content';
import { BackButton, MainButton } from '../buttons';
import { ExternalLink } from '../ExternalLink';
import { plural } from '../format';
import { ShareButton } from '../share';
import { Wireframe } from '../Wireframe';

interface Props {
  lesson: LessonData;
  read: boolean;
  starting: boolean;
  onBack: () => void;
  /** Человек долистал до «Запомни главное» — урок прочитан */
  onRead: () => void;
  onPractice: () => void;
}

/** Урок «Учебника»: текст простым языком, главное в тезисах, первоисточники и вопросы на закрепление */
export function Lesson({ lesson, read, starting, onBack, onRead, onPractice }: Props) {
  const takeaways = useRef<HTMLElement>(null);
  const track = trackById.get(lesson.track)!;
  const minutes = readingMinutes(lesson);
  // «NN/g: Visibility of System Status» → «NN/g»
  const origin = lesson.sources[0].title.split(':')[0];

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [lesson.id]);

  const onReadRef = useRef(onRead);
  onReadRef.current = onRead;
  useEffect(() => {
    const el = takeaways.current;
    if (read || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        onReadRef.current();
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lesson.id, read]);

  const count = lesson.practice.length;

  return (
    <main className="screen lesson">
      <BackButton onClick={onBack} />
      <ReadingProgress end={takeaways} />

      <header className="lesson__head">
        <div className="lesson__top">
          <span className="chip">{track.title}</span>
          <ShareButton
            request={{ kind: 'lesson', lessonId: lesson.id }}
            card={{ kind: 'lesson', tag: `Учебник · ${track.title}`, title: lesson.title, description: lesson.description, meta: `${minutes} мин · по материалам ${origin}` }}
          />
        </div>
        <h1 className="page-title">{lesson.title}</h1>
        <p className="hint">
          {minutes} мин · пересказ по материалам {origin}
          {read && ' · прочитано'}
        </p>
      </header>

      <article className="lesson__body">
        {sectionsOf(lesson.blocks).map((section, i) => (
          <section key={i} className="card lesson__section">
            {section.title && <h2 className="lesson__h">{section.title}</h2>}
            {section.blocks.map(renderBlock)}
          </section>
        ))}
      </article>

      <section className="card lesson__takeaways" ref={takeaways} aria-labelledby="takeaways-title">
        <h2 id="takeaways-title" className="lesson__takeaways-title">
          Запомни главное
        </h2>
        <ul>
          {lesson.takeaways.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <h2 className="section-title">Первоисточники</h2>
      <p className="hint section-hint">Если захочешь копнуть глубже. Статьи на английском.</p>
      <div className="card lesson__sources">
        {lesson.sources.map((l) => (
          <ExternalLink key={l.url} link={l} />
        ))}
      </div>

      <MainButton text={`Закрепить: ${count} ${plural(count, 'вопрос', 'вопроса', 'вопросов')}`} onClick={onPractice} loading={starting} />
    </main>
  );
}

/**
 * Полоса чтения у верхнего края: сразу видно, насколько урок длинный и сколько осталось.
 * 100% — когда «Запомни главное» целиком на экране; дальше идут только ссылки и кнопка.
 */
function ReadingProgress({ end }: { end: RefObject<HTMLElement | null> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = end.current;
      if (!el) return;
      const bottom = el.getBoundingClientRect().bottom + window.scrollY;
      const scrollable = bottom - window.innerHeight;
      setProgress(scrollable <= 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / scrollable)));
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Высота урока может поменяться и без прокрутки: шрифты, поворот экрана
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [end]);

  const pct = Math.round(progress * 100);
  return (
    <div className="reading-progress" role="progressbar" aria-label="Прочитано урока" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span className="reading-progress__fill" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

/** Каждый подзаголовок открывает новую карточку: так длинный урок не сливается в одну простыню */
function sectionsOf(blocks: LessonBlock[]) {
  const sections: { title?: string; blocks: LessonBlock[] }[] = [{ blocks: [] }];
  for (const b of blocks) {
    if (b.type === 'h') sections.push({ title: b.text, blocks: [] });
    else sections[sections.length - 1].blocks.push(b);
  }
  return sections.filter((s) => s.title || s.blocks.length > 0);
}

function renderBlock(b: LessonBlock, i: number): ReactNode {
  switch (b.type) {
    case 'list':
      return (
        <ul key={i} className="lesson__list">
          {b.items.map((item) => (
            <li key={item}>{rich(item)}</li>
          ))}
        </ul>
      );
    case 'life':
      return (
        <aside key={i} className="lesson__life">
          <span className="lesson__label">Из жизни</span>
          <p>{rich(b.text)}</p>
        </aside>
      );
    case 'term':
      return (
        <dl key={i} className="lesson__term">
          <dt>{b.term}</dt>
          <dd>{rich(b.text)}</dd>
        </dl>
      );
    case 'image':
      return (
        <figure key={i} className="lesson__figure">
          <Wireframe name={b.image} />
          <figcaption className="hint">{b.caption}</figcaption>
        </figure>
      );
    case 'compare':
      return (
        <figure key={i} className="lesson__compare">
          <div className="lesson__variant is-bad">
            <span className="lesson__label">Так себе</span>
            <Wireframe name={b.bad} />
          </div>
          <div className="lesson__variant is-good">
            <span className="lesson__label">Лучше</span>
            <Wireframe name={b.good} />
          </div>
          <figcaption className="hint">{b.caption}</figcaption>
        </figure>
      );
    default:
      return <p key={i}>{rich(b.text)}</p>;
  }
}

/** **жирный** внутри строки урока */
function rich(text: string): ReactNode {
  return text.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}
