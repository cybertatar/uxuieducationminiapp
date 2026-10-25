/**
 * Кегль — кот-маскот в пиксель-арте. Спрайт задан строками: один символ — один пиксель.
 * Цвета берутся из темы, настроение меняет мордочку и анимацию.
 *
 *   K — контур   W — шерсть   O — акцент (уши, ошейник, нос)
 *   E — глаза    B — слеза    M — рот     S — усы    T — хвост
 */
export type CatMood = 'idle' | 'happy' | 'sad' | 'sleep' | 'celebrate';

export const CAT_NAME = 'Кегль';

const BASE = [
  '....K..............K........',
  '....KK............KK........',
  '....KOK..........KOK........',
  '....KOOK........KOOK........',
  '...KKOOOKKKKKKKKOOOKK.......',
  '..KWWWWWWWWWWWWWWWWWWK......',
  '..KWWWWWWWWWWWWWWWWWWK......',
  '..KWWWWWWWWWWWWWWWWWWK......',
  'SSKWWWWWWWWWWWWWWWWWWKSS....',
  'SSKWWWWWWWWWWWWWWWWWWKSS....',
  '..KWWWWWWWWWWWWWWWWWWK......',
  '...KWWWWWWWWWWWWWWWWK.......',
  '....KKWWWWWWWWWWWWKK........',
  '......KOOOOOOOOOOK..........',
  '.....KWWWWWOOWWWWWK.........',
  '....KWWWWWWWWWWWWWWK...TT...',
  '....KWWWWWWWWWWWWWWK....TT..',
  '....KWWWWWWWWWWWWWWK....TT..',
  '....KWWWWWWWWWWWWWWK...TT...',
  '....KWWWWWWWWWWWWWWKTTTT....',
  '....KWWKWWWWWWWWKWWK........',
  '.....KK.KKKKKKKK.KK.........',
];

type Patch = [row: number, col: number, pixels: string][];

const NOSE: Patch = [[8, 11, 'OO']];

/** Мордочки: что дорисовать поверх базового спрайта */
const FACES: Record<CatMood, Patch> = {
  idle: [[6, 7, 'EE'], [7, 7, 'EE'], [6, 15, 'EE'], [7, 15, 'EE'], ...NOSE, [9, 10, 'M..M'], [10, 11, 'MM']],
  happy: [[6, 8, 'E'], [7, 7, 'E.E'], [6, 15, 'E'], [7, 14, 'E.E'], ...NOSE, [9, 10, 'MOOM'], [10, 11, 'MM']],
  celebrate: [[6, 8, 'E'], [7, 7, 'E.E'], [6, 15, 'E'], [7, 14, 'E.E'], ...NOSE, [9, 9, 'MOOOOM'], [10, 10, 'MOOM'], [11, 11, 'MM']],
  sad: [[7, 7, 'EE'], [8, 7, 'EE'], [7, 15, 'EE'], [8, 15, 'EE'], [9, 7, 'B'], [10, 7, 'B'], ...NOSE, [9, 11, 'MM'], [10, 10, 'M..M']],
  sleep: [[7, 7, 'EEE'], [7, 14, 'EEE'], ...NOSE, [9, 11, 'MM']],
};

/** Спрайт с мордочкой настроения; его же рисует карточка «Поделиться» на canvas */
export function sprite(mood: CatMood): string[] {
  const rows = BASE.map((r) => r.split(''));
  for (const [row, col, pixels] of FACES[mood]) {
    [...pixels].forEach((p, i) => {
      if (p !== '.') rows[row][col + i] = p;
    });
  }
  return rows.map((r) => r.join(''));
}

const CLASS: Record<string, string> = {
  K: 'px-ink',
  W: 'px-fill',
  O: 'px-accent',
  E: 'px-ink px-eye',
  B: 'px-tear',
  M: 'px-ink',
  S: 'px-whisker',
  T: 'px-ink px-tail',
};

interface Run {
  x: number;
  y: number;
  w: number;
  cls: string;
}

/** Склеиваем соседние одинаковые пиксели в строке в один rect */
export function toRuns(rows: string[]): Run[] {
  const runs: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let w = 1;
      while (row[x + w] === ch) w++;
      if (CLASS[ch]) runs.push({ x, y, w, cls: CLASS[ch] });
      x += w;
    }
  });
  return runs;
}

const cache = new Map<CatMood, Run[]>();
const runsFor = (mood: CatMood) => {
  if (!cache.has(mood)) cache.set(mood, toRuns(sprite(mood)));
  return cache.get(mood)!;
};

export const Pixels = ({ runs }: { runs: Run[] }) => (
  <>
    {runs.map((r, i) => (
      <rect key={i} x={r.x} y={r.y} width={r.w} height={1} className={r.cls} />
    ))}
  </>
);

/** Пиксельные «zZ» над спящим котом */
const ZZZ = '..ZZZZ\n....Z.\n...Z..\n..ZZZZ\nZZZ...\n.Z....\nZZZ...';
const zzzRuns: Run[] = ZZZ.split('\n').flatMap((row, y) =>
  [...row].flatMap((ch, x) => (ch === 'Z' ? [{ x: x + 21, y: y - 3, w: 1, cls: 'px-hint' }] : [])),
);

/** Пиксельные искорки-плюсики вокруг празднующего кота */
export const SPARKS = [
  [-3, 2],
  [23, 6],
  [-2, 13],
  [22, -2],
] as const;

interface Props {
  mood?: CatMood;
  size?: number;
  className?: string;
}

export function Cat({ mood = 'idle', size = 64, className = '' }: Props) {
  const runs = runsFor(mood);
  return (
    <svg
      className={`cat cat--${mood} ${className}`}
      width={size}
      height={size}
      viewBox="-4 -4 32 28"
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${CAT_NAME}, кот-маскот`}
    >
      <g className="cat__body">
        <g className="cat__tail">
          <Pixels runs={runs.filter((r) => r.cls.includes('px-tail'))} />
        </g>
        <Pixels runs={runs.filter((r) => !r.cls.includes('px-eye') && !r.cls.includes('px-tail'))} />
        <g className="cat__eyes">
          <Pixels runs={runs.filter((r) => r.cls.includes('px-eye'))} />
        </g>
      </g>
      {mood === 'sleep' && (
        <g className="cat__zzz">
          <Pixels runs={zzzRuns} />
        </g>
      )}
      {mood === 'celebrate' && (
        <g className="cat__sparkles">
          {SPARKS.map(([x, y], i) => (
            <path key={i} d={`M${x + 1} ${y}h1v1h1v1h-1v1h-1v-1h-1v-1h1z`} className="px-accent" />
          ))}
        </g>
      )}
    </svg>
  );
}
