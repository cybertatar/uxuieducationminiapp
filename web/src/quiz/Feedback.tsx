import { useState } from 'react';
import type { Question } from '../../../content';
import { Cat } from '../Cat';
import { ExternalLink } from '../ExternalLink';
import { Wireframe } from '../Wireframe';
import { Confetti } from './Confetti';

/** Разбор ответа: кот, суть в одну строку, картинка «как правильно», подробности по тапу. */
export function Feedback({ q, correct }: { q: Question; correct: boolean }) {
  const [open, setOpen] = useState(false);
  // При ошибке главную ссылку показываем сразу, при верном ответе — прячем в подробности
  const [primary, ...rest] = q.links;
  const hiddenLinks = correct ? q.links : rest;

  return (
    <section className={`feedback ${correct ? 'is-correct' : 'is-wrong'}`} aria-live="polite">
      {correct && <Confetti />}
      <div className="feedback__head">
        <Cat mood={correct ? 'happy' : 'sad'} size={56} />
        <div>
          <h2 className="feedback__title">{correct ? 'Верно!' : 'Не совсем'}</h2>
          <p className="feedback__summary">{q.summary}</p>
        </div>
      </div>

      {q.fix && (
        <figure className="feedback__fix">
          <figcaption>Как правильно</figcaption>
          <Wireframe name={q.fix} />
        </figure>
      )}

      {!correct && (
        <div className="feedback__links">
          <ExternalLink link={primary} />
        </div>
      )}

      <button className="feedback__more" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Свернуть' : 'Подробнее'} <span className={`feedback__chevron ${open ? 'is-open' : ''}`}>›</span>
      </button>
      {open && (
        <div className="feedback__details">
          <p>{q.explanation}</p>
          {hiddenLinks.length > 0 && (
            <div className="feedback__links">
              {hiddenLinks.map((l) => (
                <ExternalLink key={l.url} link={l} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
