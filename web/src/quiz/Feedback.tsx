import type { Question } from '../../../content';
import { Cat } from '../Cat';
import { ExternalLink } from '../ExternalLink';
import { Wireframe } from '../Wireframe';
import { Confetti } from './Confetti';

/**
 * Разбор ответа: кот, суть, полное объяснение, картинка «как правильно» и ссылки.
 * Показывается раскрытым и при ошибке, и при верном ответе — даже угаданный ответ стоит закрепить.
 */
export function Feedback({ q, correct }: { q: Question; correct: boolean }) {
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

      <p className="feedback__explanation">{q.explanation}</p>

      {q.fix && (
        <figure className="feedback__fix">
          <figcaption>Как правильно</figcaption>
          <Wireframe name={q.fix} />
        </figure>
      )}

      <div className="feedback__links">
        {q.links.map((l) => (
          <ExternalLink key={l.url} link={l} />
        ))}
      </div>

      {q.author && <p className="feedback__author">Автор вопроса: {q.author}</p>}
    </section>
  );
}
