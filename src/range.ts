/**
 * Заголовок Range для одного куска: «bytes=0-499», «bytes=500-», «bytes=-500».
 * null — заголовка нет или он нам не подходит (несколько кусков), тогда отдаём файл целиком;
 * 'invalid' — кусок за пределами файла (ответ 416). Иначе [начало, конец] включительно.
 */
export function byteRange(header: string | undefined, size: number): [number, number] | null | 'invalid' {
  const m = header?.trim().match(/^bytes=(\d*)-(\d*)$/);
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start: number;
  let end: number;
  if (m[1] === '') {
    // Последние N байт
    start = Math.max(0, size - Number(m[2]));
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  return start >= size || start > end ? 'invalid' : [start, end];
}
