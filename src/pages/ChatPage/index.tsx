import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useApp } from '../../store/appStore';
import { getConversations, sendChatMessage, selectRole } from '../../api/client';
import type { ChatMessage, Role } from '../../types/api';
import ChatBubble from '../../components/ChatBubble';
import ChatInput from '../../components/ChatInput';
import TypingIndicator from '../../components/TypingIndicator';
import styles from './ChatPage.module.css';

interface LocationState {
  role?: Role;
}

export default function ChatPage() {
  const { user, currentRoleId, setCurrentRoleId } = useApp();
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const [role, setRole] = useState<Role | null>(state.role || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const roleIdNum = Number(roleId);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  const loadHistory = useCallback(async () => {
    if (!user || isNaN(roleIdNum)) return;
    setLoading(true);
    try {
      const data = await getConversations({
        user_id: user.userId,
        role_id: roleIdNum,
        limit: 50,
      });
      setRole(data.role);
      setMessages(data.messages);
      setCurrentRoleId(data.role.id);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [user, roleIdNum, setCurrentRoleId, scrollToBottom]);

  useEffect(() => {
    if (user && roleIdNum && !isNaN(roleIdNum) && currentRoleId !== roleIdNum) {
      selectRole({ user_id: user.userId, role_id: roleIdNum, push_to_telegram: false })
        .then((data) => {
          setRole(data.role);
          setCurrentRoleId(data.role.id);
        })
        .catch(() => {});
    }
    loadHistory();
  }, [user?.userId, roleIdNum]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (text: string) => {
    if (!user || sending) return;
    setSending(true);

    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role_id: roleIdNum,
      user_id: user.userId,
      group_seq: 0,
      timestamp: Date.now(),
      message_type: 'user',
      content: text,
      image_url: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    scrollToBottom();

    try {
      const data = await sendChatMessage({
        user_id: user.userId,
        role_id: roleIdNum,
        content: text,
        user_name: user.userName,
      });
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, data.user_message, ...data.assistant_messages];
      });
      if (data.role) setRole(data.role);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <div className={styles.container}>
      {/* Background image — Figma 303:58 */}
      {role?.chat_background_image_url && (
        <div className={styles.bgImage}>
          <img src={role.chat_background_image_url} alt="" />
        </div>
      )}

      {/* Header — Figma 303:135 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825V9" fill="#C084FC"/>
          </svg>
        </button>
        <h1 className={styles.headerTitle}>{role?.name || ''}</h1>
      </header>

      {/* Messages — Figma 303:59 */}
      <div ref={scrollRef} className={styles.messages}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatBubble key={msg.id} message={msg} isFirst={i === 0} />
            ))}
            {sending && <TypingIndicator />}
          </>
        )}
      </div>

      {/* Immersive Input Area — Figma 303:91 */}
      <ChatInput onSend={handleSend} disabled={sending || loading} />
    </div>
  );
}
