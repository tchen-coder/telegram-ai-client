/** API response wrapper */
export interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data: T;
}

/** Role image from role_images table */
export interface RoleImage {
  id: number;
  role_id: number;
  image_url: string;
  image_type: string;
  stage_key: string | null;
  trigger_type: string;
  sort_order: number;
  is_active: boolean;
  meta_json: Record<string, unknown>;
}

/** Role object returned by API */
export interface Role {
  id: number;
  role_id: number;
  name: string;
  description: string;
  age: number;
  relationship: number;
  relationship_label: string;
  rv: number;
  avatar_url: string;
  role_image_url: string;
  role_description_image_url: string;
  chat_background_image_url: string | null;
  tags?: string[];
  jobs?: string[];
  role_images?: RoleImage[];
  greeting_message?: string;
  is_active?: boolean;
  language?: string;
  typing_speed?: number;
  is_current?: boolean;
  latest_reply?: string;
  latest_reply_time?: number; // 秒级 unix 时间戳
  unread_count?: number;
}

/** Pagination info */
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

/** Structured content types for assistant messages */
export interface ContentPart {
  type: 'normal' | 'action';
  content: string;
}

export interface ContentSentence {
  seq: number;
  sentence_text: string;
  sentence_type: 'normal' | 'action' | 'mixed';
  parts: ContentPart[];
  delay: number; // ms to wait (show typing indicator) before streaming this sentence
}

export interface AssistantContent {
  full_text: string;
  sentences: ContentSentence[];
}

/** Chat message */
export interface ChatMessage {
  id: number;
  role_id: number;
  user_id: string;
  group_seq: number;
  timestamp: number;
  message_type: 'user' | 'assistant' | 'assistant_image';
  content: string | AssistantContent;
  image_url: string | null;
  created_at: string;
  cur_relationship?: number;
  cur_relationship_label?: string;
}

/** GET /api/roles response data */
export interface RolesData {
  roles: Role[];
  current_role_id: number | null;
  pagination: Pagination;
}

/** GET /api/myroles response data */
export interface MyRolesData {
  roles: Role[];
  current_role_id: number | null;
  pagination: Pagination;
}

/** POST /api/roles/select response data */
export interface SelectRoleData {
  role: Role;
  relationship: number;
  relationship_label: string;
  rv: number;
}

/** GET /api/conversations response data */
export interface ConversationsData {
  role: Role;
  messages: ChatMessage[];
  pagination: {
    limit: number;
    has_more: boolean;
    next_before_group_seq: number | null;
  };
}

/** POST /api/chat/messages response data */
export interface ChatMessageData {
  role: Role;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
  assistant_messages: ChatMessage[];
  response_text: string;
}

/** POST /api/myroles/delete response data */
export interface DeleteRoleData {
  role_id: number;
}

/** POST /api/users/telegram-miniapp/upsert response data */
export interface UpsertUserData {
  user_id: number;
  created: boolean;
  language_updated: boolean;
}
