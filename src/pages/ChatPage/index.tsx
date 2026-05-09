import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useApp } from '../../store/appStore';
import { getConversations, sendChatMessage, selectRole, markMyRoleRead } from '../../api/client';
import { loadCache, saveCache } from '../../utils/roleCache';
import { loadChatCache, saveChatCache, appendChatCache } from '../../utils/chatCache';
import { trackEvent, getPrePageId } from '../../utils/track';
import type { ChatMessage, Role, ContentPart, AssistantContent } from '../../types/api';
import ChatBubble from '../../components/ChatBubble';
import ChatInput from '../../components/ChatInput';
import TypingIndicator from '../../components/TypingIndicator';
import styles from './ChatPage.module.css';

interface LocationState {
  role?: Role;
}

const PAGE_LIMIT = 10;
const TYPING_ID = -1;

/** Slice parts array so that combined text equals `partial` */
function buildPartialParts(parts: ContentPart[], partial: string): ContentPart[] {
  const result: ContentPart[] = [];
  let remaining = partial.length;
  for (const part of parts) {
    if (remaining <= 0) break;
    if (part.content.length <= remaining) {
      result.push(part);
      remaining -= part.content.length;
    } else {
      result.push({ ...part, content: part.content.slice(0, remaining) });
      break;
    }
  }
  return result;
}

