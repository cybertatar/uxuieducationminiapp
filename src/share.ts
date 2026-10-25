/** Тексты сообщений «Поделиться»: результат сессии, стрик и урок. Чистая логика, покрыта тестами. */
import { lessonById, questions, readingMinutes, trackById } from '../content';
import type { ShareRequest } from './api-types';
import { plural } from './bot';

/** Картинка карточки: web/public/share/<image>.jpg, рисуется скриптом scripts/render-share.mjs */
export type ShareImage = 'result' | 'streak' | 'lesson';

export interface ShareContent {
  image: ShareImage;
  /** Строки сообщения; **жирный** превращается в <b> в подписи и убирается в обычном тексте */
  lines: string[];
  button: string;
  /** Параметр ссылки t.me/<бот>?startapp=…: метка источника, а для урока — ещё и какой урок открыть */
  startParam: string;
}

const days = (n: number) => `${n} ${plural(n, 'день', 'дня', 'дней')}`;

/** Сколько вопросов, с запасом вниз до сотни: «больше 1000» не устареет при каждом новом вопросе */
const questionsRounded = () => `${Math.floor(questions.length / 100) * 100}+`;

/**
 * Что отправить. streak — текущий стрик и рекорд из базы, а не с клиента.
 * Глаголы без рода («мой результат», а не «я прошёл»): пол человека мы не знаем.
 */
export function shareContent(req: ShareRequest, streak: { current: number; best: number }): ShareContent | null {
  if (req.kind === 'lesson') {
    const lesson = lessonById.get(req.lessonId);
    if (!lesson) return null;
    const origin = lesson.sources[0].title.split(':')[0];
    return {
      image: 'lesson',
      lines: [
        `📖 **«${lesson.title}»** — урок из UX-тренажёра`,
        '',
        lesson.description,
        '',
        `${readingMinutes(lesson)} мин простым языком по материалам ${origin}, а после — три вопроса на закрепление.`,
      ],
      button: 'Читать урок',
      startParam: lesson.id,
    };
  }

  if (req.kind === 'streak') {
    if (streak.current < 1) return null;
    const lines = [`🔥 **${days(streak.current)} подряд** в UX-тренажёре`, ''];
    if (streak.best > streak.current) lines.push(`Рекорд — ${days(streak.best)}. Иду на новый.`);
    else if (streak.current > 1) lines.push('Это мой рекорд!');
    lines.push(`Каждый день по несколько вопросов из UX, гайдлайнов и Figma. Присоединяйся — их тут ${questionsRounded()}.`);
    return { image: 'streak', lines, button: 'Открыть тренажёр', startParam: 'share_streak' };
  }

  const { correct, total, session } = req;
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total < 1 || total > 50 || correct < 0 || correct > total) return null;
  const score = `**${correct} из ${total}**`;
  let head: string;
  if (session.mode === 'track') {
    const track = trackById.get(session.track);
    if (!track) return null;
    head = `${track.emoji} Мой результат в UX-тренажёре: ${score} в теме «${track.title}»`;
  } else if (session.mode === 'lesson') {
    const lesson = lessonById.get(session.lesson);
    if (!lesson) return null;
    head = `📖 Урок «${lesson.title}» прочитан, на закреплении — ${score}`;
  } else if (session.mode === 'warmup') {
    head = `🎯 Разминка в UX-тренажёре: ${score}`;
  } else {
    head = `↻ Повторение в UX-тренажёре: ${score}`;
  }
  const lines = [head, ''];
  if (streak.current > 1) lines.push(`🔥 Стрик — ${days(streak.current)} подряд`);
  lines.push(correct === total ? 'Без единой ошибки. Повторишь?' : 'А сколько наберёшь ты?');
  return { image: 'result', lines, button: 'Проверить себя', startParam: 'share_result' };
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Подпись к картинке в HTML-разметке Telegram */
export const shareCaption = (c: ShareContent) => c.lines.map((l) => escapeHtml(l).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')).join('\n');

/** Тот же текст без разметки — для t.me/share и системного «Поделиться» */
export const sharePlainText = (c: ShareContent) => c.lines.map((l) => l.replace(/\*\*(.+?)\*\*/g, '$1')).join('\n');
