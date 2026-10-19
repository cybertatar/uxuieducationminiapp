import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : [],
  );

describe('эффекты React', () => {
  // Всё, что вернул эффект, React вызовет как функцию очистки. В новых Chromium scrollTo и
  // scrollIntoView возвращают Promise, поэтому `useEffect(() => window.scrollTo(...))` ронял приложение.
  it('тело эффекта в фигурных скобках, а не выражение', () => {
    const bad = files('web/src').flatMap((f) =>
      readFileSync(f, 'utf8')
        .split('\n')
        .map((line, i) => ({ line, at: `${f}:${i + 1}` }))
        .filter(({ line }) => /use(Layout)?Effect\(\s*\([^)]*\)\s*=>\s*[^{\s(]/.test(line))
        .map(({ at }) => at),
    );
    expect(bad).toEqual([]);
  });
});
