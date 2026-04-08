import type {
  ApiResponse,
  RolesData,
  MyRolesData,
  SelectRoleData,
  ConversationsData,
  ChatMessageData,
  DeleteRoleData,
} from '../types/api';

const BASE = '';

async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  const res = await fetch(url.toString());
  const json: ApiResponse<T> = await res.json();
  if (!json.ok) throw new Error(json.message || 'Request failed');
  return json.data;
}

async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.ok) throw new Error(json.message || 'Request failed');
  return json.data;
}

export function getRoles(params: {
  user_id?: string;
  page?: number;
  page_size?: number;
  tag?: string;
  sort?: string;
}) {
  return apiGet<RolesData>('/api/roles', params as Record<string, string | number | undefined>);
}

export function getMyRoles(params: {
  user_id: string;
  page?: number;
  page_size?: number;
}) {
  return apiGet<MyRolesData>('/api/myroles', params as Record<string, string | number | undefined>);
}

export function selectRole(params: {
  user_id: string;
  role_id: number;
  push_to_telegram?: boolean;
}) {
  return apiPost<SelectRoleData>('/api/roles/select', params as Record<string, unknown>);
}

export function getConversations(params: {
  user_id: string;
  role_id: number;
  limit?: number;
  before_group_seq?: number;
  before_message_id?: number;
}) {
  return apiGet<ConversationsData>('/api/conversations', params as Record<string, string | number | undefined>);
}

export function sendChatMessage(params: {
  user_id: string;
  role_id: number;
  content: string;
  user_name?: string;
}) {
  return apiPost<ChatMessageData>('/api/chat/messages', params as Record<string, unknown>);
}

export function deleteMyRole(params: { user_id: string; role_id: number }) {
  return apiPost<DeleteRoleData>('/api/myroles/delete', params as Record<string, unknown>);
}
