// Мокап iPhone для промо-картинок: статус-бар, плавающие кнопки Telegram и индикатор Home поверх скриншота.
import './phone.css';

/**
 * iPhone 390×844 pt в полноэкранном режиме Telegram. Скриншоты сняты с отступами
 * --tg-safe-area-inset-top: 54px, --tg-content-safe-area-inset-top: 46px, --tg-safe-area-inset-bottom: 34px,
 * поэтому интерфейс сам стоит ниже статус-бара и плавающих кнопок Telegram, которые рисуются поверх.
 * bare — без корпуса: экран телефона во весь кадр, как обычный скриншот (для превью в профиле бота).
 */
export const Phone = ({ src, className = '', back = false, bare = false }: { src: string; className?: string; back?: boolean; bare?: boolean }) => (
  <div className={`mock ${bare ? 'mock--bare' : ''} ${className}`}>
    <div className="mock__screen">
      <div className="mock__status">
        <span className="mock__time">9:41</span>
        <span className="mock__island" />
        <svg className="mock__icons" viewBox="0 0 68 12" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0.5" width="3" height="11.5" rx="1" />
          <path d="M31 3.2a9.6 9.6 0 0 1 12.6 0l-1.4 1.5a7.6 7.6 0 0 0-9.8 0zM33.4 5.8a6 6 0 0 1 7.8 0l-1.4 1.5a4 4 0 0 0-5 0zM35.8 8.4a2.4 2.4 0 0 1 3 0L37.3 10z" />
          <rect x="44.5" y="0.5" width="21" height="11" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.4" />
          <rect x="46.5" y="2.5" width="17" height="7" rx="1.6" />
          <path d="M66.6 4.2v3.6a1.9 1.9 0 0 0 0-3.6z" opacity="0.4" />
        </svg>
      </div>
      <div className="mock__tg">
        <span className="mock__pill">
          {back ? (
            <svg className="mock__back" viewBox="0 0 8 14" aria-hidden>
              <path d="M7 1 1 7l6 6" />
            </svg>
          ) : (
            <svg className="mock__close" viewBox="0 0 12 12" aria-hidden>
              <path d="m1 1 10 10M11 1 1 11" />
            </svg>
          )}
          {back ? 'Назад' : 'Закрыть'}
        </span>
        <span className="mock__pill mock__pill--icons">
          <svg className="mock__chevron" viewBox="0 0 14 8" aria-hidden>
            <path d="m1 1 6 6 6-6" />
          </svg>
          <svg className="mock__more" viewBox="0 0 18 4" aria-hidden>
            <circle cx="2" cy="2" r="2" />
            <circle cx="9" cy="2" r="2" />
            <circle cx="16" cy="2" r="2" />
          </svg>
        </span>
      </div>
      <img src={src} alt="" />
      <div className="mock__home" />
    </div>
  </div>
);
