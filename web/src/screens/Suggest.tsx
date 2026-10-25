import { useEffect, useState, type ReactNode } from 'react';
import { sections, trackById, type TrackId } from '../../../content';
import { SUGGEST_LIMITS, type SuggestRequest } from '../../../src/api-types';
import { api, ApiError } from '../api';
import { BackButton, MainButton } from '../buttons';
import { Cat } from '../Cat';
import { haptic, tg } from '../tg';

interface Props {
  /** Тема, из которой пришёл человек: подставляется в форму */
  track?: TrackId;
  onBack: () => void;
}

interface Draft {
  track: TrackId | '';
  text: string;
  correct: string;
  wrong: string[];
  explanation: string;
  source: string;
  screen: string;
}

/** Черновик живёт на устройстве: случайно закрыл экран — набранное не пропало */
const DRAFT_KEY = 'suggest-draft';

function loadDraft(track?: TrackId): Draft {
  const empty: Draft = { track: track ?? '', text: '', correct: '', wrong: ['', '', ''], explanation: '', source: '', screen: '' };
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') as Draft | null;
    if (!saved) return empty;
    return { ...empty, ...saved, track: track ?? (saved.track && trackById.has(saved.track) ? saved.track : '') };
  } catch {
    return empty;
  }
}

function saveDraft(d: Draft | null) {
  try {
    if (d) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Без хранилища черновик просто не сохранится
  }
}

/** Как подпишем автора: ник из Telegram, а без ника — имя */
const authorName = () => {
  const u = tg?.initDataUnsafe?.user;
  return u?.username ? `@${u.username}` : (u?.first_name ?? 'твой ник');
};

const len = (s: string) => s.trim().length;

/**
 * «Предложить вопрос»: тема, вопрос, верный и 1–3 неправильных варианта, разбор, источник.
 * Вопрос уходит автору в бота; если его опубликуют, под разбором будет подпись «Автор вопроса».
 */