export default function ChatPage() {
  const { user, currentRoleId, setCurrentRoleId, notifyRoleUpdated } = useApp();
  const navigate = useNavigate();
  const { roleId = '' } = useParams<{ roleId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const [role, setRole] = useState<Role | null>(state.role || null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Seed from cache immediately — avoids blank screen on re-entry
    if (user && roleId) {
      return loadChatCache(user.userId, roleId);
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    // If we already have cached messages, skip the loading spinner
    if (user && roleId) {
      return loadChatCache(user.userId, roleId).length === 0;
    }
    return true;
  });
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const unmountedRef = useRef(false);

  // Scroll to bottom when messages first load
  useEffect(() => {
    if (loading || messages.length === 0 || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [loading]);

  const loadHistory = useCallback(async () => {
    if (!user || !roleId) { setLoading(false); return; }
    try {
      const data = await getConversations({
        user_id: user.userId,
        role_id: roleId,
        limit: PAGE_LIMIT,
      });
      const msgs = data.messages ?? [];
      setRole(data.role);
      setMessages(msgs);
      setCurrentRoleId(data.role.id);
      setHasMore(data.pagination?.has_more ?? false);
      setNextCursor(data.pagination?.next_before_group_seq ?? null);
      saveChatCache(user.userId, roleId, msgs);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user, roleId, setCurrentRoleId]);

  const loadMore = useCallback(async () => {
    if (!user || !roleId || loadingMore || !hasMore || nextCursor === null) return;
    setLoadingMore(true);
    try {
      const data = await getConversations({
        user_id: user.userId,
        role_id: roleId,
        limit: PAGE_LIMIT,
        before_group_seq: nextCursor,
      });
      setMessages((prev) => [...(data.messages ?? []), ...prev]);
      setHasMore(data.pagination?.has_more ?? false);
      setNextCursor(data.pagination?.next_before_group_seq ?? null);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [user, roleId, loadingMore, hasMore, nextCursor]);

  useEffect(() => {
    unmountedRef.current = false;
    return () => { unmountedRef.current = true; };
  }, []);

  // 埋点：聊天页曝光（一次）
  const reportedShowRef = useRef(false);
  useEffect(() => {
    if (!roleId || reportedShowRef.current) return;
    trackEvent('showChat', {
      role_id: Number(roleId),
      pre_page: getPrePageId(),
    });
    reportedShowRef.current = true;
  }, [roleId]);

  useEffect(() => {
    if (user && roleId && String(currentRoleId) !== roleId) {
      selectRole({ user_id: user.userId, role_id: roleId, push_to_telegram: false })
        .then((data) => {
          setRole(data.role);
          setCurrentRoleId(data.role.id);
        })
        .catch(() => {});
    }
    loadHistory();
    // Mark messages as read when entering chat — clear unread badge immediately
    if (user && roleId) {
      markMyRoleRead({ user_id: user.userId, role_id: roleId }).catch(() => {});
      const cached = loadCache(user.userId);
      const updated = cached.map((r) =>
        String(r.role_id) === roleId ? { ...r, unread_count: 0 } : r
      );
      saveCache(user.userId, updated);
      notifyRoleUpdated();
    }
  }, [user?.userId, roleId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll-to-top: load older messages, keep current view position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop <= 50 && hasMore && !loadingMore) {
        const prevHeight = el.scrollHeight;
        loadMore().then(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const newHeight = el.scrollHeight;
              el.scrollTop = newHeight - prevHeight;
            });
          });
        });
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loadMore]);

  // Auto-fill: when initial load doesn't produce enough messages to overflow the
  // viewport, keep loading older messages until the user can scroll (or history ends).
  // Without this, scrollHeight <= clientHeight means no scroll events ever fire,
  // so the scroll-based trigger above can never run.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || loading || loadingMore || !hasMore) return;
    if (el.scrollHeight <= el.clientHeight) {
      const prevHeight = el.scrollHeight;
      loadMore().then(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const cur = scrollRef.current;
            if (!cur) return;
            cur.scrollTop = cur.scrollHeight - prevHeight;
          });
        });
      });
    }
  }, [messages, loading, loadingMore, hasMore, loadMore]);

  // PC: forward wheel events to .messages when cursor is outside the scroll container
  // (the 744px centered container leaves gray space on both sides on wide screens)
  useEffect(() => {
    const handleDocWheel = (e: WheelEvent) => {
      const el = scrollRef.current;
      if (!el) return;
      const target = e.target as Element;
      if (el.contains(target)) return;
      if ((target as HTMLElement).closest('textarea')) return;
      el.scrollTop += e.deltaY;
    };
    document.addEventListener('wheel', handleDocWheel, { passive: true });
    return () => document.removeEventListener('wheel', handleDocWheel);
  }, []);

  // Auto-scroll to bottom when sending/receiving messages
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  const handleSend = async (text: string) => {
    if (!user || sending) return;
    setSending(true);

    const nowSeconds = Math.floor(Date.now() / 1000);
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role_id: Number(roleId) || 0,
      user_id: user.userId,
      group_seq: 0,
      timestamp: nowSeconds,
      message_type: 'user',
      content: text,
      image_url: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    scrollToBottom();

    // Immediately write user message to chat cache + role list cache + notify MessagesPage
    // This ensures returning instantly still shows the sent message and latest preview
    setMessages((prev) => {
      const withTemp = prev.some((m) => m.id === tempUserMsg.id) ? prev : [...prev, tempUserMsg];
      appendChatCache(user.userId, roleId, withTemp.filter((m) => m.id > 0));
      return withTemp;
    });
    const roleCached = loadCache(user.userId);
    const roleUpdated = roleCached.map((r) =>
      String(r.role_id) === roleId
        ? { ...r, latest_reply: text, latest_reply_time: nowSeconds, unread_count: 0 }
        : r
    );
    saveCache(user.userId, roleUpdated);
    notifyRoleUpdated();

    // Show typing indicator
    const typingMsg: ChatMessage = {
      id: TYPING_ID,
      role_id: Number(roleId) || 0,
      user_id: '',
      group_seq: 0,
      timestamp: 0,
      message_type: 'assistant',
      content: '',
      image_url: null,
      created_at: '',
    };
    setMessages((prev) => [...prev, typingMsg]);

    try {
      const data = await sendChatMessage({
        user_id: user.userId,
        role_id: roleId,
        content: text,
        user_name: user.userName,
      });

      if (data.role) setRole(data.role);

      // Replace typing indicator + temp user msg with real user message
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id && m.id !== TYPING_ID);
        return [...filtered, data.user_message];
      });
      scrollToBottom();

      // Stream each assistant message one by one
      const assistantMessages = data.assistant_messages;
      for (let i = 0; i < assistantMessages.length; i++) {
        if (unmountedRef.current) return;
        const msg = assistantMessages[i];
        const ac = msg.content;

        // Show typing indicator before this message bubble appears
        setMessages((prev) => {
          const hasTyping = prev.some((m) => m.id === TYPING_ID);
          if (hasTyping) return prev;
          return [...prev, { id: TYPING_ID, role_id: Number(roleId) || 0, user_id: '', group_seq: 0, timestamp: 0, message_type: 'assistant' as const, content: '', image_url: null, created_at: '' }];
        });
        scrollToBottom();

        if (typeof ac === 'string' || !ac || !('sentences' in ac)) {
          // Fallback: plain string streaming
          const fullText = typeof ac === 'string' ? ac : '';
          setMessages((prev) => prev.filter((m) => m.id !== TYPING_ID));
          setMessages((prev) => [...prev, { ...msg, content: fullText }]);
          scrollToBottom();
        } else {
          // Structured: stream sentence by sentence
          const sentences = ac.sentences || [];
          // Bubble is seeded lazily — only after any leading delay, so no empty bubble
          // appears alongside the typing indicator.
          let bubbleAdded = false;

          for (let si = 0; si < sentences.length; si++) {
            if (unmountedRef.current) return;
            const sentence = sentences[si];

            // Delay before this sentence (show typing indicator)
            if (sentence.delay > 0) {
              // If bubble already exists re-insert typing indicator; otherwise it is
              // already present from the outer loop above.
              if (bubbleAdded) {
                setMessages((prev) => {
                  const hasTyping = prev.some((m) => m.id === TYPING_ID);
                  if (hasTyping) return prev;
                  return [...prev, { id: TYPING_ID, role_id: Number(roleId) || 0, user_id: '', group_seq: 0, timestamp: 0, message_type: 'assistant' as const, content: '', image_url: null, created_at: '' }];
                });
                scrollToBottom();
              }
              await new Promise<void>((resolve) => {
                const t = setTimeout(() => resolve(), sentence.delay);
                void t;
              });
              if (unmountedRef.current) return;
              setMessages((prev) => prev.filter((m) => m.id !== TYPING_ID));
              scrollToBottom();
            }

            // Seed the bubble right before streaming the first sentence
            if (!bubbleAdded) {
              const seedContent: AssistantContent = { full_text: '', sentences: [] };
              setMessages((prev) => prev.filter((m) => m.id !== TYPING_ID));
              setMessages((prev) => [...prev, { ...msg, content: seedContent }]);
              bubbleAdded = true;
              scrollToBottom();
            }

            // Stream sentence_text character by character, updating parts progressively
            const sentenceText = sentence.sentence_text;
            await new Promise<void>((resolve) => {
              let charIndex = 0;
              const interval = setInterval(() => {
                if (unmountedRef.current) {
                  clearInterval(interval);
                  resolve();
                  return;
                }
                charIndex++;
                const partial = sentenceText.slice(0, charIndex);
                // Build a partial sentence with parts sliced to charIndex
                const partialSentence = { ...sentence, sentence_text: partial, parts: buildPartialParts(sentence.parts, partial) };
                setMessages((prev) =>
                  prev.map((m) => {
                    if (m.id !== msg.id) return m;
                    const prevAc = m.content as AssistantContent;
                    const prevSentences = prevAc.sentences.filter((s) => s.seq !== sentence.seq);
                    const newSentences = [...prevSentences, partialSentence].sort((a, b) => a.seq - b.seq);
                    return { ...m, content: { full_text: prevAc.full_text, sentences: newSentences } };
                  })
                );
                scrollToBottom();
                if (charIndex >= sentenceText.length) {
                  clearInterval(interval);
                  resolve();
                }
              }, 30);
            });

            if (unmountedRef.current) return;
            // Commit the complete sentence
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== msg.id) return m;
                const prevAc = m.content as AssistantContent;
                const prevSentences = prevAc.sentences.filter((s) => s.seq !== sentence.seq);
                const newSentences = [...prevSentences, sentence].sort((a, b) => a.seq - b.seq);
                return { ...m, content: { full_text: prevAc.full_text, sentences: newSentences } };
              })
            );
          }

          // Finalize full_text on the bubble
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id ? { ...m, content: { ...ac } } : m
            )
          );
        }
      }

      // All messages received and streamed — update caches and notify MessagesPage
      if (user && assistantMessages.length > 0) {
        const lastMsg = assistantMessages[assistantMessages.length - 1];
        const lastText = typeof lastMsg.content === 'string'
          ? lastMsg.content
          : (lastMsg.content as AssistantContent).full_text;
        markMyRoleRead({ user_id: user.userId, role_id: roleId }).catch(() => {});
        const cached = loadCache(user.userId);
        const updated = cached.map((r) =>
          String(r.role_id) === roleId
            ? { ...r, latest_reply: lastText, latest_reply_time: lastMsg.timestamp, unread_count: 0 }
            : r
        );
        saveCache(user.userId, updated);
        setMessages((prev) => {
          saveChatCache(user.userId, roleId, prev.filter((m) => m.id > 0));
          return prev;
        });
        notifyRoleUpdated();
      } else if (user) {
        markMyRoleRead({ user_id: user.userId, role_id: roleId }).catch(() => {});
        const cached = loadCache(user.userId);
        const updated = cached.map((r) =>
          String(r.role_id) === roleId ? { ...r, unread_count: 0 } : r
        );
        saveCache(user.userId, updated);
        notifyRoleUpdated();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id && m.id !== TYPING_ID));
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    // 直接通过 push 链接进入时历史栈只有当前页，navigate(-1) 会退出小程序；
    // 这种情况下回退到首页。
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (idx === 0 || idx == null) {
      navigate('/', { replace: true });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={styles.container}>
      {/* Background image — Figma 303:58; fallback to role/avatar image when no chat bg */}
      {role && (role.chat_background_image_url || role.role_image_url || role.avatar_url) && (
        <div className={`${styles.bgImage}${!role.chat_background_image_url ? ` ${styles.bgImageFallback}` : ''}`}>
          <img src={role.chat_background_image_url ?? role.role_image_url ?? role.avatar_url} alt="" />
        </div>
      )}

      {/* Header — Figma 303:135 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825V9" fill="#C084FC"/>
          </svg>
        </button>
        <h1 className={styles.headerTitle}>{role?.name ? (Array.from(role.name).length > 16 ? Array.from(role.name).slice(0, 16).join('') + '...' : role.name) : ''}</h1>
      </header>

      {/* Messages — Figma 303:59 */}
      <div ref={scrollRef} className={styles.messages}>
        {loadingMore && (
          <div className={styles.loadMoreSpinner}>
            <div className={styles.spinner} />
          </div>
        )}
        {loading && messages.length === 0 ? (
          <div className={styles.initialSpinner}>
            <div className={styles.spinner} />
          </div>
        ) : (
          messages.map((msg, i) => (
            !msg ? null :
            msg.id === TYPING_ID ? (
              <TypingIndicator key={TYPING_ID} />
            ) : (
              <ChatBubble key={msg.id} message={msg} isFirst={i === 0} animate={msg.id > 0 && msg.timestamp > Date.now() / 1000 - 5} />
            )
          ))
        )}
      </div>

      {/* Immersive Input Area — Figma 303:91 */}
      <ChatInput onSend={handleSend} disabled={sending || loading} />
    </div>
  );
}
