import { useState } from 'react';
import type { Profile, Settings as SettingsT, SettingsPatch } from '../../../src/api-types';
import { BackButton } from '../buttons';
import { shortDate, timeZoneLabel } from '../format';
import { dailyOn, reminderOn, saveSettings } from '../notify';

const DAILY_TIMES = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const REMINDER_TIMES = ['18:00', '19:00', '20:00', '21:00', '22:00'];

interface Props {
  profile: Profile;
  onBack: () => void;
  onChange: (p: Profile) => void;
}

export function Settings({ profile, onBack, onChange }: Props) {
  const s = profile.settings;
  // Тумблеры показывают, придут ли сообщения на деле: без разрешения писать они выключены, даже если в базе «вкл»
  const [denied, setDenied] = useState(false);

  const save = async (patch: SettingsPatch, optimistic: Partial<SettingsT>) => {
    setDenied(!(await saveSettings(profile, patch, optimistic, onChange)));
  };

  const pausedUntil = s.pausedUntil;

  return (
    <main className="screen settings">
      <BackButton onClick={onBack} />
      <h1 className="page-title">Уведомления</h1>

      <h2 className="section-title">Вопрос дня</h2>
      <div className="group">
        <label className="cell">
          <span>Присылать в чат с ботом</span>
          <Toggle
            checked={dailyOn(s)}
            onChange={(v) => save({ dailyEnabled: v }, { dailyEnabled: v })}
          />
        </label>
        {dailyOn(s) && (
          <label className="cell">
            <span>Время</span>
            <TimeSelect value={s.dailyTime} options={DAILY_TIMES} onChange={(t) => save({ dailyTime: t }, { dailyTime: t })} />
          </label>
        )}
      </div>
      <p className="hint section-hint">Один вопрос в день. Ответ на него тоже продлевает стрик.</p>

      <h2 className="section-title">Напоминание о стрике</h2>
      <div className="group">
        <label className="cell">
          <span>Напоминать</span>
          <Toggle
            checked={reminderOn(s)}
            onChange={(v) => save({ reminderEnabled: v }, { reminderEnabled: v })}
          />
        </label>
        {reminderOn(s) && (
          <label className="cell">
            <span>Время</span>
            <TimeSelect
              value={s.reminderTime}
              options={REMINDER_TIMES}
              onChange={(t) => save({ reminderTime: t }, { reminderTime: t })}
            />
          </label>
        )}
      </div>
      <p className="hint section-hint">Придёт, только если стрик под угрозой: вчера было занятие, а сегодня ещё нет.</p>

      <div className="group">
        <button
          className="cell cell--action"
          onClick={() =>
            save({ pause: !pausedUntil }, { pausedUntil: pausedUntil ? null : inDays(7) })
          }
        >
          {pausedUntil ? `▶️ Снять паузу (до ${shortDate(pausedUntil)})` : '⏸ Не беспокоить 7 дней'}
        </button>
      </div>

      {denied && (
        <p className="notice">
          Без разрешения бот не сможет присылать сообщения. Можно открыть бота и нажать «Старт» — тогда всё заработает.
        </p>
      )}

      <p className="hint section-hint">Часовой пояс: {timeZoneLabel(s.tz)}. Берём его из настроек телефона.</p>
    </main>
  );
}

function inDays(n: number) {
  const d = new Date(Date.now() + n * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <input
      type="checkbox"
      role="switch"
      className="toggle"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

function TimeSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
