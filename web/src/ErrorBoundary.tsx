import { Component, type ReactNode } from 'react';
import { Cat } from './Cat';
import { AUTHOR_URL, openTelegramLink } from './tg';

interface Props {
  children: ReactNode;
  onReset: () => void;
}

/**
 * Без этого любая ошибка рендера размонтирует всё приложение и оставит пустой экран.
 * Показываем кота, текст ошибки (чтобы по скриншоту было понятно, что сломалось) и выход на главную.
 */
export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <main className="screen screen--center">
        <div className="empty">
          <Cat mood="sad" size={96} />
          <p>Что-то сломалось. Пришли скриншот автору, а пока вернись на главную.</p>
          <pre className="error-details">{`${error.name}: ${error.message}\n${navigator.userAgent}`}</pre>
          <button
            className="button button--secondary"
            onClick={() => {
              this.setState({ error: null });
              this.props.onReset();
            }}
          >
            На главную
          </button>
          <footer className="author">
            Автор —{' '}
            <button className="link" onClick={() => openTelegramLink(AUTHOR_URL)}>
              Daniil Tyncherov
            </button>
          </footer>
        </div>
      </main>
    );
  }
}