export function Suggest({ track, onBack }: Props) {
  const [draft, setDraft] = useState<Draft>(() => loadDraft(track));
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sent) saveDraft(draft);
  }, [draft, sent]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [sent]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setWrong = (i: number, value: string) => setDraft((d) => ({ ...d, wrong: d.wrong.map((w, j) => (j === i ? value : w)) }));

  const wrong = draft.wrong.map((w) => w.trim()).filter(Boolean);
  const options = [draft.correct.trim(), ...wrong].map((o) => o.toLowerCase());
  const duplicate = new Set(options).size !== options.length;
  const badSource = draft.source.trim() !== '' && !/^https?:\/\/\S+$/.test(draft.source.trim());
  const valid =
    draft.track !== '' &&
    len(draft.text) >= SUGGEST_LIMITS.text[0] &&
    len(draft.correct) >= SUGGEST_LIMITS.option[0] &&
    wrong.length >= 1 &&
    !duplicate &&
    !badSource &&
    len(draft.explanation) >= SUGGEST_LIMITS.explanation[0];

  const send = async () => {
    if (!valid || draft.track === '') return;
    setSending(true);
    setError(null);
    const body: SuggestRequest = {
      track: draft.track,
      text: draft.text,
      correct: draft.correct,
      wrong,
      explanation: draft.explanation,
      source: draft.source.trim() || undefined,
      screen: draft.screen.trim() || undefined,
    };
    try {
      await api.suggest(body);
      haptic.success();
      saveDraft(null);
      setSent(true);
    } catch (err) {
      haptic.error();
      setError(
        err instanceof ApiError && err.status === 429
          ? 'Сегодня уже отправлено 5 вопросов. Следующий можно будет прислать завтра.'
          : err instanceof ApiError && err.status === 400
            ? 'Что-то не так с полями. Проверь их и попробуй ещё раз.'
            : 'Не получилось отправить. Проверь интернет и попробуй ещё раз.',
      );
    } finally {
      setSending(false);
    }
  };

  const again = () => {
    setDraft(loadDraft(draft.track || undefined));
    setSent(false);
  };

  if (sent) {
    return (
      <main className="screen screen--center suggest-done">
        <BackButton onClick={onBack} />
        <Cat mood="celebrate" size={96} />
        <h1 className="suggest-done__title">Вопрос отправлен!</h1>
        <p className="hint suggest-done__text">Автор прочитает его и напишет в чат с ботом, когда решит, войдёт ли вопрос в тренажёр.</p>
        <MainButton text="Готово" onClick={onBack} secondary={{ text: 'Ещё вопрос', onClick: again }} />
      </main>
    );
  }

  return (
    <main className="screen suggest">
      <BackButton onClick={onBack} />
      <h1 className="page-title">Предложить вопрос</h1>
      <p className="hint section-hint">Лучшие вопросы попадут в тренажёр с подписью «Автор вопроса: {authorName()}».</p>

      <h2 className="section-title">Тема</h2>
      <label className="cell suggest__track">
        <span className="visually-hidden">Тема</span>
        <select value={draft.track} onChange={(e) => set('track', e.target.value as TrackId)}>
          <option value="" disabled>
            Выбери тему
          </option>
          {sections.map((s) => (
            <optgroup key={s.id} label={s.title}>
              {s.tracks.map((t) => (
                <option key={t} value={t}>
                  {trackById.get(t)!.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="chevron" aria-hidden>
          ›
        </span>
      </label>

      <Field label="Вопрос" id="suggest-text">
        <textarea
          id="suggest-text"
          className="suggest__input"
          rows={3}
          maxLength={SUGGEST_LIMITS.text[1]}
          placeholder="Например: что поможет человеку понять, что файл ещё загружается?"
          value={draft.text}
          onChange={(e) => set('text', e.target.value)}
        />
      </Field>

      <Field label="Правильный ответ" id="suggest-correct">
        <input id="suggest-correct" className="suggest__input" maxLength={SUGGEST_LIMITS.option[1]} value={draft.correct} onChange={(e) => set('correct', e.target.value)} />
      </Field>

      <Field label="Неправильные ответы" hint={duplicate ? 'Варианты не должны повторяться.' : 'Хотя бы один, лучше три — правдоподобные, а не очевидно глупые.'} error={duplicate}>
        <div className="suggest__group">
          {draft.wrong.map((w, i) => (
            <input
              key={i}
              className="suggest__input"
              aria-label={`Неправильный ответ ${i + 1}`}
              placeholder={i === 0 ? 'Неправильный ответ' : 'Ещё один (необязательно)'}
              maxLength={SUGGEST_LIMITS.option[1]}
              value={w}
              onChange={(e) => setWrong(i, e.target.value)}
            />
          ))}
        </div>
      </Field>

      <Field label="Почему правильно так" id="suggest-explanation" hint="Это увидят после ответа: объясни своими словами, в чём суть.">
        <textarea
          id="suggest-explanation"
          className="suggest__input"
          rows={4}
          maxLength={SUGGEST_LIMITS.explanation[1]}
          value={draft.explanation}
          onChange={(e) => set('explanation', e.target.value)}
        />
      </Field>

      <Field
        label="Источник"
        id="suggest-source"
        hint={badSource ? 'Ссылка должна начинаться с https://' : 'Статья NN/g, гайдлайн, справка Figma — по ней автор проверит вопрос.'}
        error={badSource}
      >
        <input
          id="suggest-source"
          className="suggest__input"
          type="url"
          inputMode="url"
          placeholder="https://… (необязательно)"
          maxLength={SUGGEST_LIMITS.source}
          value={draft.source}
          onChange={(e) => set('source', e.target.value)}
        />
      </Field>

      <Field label="Если вопрос про макет" id="suggest-screen" hint="Опиши, что на экране — картинку нарисуем сами.">
        <textarea
          id="suggest-screen"
          className="suggest__input"
          rows={3}
          maxLength={SUGGEST_LIMITS.screen}
          placeholder="Необязательно"
          value={draft.screen}
          onChange={(e) => set('screen', e.target.value)}
        />
      </Field>

      {error && (
        <p className="suggest__error section-hint" role="alert">
          {error}
        </p>
      )}

      <MainButton text="Отправить" onClick={send} disabled={!valid} loading={sending} />
    </main>
  );
}

/** Поле формы: подпись в стиле заголовков разделов. id связывает подпись с полем; у группы полей подписи свои */
function Field({ label, id, hint, error = false, children }: { label: string; id?: string; hint?: string; error?: boolean; children: ReactNode }) {
  return (
    <div className="suggest__field">
      {id ? (
        <label className="section-title" htmlFor={id}>
          {label}
        </label>
      ) : (
        <h2 className="section-title">{label}</h2>
      )}
      {children}
      {hint && <p className={`section-hint ${error ? 'suggest__error' : 'hint'}`}>{hint}</p>}
    </div>
  );
}
