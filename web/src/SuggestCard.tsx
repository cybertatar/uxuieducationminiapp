/** Вход в «Предложить вопрос»: внизу списка тем и на экране итогов, где человек только что прошёл тему */
export function SuggestCard({ onClick }: { onClick: () => void }) {
  return (
    <button className="card review suggest-card" onClick={onClick}>
      <span className="review__icon suggest-card__icon" aria-hidden>
        +
      </span>
      <span className="review__body">
        <span className="review__title">Предложить вопрос</span>
        <span className="hint">Знаешь, о чём спросить? Лучшие вопросы попадут в тренажёр с подписью автора</span>
      </span>
      <span className="chevron" aria-hidden>
        ›
      </span>
    </button>
  );
}
