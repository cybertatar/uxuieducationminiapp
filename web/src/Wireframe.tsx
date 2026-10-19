import { useMemo } from 'react';
import { illustrations, toSvg } from './illustrations';

/** Вайрфрейм-иллюстрация по ключу. SVG вставляется inline, чтобы цвета брались из темы. */
export function Wireframe({ name, className = '' }: { name: string; className?: string }) {
  const html = useMemo(() => {
    const i = illustrations[name];
    return i ? toSvg(i) : '';
  }, [name]);
  return <div className={`wf ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
