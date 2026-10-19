import { useMemo } from 'react';

const COLORS = ['var(--accent)', 'var(--flame)', 'var(--success)', '#f5c542', '#e85d9a'];

/** Короткий салют из конфетти. Позиционируется по центру родителя (нужен position: relative). */
export function Confetti({ count = 18 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const distance = 60 + Math.random() * 60;
        return {
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance - 40,
          rotate: Math.random() * 540 - 270,
          color: COLORS[i % COLORS.length],
          round: i % 3 === 0,
          delay: Math.random() * 80,
        };
      }),
    [count],
  );
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`confetti__piece ${p.round ? 'is-round' : ''}`}
          style={
            {
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--rot': `${p.rotate}deg`,
              background: p.color,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
