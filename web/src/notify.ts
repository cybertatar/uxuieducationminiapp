import type { Profile, Settings, SettingsPatch } from '../../src/api-types';
import { api } from './api';
import { haptic, requestWriteAccess } from './tg';

/**
 * Сохраняет настройки уведомлений: сразу показывает новое состояние, затем сверяет с сервером.
 * Чтобы бот мог что-то присылать, пользователь должен разрешить ему писать — спрашиваем при включении.
 * false — разрешение не дали, ничего не сохранено.
 */
export async function saveSettings(profile: Profile, patch: SettingsPatch, optimistic: Partial<Settings>, onChange: (p: Profile) => void): Promise<boolean> {
  const s = profile.settings;
  const turningOn = patch.dailyEnabled === true || patch.reminderEnabled === true;
  if (turningOn && !s.canMessage) {
    if (!(await requestWriteAccess())) return false;
    patch = { ...patch, allowMessages: true };
    optimistic = { ...optimistic, canMessage: true };
  }
  haptic.tap();
  onChange({ ...profile, settings: { ...s, ...optimistic } });
  api
    .settings(patch)
    .then(() => api.me())
    .then(onChange)
    .catch(() => onChange(profile));
  return true;
}

/**
 * Включено ли на деле. Напоминание о стрике включено по умолчанию, но бот может писать,
 * только если человек нажал «Старт» в чате или дал разрешение. Иначе тумблер «вкл», а сообщения не приходят.
 */
export const dailyOn = (s: Settings) => s.canMessage && s.dailyEnabled;
export const reminderOn = (s: Settings) => s.canMessage && s.reminderEnabled;
export const notificationsOff = (s: Settings) => !dailyOn(s) && !reminderOn(s);

/** Что сейчас включено — одной строкой, для входа в настройки */
export function notificationsSummary(s: Settings): string {
  if (s.pausedUntil) return 'На паузе';
  if (dailyOn(s) && reminderOn(s)) return `Вопрос дня в ${s.dailyTime}, напоминание`;
  if (dailyOn(s)) return `Вопрос дня в ${s.dailyTime}`;
  if (reminderOn(s)) return `Напоминание в ${s.reminderTime}`;
  return 'Выключены';
}
