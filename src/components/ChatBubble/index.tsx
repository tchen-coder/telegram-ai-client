import type { ChatMessage, AssistantContent, ContentPart } from '../../types/api';
import styles from './ChatBubble.module.css';

interface ChatBubbleProps {
  message: ChatMessage;
  isFirst?: boolean;
  animate?: boolean;
}

function isAssistantContent(c: unknown): c is AssistantContent {
  return typeof c === 'object' && c !== null && 'sentences' in c && Array.isArray((c as AssistantContent).sentences);
}

function renderParts(parts: ContentPart[] | null | undefined) {
  if (!Array.isArray(parts)) return null;
  return parts.map((part, i) =>
    part.type === 'action'
      ? <span key={i} className={styles.actionText}>{String(part.content ?? '')}</span>
      : <span key={i}>{String(part.content ?? '')}</span>
  );
}

/** Safe text extraction — never returns an object */
function extractText(content: ChatMessage['content']): string {
  if (typeof content === 'string') return content;
  if (content && typeof content === 'object') {
    if ('full_text' in content) return (content as AssistantContent).full_text ?? '';
  }
  return '';
}

export default function ChatBubble({ message, isFirst, animate }: ChatBubbleProps) {
  const isUser = message.message_type === 'user';
  const isImage = message.message_type === 'assistant_image';

  if (isImage) {
    return (
      <div className={`${styles.imageMessage} ${animate ? styles.fadeIn : ''}`}>
        {message.image_url && (
          <img className={styles.image} src={message.image_url} alt="" loading="lazy" />
        )}
      </div>
    );
  }

  let textNode: React.ReactNode;
  if (!isUser && isAssistantContent(message.content)) {
    // Structured content: render each sentence's parts
    const ac = message.content;
    textNode = ac.sentences.map((s, si) => (
      <span key={s.seq ?? si}>
        {renderParts(s.parts)}
        {si < ac.sentences.length - 1 ? ' ' : ''}
      </span>
    ));
  } else {
    // Plain string — use safe extractor so objects never reach React renderer
    textNode = extractText(message.content);
  }

  return (
    <div className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant} ${isFirst ? '' : styles.gap} ${animate ? styles.fadeIn : ''}`}>
      <div className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}>
        <p className={styles.text}>{textNode}</p>
      </div>
    </div>
  );
}
