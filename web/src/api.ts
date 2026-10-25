import type {
  AnswerResponse,
  CompleteResponse,
  DonateResponse,
  HistoryResponse,
  Profile,
  ReportRequest,
  SessionRequest,
  SessionResponse,
  SettingsPatch,
  ShareRequest,
  ShareResponse,
  SuggestRequest,
} from '../../src/api-types';
import { tg } from './tg';

const initData = tg?.initData || (import.meta.env.DEV ? 'dev' : '');
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Ошибка API с HTTP-статусом: по нему экран решает, что сказать человеку */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

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
  if (!res.ok) throw new ApiError(`${method} ${path}: ${res.status}`, res.status);
  return res.json() as Promise<T>;
}

export const api = {
  me: () => request<Profile>('GET', '/me'),
  history: () => request<HistoryResponse>('GET', '/history'),
  session: (body: SessionRequest) => request<SessionResponse>('POST', '/session', body),
  answer: (questionId: string, option: number) => request<AnswerResponse>('POST', '/answer', { questionId, option }),
  lessonRead: (lessonId: string) => request<{ ok: true }>('POST', '/lessons/read', { lessonId }),
  complete: () => request<CompleteResponse>('POST', '/session/complete'),
  report: (body: ReportRequest) => request<{ ok: true }>('POST', '/report', body),
  suggest: (body: SuggestRequest) => request<{ ok: true }>('POST', '/suggest', body),
  share: (body: ShareRequest) => request<ShareResponse>('POST', '/share', body),
  supportOffered: () => request<{ ok: true }>('POST', '/support/offered'),
  donate: (amount: number) => request<DonateResponse>('POST', '/donate', { amount }),
  settings: (patch: SettingsPatch) => request<{ ok: true }>('PATCH', '/settings', patch),
};
