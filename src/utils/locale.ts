const zh: Locale = {
  // BottomNavBar
  navExplore: '探索',
  navChat: '聊天',

  // ExplorePage — hero
  exploreTitle: '探索',
  exploreSubtitle: '深夜不孤单，总有人陪你',

  // ExplorePage — empty (no content)
  exploreEmptyHeading: '还没人出现',
  exploreEmptySubtext: '还没有陪伴上线，请稍等片刻。',

  // ExplorePage — error
  exploreErrorHeading: '网络错误',
  exploreErrorSubtext: '加载失败，请检查网络后重试。',
  exploreErrorRetry: '重试',

  // MessagesPage — header
  messagesTitle: '秘语',

  // MessagesPage — empty
  messagesEmptyHeading: '静谧的午夜...',
  messagesEmptySubtext: '这里还没有灵魂的回响。去寻找属于你的伴侣，开启一段不为人知的对话。',

  // MessagesPage — chat item
  messagesPreviewFallback: '开始一段对话...',
  messagesYesterday: '昨天',

  // MessagesPage — delete
  messagesDeleteLabel: '删除',
  messagesDeleteMenuLabel: '删除对话',
  messagesDeleteConfirmTitle: '删除对话？',
  messagesDeleteConfirmText: (name: string) => `确定要删除与 ${name} 的对话吗？此操作无法撤销。`,
  messagesDeleteConfirm: '删除',
  messagesDeleteConfirming: '删除中...',
  messagesDeleteCancel: '取消',

  // MessagesPage — CTA
  messagesCtaExplore: '去探索角色',

  // CharacterDetailPage
  roleLoading: '角色信息加载中...',
  roleViewProfile: '更多档案',
  roleBio: '个人简介',
  roleJob: '职业',
  roleJobUnknown: '未知',
  roleIntimacy: '亲密度',
  roleStartChat: '开始聊天',
  roleStartChatWait: '稍等...',

  // ChatInput
  chatPlaceholder: '告诉我你的想法',

  // ConfirmDialog defaults
  confirmOk: '确认',
  confirmCancel: '取消',
};

const en: Locale = {
  navExplore: 'Explore',
  navChat: 'Chat',

  exploreTitle: 'Explore',
  exploreSubtitle: 'Find your midnight companion\nin the velvet shadows.',

  exploreEmptyHeading: 'The shadows are quiet…',
  exploreEmptySubtext: 'No companions have emerged yet.\nWait for the velvet curtain to rise.',

  exploreErrorHeading: 'Connection faded',
  exploreErrorSubtext: 'The signal is lost in the midnight haze.\nCheck your connection or try to reconnect.',
  exploreErrorRetry: 'Retry',

  messagesTitle: 'HushTalk',

  messagesEmptyHeading: 'Silent Midnight…',
  messagesEmptySubtext: "No echoes of a soul here. Go find your match—and start a private conversation no one else will see.",

  messagesPreviewFallback: 'Start a conversation…',
  messagesYesterday: 'Yesterday',

  messagesDeleteLabel: 'Delete',
  messagesDeleteMenuLabel: 'Delete chat',
  messagesDeleteConfirmTitle: 'Delete chat?',
  messagesDeleteConfirmText: (name: string) => `Delete your conversation with ${name}? This cannot be undone.`,
  messagesDeleteConfirm: 'Delete',
  messagesDeleteConfirming: 'Deleting…',
  messagesDeleteCancel: 'Cancel',

  messagesCtaExplore: 'Find a companion',

  // CharacterDetailPage
  roleLoading: 'Loading…',
  roleViewProfile: 'View profile',
  roleBio: 'About',
  roleJob: 'Occupation',
  roleJobUnknown: 'Unknown',
  roleIntimacy: 'Intimacy',
  roleStartChat: 'Start chat',
  roleStartChatWait: 'Please wait…',

  // ChatInput
  chatPlaceholder: "Tell me what's on your mind…",

  // ConfirmDialog defaults
  confirmOk: 'Confirm',
  confirmCancel: 'Cancel',
};

export type Locale = {
  navExplore: string;
  navChat: string;
  exploreTitle: string;
  exploreSubtitle: string;
  exploreEmptyHeading: string;
  exploreEmptySubtext: string;
  exploreErrorHeading: string;
  exploreErrorSubtext: string;
  exploreErrorRetry: string;
  messagesTitle: string;
  messagesEmptyHeading: string;
  messagesEmptySubtext: string;
  messagesPreviewFallback: string;
  messagesYesterday: string;
  messagesDeleteLabel: string;
  messagesDeleteMenuLabel: string;
  messagesDeleteConfirmTitle: string;
  messagesDeleteConfirmText: (name: string) => string;
  messagesDeleteConfirm: string;
  messagesDeleteConfirming: string;
  messagesDeleteCancel: string;
  messagesCtaExplore: string;
  roleLoading: string;
  roleViewProfile: string;
  roleBio: string;
  roleJob: string;
  roleJobUnknown: string;
  roleIntimacy: string;
  roleStartChat: string;
  roleStartChatWait: string;
  chatPlaceholder: string;
  confirmOk: string;
  confirmCancel: string;
};

function detectLang(): 'zh' | 'en' {
  const nav = navigator.language ?? '';
  return nav.startsWith('zh') ? 'zh' : 'en';
}

export function getLocale(): Locale {
  return detectLang() === 'zh' ? zh : en;
}
