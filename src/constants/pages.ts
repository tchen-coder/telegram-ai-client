/**
 * 所有页面的 page id，后续新增页面在此添加。
 *
 * 页面 ID 用于埋点 pre_page / next_page 字段，
 * 每次新增页面必须在此注册。
 */
export const PAGE_ID = {
  explore:        '探索页',
  messages:       '消息列表页',
  characterDetail: '角色详情页',
  chat:           '聊天页',
} as const;

export type PageId = keyof typeof PAGE_ID;
