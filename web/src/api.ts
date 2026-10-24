import type {
  AnswerResponse,
  CompleteResponse,
  HistoryResponse,
  Profile,
  SessionRequest,
  SessionResponse,
  SettingsPatch,
} from '../../src/api-types';
import { tg } from './tg';

const initData = tg?.initData || (import.meta.env.DEV ? 'dev' : '');
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      Authorization: `tma ${initData}`,
      'X-Timezone': timeZone,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  me: () => request<Profile>('GET', '/me'),
  history: () => request<HistoryResponse>('GET', '/history'),
  session: (body: SessionRequest) => request<SessionResponse>('POST', '/session', body),
  answer: (questionId: string, option: number) => request<AnswerResponse>('POST', '/answer', { questionId, option }),
  lessonRead: (lessonId: string) => request<{ ok: true }>('POST', '/lessons/read', { lessonId }),
  complete: () => request<CompleteResponse>('POST', '/session/complete'),
  settings: (patch: SettingsPatch) => request<{ ok: true }>('PATCH', '/settings', patch),
};
