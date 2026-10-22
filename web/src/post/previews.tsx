// Превью для профиля бота (Main Mini App → media previews). Dev-страница /previews.html, экраны 390×844.
// PNG 1170×2532 снимаются скриптом scripts/render-previews.mjs в brand/telegram/previews/.
// Скриншоты в ./previews сняты с отступами полноэкранного режима Telegram, как и для картинки анонса.
import { createRoot } from 'react-dom/client';
import '../styles.css';
import { Phone } from './Phone';
import home from './previews/1-home.png';
import hotspot from './previews/2-hotspot.png';
import result from './previews/3-result.png';
import themes from './previews/4-themes.png';

/** back — на экране показана кнопка «Назад» (сессия и результат), иначе «Закрыть» */
const SCREENS: [string, string, boolean][] = [
  ['home', home, false],
  ['hotspot', hotspot, true],
  ['result', result, true],
  ['themes', themes, false],
];

function Previews() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 24 }}>
      {SCREENS.map(([name, src, back]) => (
        <div key={name} className="preview" data-name={name}>
          <Phone src={src} back={back} bare />
        </div>
      ))}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Previews />);
