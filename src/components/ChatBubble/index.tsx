import type { ChatMessage } from '../../types/api';
import styles from './ChatBubble.module.css';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.message_type === 'user';
  const isImage = message.message_type === 'assistant_image';

  if (isImage) {
    return (
      <div className={styles.imageMessage}>
        {message.image_url && (
          <img
            className={styles.image}
            src={message.image_url}
            alt="角色图片"
            loading="lazy"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}>
      <p className={styles.text}>{message.content}</p>
    </div>
  );
}
