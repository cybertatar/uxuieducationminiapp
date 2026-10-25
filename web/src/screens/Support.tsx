import { useEffect, useRef, useState } from 'react';
import { DONATE_AMOUNTS, DONATE_LINKS, type CompleteResponse, type Profile } from '../../../src/api-types';
import { SUPPORT_OFFER_AFTER } from '../../../src/support';
import { typo } from '../../../src/typography';
import { api } from '../api';
import { BackButton, MainButton } from '../buttons';
import { Cat } from '../Cat';
import { Confetti } from '../quiz/Confetti';
import { haptic, inTelegram, openLink, tg } from '../tg';

type Amount = (typeof DONATE_AMOUNTS)[number];

/** Подписи к суммам: чтобы звёзды ощущались не абстрактной цифрой */
const CAPTIONS: Record<Amount, string> = {
  50: 'Миска корма для Кегля',
  100: 'Чашка кофе автору',
  250: 'Вклад в новый урок',
  500: 'Вклад в новую тему',
};

interface Props {
  profile: Profile | null;
  onBack: () => void;
  onProfile: (p: Profile) => void;
}

/**
 * «Поддержать проект»: разовый платёж звёздами Telegram. Вход — только ссылка в подписи автора на главной,
 * сам экран ничего не требует: тренажёр остаётся бесплатным целиком.
 */
export function Support({ profile, onBack, onProfile }: Props) {
  const [amount, setAmount] = useState<Amount>(100);
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState<'paid' | 'pending' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setPaying(true);
    setError(null);
    try {
      const { url } = await api.donate(amount);
      // Вне Telegram (разработка) счёт не открыть внутри приложения — показываем ссылку на него
      if (!inTelegram || !tg!.isVersionAtLeast('6.1')) {
        openLink(url);
        setPaying(false);
        return;
      }
      tg!.openInvoice(url, (result) => {
        setPaying(false);
        if (result === 'paid' || result === 'pending') {
          haptic.success();
          setStatus(result);
          if (profile) onProfile({ ...profile, supporter: true });
          window.scrollTo({ top: 0 });
        } else if (result === 'failed') {
          haptic.error();
          setError('Оплата не прошла. Звёзды не списаны — можно попробовать ещё раз.');
        }
      });
    } catch {
      haptic.error();
      setError('Не получилось открыть оплату. Проверь интернет и попробуй ещё раз.');
      setPaying(false);
    }
  };

  if (status) {
    return (
      <main className="screen screen--center support-done">
        <BackButton onClick={onBack} />
        <div className="support-done__cat">
          <Cat mood="celebrate" size={96} />
          <Confetti count={24} />
        </div>
        <h1 className="support-done__title">Спасибо!</h1>
        <p className="hint support-done__text">
          {typo(
            status === 'paid'
              ? 'Это правда помогает делать тренажёр дальше. Кегль мурлычет.'
              : 'Telegram ещё обрабатывает платёж. Как только он пройдёт, бот напишет в чат.',
          )}
        </p>
        <MainButton text="Готово" onClick={onBack} />
      </main>
    );
  }

  return (
    <main className="screen support">
      <BackButton onClick={onBack} />
      <section className="support__hero">
        <Cat mood="happy" size={72} />
        <h1 className="page-title">Поддержать проект</h1>
        {profile?.supporter && <p className="support__text">{typo('Спасибо, что уже поддерживаешь тренажёр!')}</p>}
        <p className="support__text">{typo('Тренажёр бесплатный и без рекламы — и таким останется.')}</p>
        <p className="support__text">{typo('Если он тебе помогает, можно отблагодарить автора звёздами Telegram или картой. Деньги идут на новые уроки, вопросы и темы.')}</p>
      </section>

      <div className="support__amounts" role="radiogroup" aria-label="Сколько звёзд">
        {DONATE_AMOUNTS.map((a) => (
          <button
            key={a}
            role="radio"
            aria-checked={amount === a}
            className={`card support__amount ${amount === a ? 'is-active' : ''}`}
            onClick={() => {
              haptic.tap();
              setAmount(a);
            }}
          >
            <span className="support__stars">{a} ⭐</span>
            <span className="hint">{typo(CAPTIONS[a])}</span>
          </button>
        ))}
      </div>

      {error ? (
        <p className="support__error section-hint" role="alert">
          {error}
        </p>
      ) : (
        <p className="hint section-hint">{typo('Разовый платёж внутри Telegram, без подписки. Звёзды можно купить прямо в окне оплаты.')}</p>
      )}

      {DONATE_LINKS.length > 0 && (
        <>
          <h2 className="section-title">Картой или переводом</h2>
          <div className="group">
            {DONATE_LINKS.map((link) => (
              <button key={link.url} className="cell support__link" onClick={() => openLink(link.url)}>
                <span className="support__link-body">
                  <span>{link.title}</span>
                  <span className="hint">{typo(link.hint)}</span>
                </span>
                <span className="chevron" aria-hidden>
                  ›
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <MainButton text={`Отправить ${amount} ⭐`} onClick={pay} loading={paying} />
    </main>
  );
}

/**
 * Предложение поддержать на главной: впервые после третьего пройденного теста, дальше не чаще раза в три недели
 * (правило — src/support.ts). Отметку «показано» ставим сразу при показе, что бы человек ни выбрал.
 */
export function SupportOffer({ kind, onSupport, onClose }: { kind: NonNullable<CompleteResponse['offerSupport']>; onSupport: () => void; onClose: () => void }) {
  const primary = useRef<HTMLButtonElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    api.supportOffered().catch(() => {
      // Не критично: в худшем случае предложим ещё раз после следующего теста
    });
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="support-offer-title" onClick={(e) => e.stopPropagation()}>
        <Cat mood="happy" size={56} />
        <h2 id="support-offer-title" className="sheet__title">
          {typo(kind === 'first' ? `Уже ${SUPPORT_OFFER_AFTER} теста позади!` : 'Спасибо, что учишься с Кеглем!')}
        </h2>
        <p className="sheet__text">{typo('Тренажёр бесплатный и без рекламы — и таким останется. Если он тебе помогает, можно поддержать автора.')}</p>
        <p className="hint sheet__note">{typo('Это необязательно. Напомню не раньше чем через три недели.')}</p>
        <div className="sheet__actions">
          <button ref={primary} className="button button--primary" onClick={onSupport}>
            Поддержать ⭐
          </button>
          <button className="button button--secondary" onClick={onClose}>
            Не сейчас
          </button>
        </div>
      </div>
    </div>
  );
}
