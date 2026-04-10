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
  relationship: number;
  relationship_label: string;
  avatar_url: string;
  role_image_url: string;
  role_description_image_url: string;
  chat_background_image_url: string | null;
  tags: string[];
  role_images: RoleImage[];
  is_current?: boolean;
  latest_reply?: string;
}

/** Pagination info */
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

/** Chat message */
export interface ChatMessage {
  id: number;
  role_id: number;
  user_id: string;
  group_seq: number;
  timestamp: number;
  message_type: 'user' | 'assistant' | 'assistant_image';
  content: string;
  image_url: string | null;
  created_at: string;
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
  sent_greeting: boolean;
}

/** GET /api/conversations response data */
export interface ConversationsData {
  role: Role;
  messages: ChatMessage[];
  pagination: {
    limit: number;
    has_more: boolean;
    next_before_group_seq: number | null;
    next_before_message_id: number | null;
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
