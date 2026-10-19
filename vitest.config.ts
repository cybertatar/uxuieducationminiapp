import { defineConfig } from 'vitest/config';

// Отдельный конфиг, чтобы тесты не наследовали root: 'web' из vite.config.ts
export default defineConfig({
  test: { include: ['tests/**/*.test.ts'] },
});
