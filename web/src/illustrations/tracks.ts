import { button, circle, cursor, field, icon, ill, lines, path, rect, screen, text, type Illustration } from './kit';

export const trackArt: Record<string, Illustration> = {
  'track-heuristics': ill(
    320,
    112,
    '',
    screen(18, 12, 150, 100, 12) +
      lines(32, 28, [80, 110]) +
      field(32, 52, 122, 20, {}) +
      button(32, 80, 122, 20, '') +
      circle(150, 52, 26, 'lens') +
      path('M168 70l18 18', 'stroke-bold') +
      [0, 1, 2, 3].map((i) => icon(i < 3 ? 'check' : 'close', 214, 22 + i * 21, 14, i < 3 ? 'stroke-success' : 'stroke-danger') + rect(236, 26 + i * 21, [62, 48, 70, 40][i], 6, 'block', 3)).join(''),
  ),
  'track-ux-laws': ill(
    320,
    112,
    '',
    cursor(28, 28, 1.3) +
      path('M52 50C90 30 120 34 150 56', 'dash-accent', 'fill="none"') +
      circle(176, 62, 24, 'accent') +
      circle(176, 62, 14, 'on-accent-soft') +
      circle(176, 62, 6, 'accent') +
      path('M228 62h20M248 62l18-26M248 62h18M248 62l18 26', 'stroke-bold', 'fill="none"') +
      [36, 62, 88].map((y) => circle(276, y, 6, 'ink-shape')).join('') +
      text(176, 104, 'Фиттс', { size: 9, anchor: 'middle' }) +
      text(258, 104, 'Хик', { size: 9, anchor: 'middle' }),
  ),
};
