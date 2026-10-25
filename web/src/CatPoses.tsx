/**
 * Позы Кегля для пасхалки с «пружинкой» прокрутки: бег сбоку (два кадра) и висение, вытянувшись во весь рост.
 * Те же символы и цвета, что у основного спрайта в Cat.tsx: K — контур, W — шерсть, O — акцент, E — глаза, M — рот, S — усы, T — хвост.
 */
import { CAT_NAME, Pixels, toRuns } from './Cat';

const RUN_HEAD = ['.................K...K...', '................KOK.KOK..', '................KOOKKOOK.', '...............KWWWWWWWWK'];

/** Бег, голова справа. A — лапы вытянуты в прыжке, B — подобраны под себя */
const RUN_A = toRuns([
  ...RUN_HEAD,
  'T..............KWWWWWEWWK',
  'TT.............KWWWWWWWOK',
  '.TT...KKKKKKKKKKWWWWWWWK.',
  '..TTTKWWWWWWWWWKOOOOOOK..',
  '.....KWWWWWWWWWWWWWWWK...',
  '.....KWWWWWWWWWWWWWWWK...',
  '.....KWWWWWWWWWWWWWWWK...',
  '....KWWKKKKKKKKKKKWWWWK..',
  '...KWWK..........KKWWWK..',
  '..KWWK.............KWWWK.',
  '..KKK...............KKK..',
]);

const RUN_B = toRuns([
  ...RUN_HEAD,
  '...............KWWWWWEWWK',
  'TTT............KWWWWWWWOK',
  '...TTTKKKKKKKKKKWWWWWWWK.',
  '.....KWWWWWWWWWKOOOOOOK..',
  '.....KWWWWWWWWWWWWWWWK...',
  '.....KWWWWWWWWWWWWWWWK...',
  '.....KWWWWWWWWWWWWWWWK...',
  '.....KWWKKKKKKKKKWWKKK...',
  '......KWWK....KWWK.......',
  '.......KWWK..KWWK........',
  '.......KKKK..KKKK........',
]);

/** Висит: передние лапы вверх держатся за край, голова между лап, туловище вытянуто, задние лапы и хвост свисают */
const HANG = toRuns([
  'KKKK................KKKK',
  'KWWK................KWWK',
  'KWWK..K..........K..KWWK',
  'KWWK.KOK........KOK.KWWK',
  'KWWK.KOOK......KOOK.KWWK',
  'KWWKKOOOKKKKKKKKOOOKKWWK',
  '.KWWKWWWWWWWWWWWWWWKWWK.',
  '.KWWKWWEEWWWWWWEEWWKWWK.',
  'SSKWWWWEEWWWWWWEEWWWWKSS',
  'SSKWWWWWWWWOOWWWWWWWWKSS',
  '..KWWWWWWWWMMWWWWWWWWK..',
  '...KWWWWWWMWWMWWWWWWK...',
  '....KKWWWWWMMWWWWWKK....',
  '......KOOOOOOOOOOK......',
  ...Array.from({ length: 9 }, () => '.....KWWWWWWWWWWWWK.....'),
  '.....KWWWWKKKKWWWWK.....',
  '.....KWWWK....KWWWKT....',
  '.....KWWWK....KWWWK.T...',
  '.....KWWWK....KWWWK.T...',
  '.....KWWWK....KWWWK..T..',
  '.....KWWWK....KWWWK..T..',
  '.....KKKKK....KKKKK..T..',
  '.....................T..',
  '......................T.',
]);

/** Бегущий кот: кадры сменяет CSS (.run__frame) */
export function RunningCat({ size = 72 }: { size?: number }) {
  return (
    <svg className="cat run" width={size} height={(size * 15) / 25} viewBox="0 0 25 15" shapeRendering="crispEdges" role="img" aria-label={`${CAT_NAME} бежит`}>
      <g className="run__frame run__frame--a">
        <Pixels runs={RUN_A} />
      </g>
      <g className="run__frame run__frame--b">
        <Pixels runs={RUN_B} />
      </g>
    </svg>
  );
}

export function HangingCat({ size = 60 }: { size?: number }) {
  return (
    <svg className="cat" width={size} height={(size * 32) / 24} viewBox="0 0 24 32" shapeRendering="crispEdges" role="img" aria-label={`${CAT_NAME} висит`}>
      <Pixels runs={HANG} />
    </svg>
  );
}
