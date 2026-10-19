// Dev-страница /gallery.html: все вайрфреймы разом, чтобы проверять их в светлой и тёмной теме.
import { createRoot } from 'react-dom/client';
import { illustrations } from './illustrations';
import { Cat, type CatMood } from './Cat';
import { Wireframe } from './Wireframe';
import './styles.css';

function Gallery() {
  const moods: CatMood[] = ['idle', 'happy', 'sad', 'sleep', 'celebrate'];
  return (
    <>
    <div style={{ display: 'flex', gap: 24, padding: 16, flexWrap: 'wrap' }}>
      {moods.map((m) => (
        <figure key={m} style={{ margin: 0, background: 'var(--surface)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
          <Cat mood={m} size={120} />
          <figcaption className="hint">{m}</figcaption>
        </figure>
      ))}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, padding: 16 }}>
      {Object.keys(illustrations)
        .filter((name) => name.startsWith(new URLSearchParams(location.search).get('prefix') ?? ''))
        .map((name) => (
        <figure key={name} style={{ margin: 0, background: 'var(--surface)', borderRadius: 14, padding: 12 }}>
          <Wireframe name={name} />
          <figcaption className="hint" style={{ marginTop: 8 }}>{name}</figcaption>
        </figure>
      ))}
    </div>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<Gallery />);
