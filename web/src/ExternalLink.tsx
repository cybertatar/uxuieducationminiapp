import type { Link } from '../../content';
import { openLink } from './tg';

/** Ссылка на внешний материал. Последнее слово держится вместе со стрелкой, чтобы ↗ не уезжала на отдельную строку. */
export function ExternalLink({ link }: { link: Link }) {
  const cut = link.title.lastIndexOf(' ');
  const head = link.title.slice(0, cut + 1);
  const tail = link.title.slice(cut + 1);
  return (
    <button className="link" onClick={() => openLink(link.url)}>
      {head}
      <span className="nowrap">{tail}&nbsp;↗</span>
    </button>
  );
}
