import { Message } from '@/types';
import { formatMessageTime } from '@/utils';
import Avatar from '@/components/ui/Avatar';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  showAvatar?: boolean;
  senderName?: string;
}

export default function MessageBubble({ message, isSent, showAvatar, senderName }: MessageBubbleProps) {
  return (
    <div className={`flex items-end gap-2 animate-slide-up ${isSent ? 'justify-end' : 'justify-start'}`}>
      {/* Received: show avatar placeholder for alignment */}
      {!isSent && (
        <div className="w-8 flex-shrink-0">
          {showAvatar && senderName ? <Avatar name={senderName} size="sm" /> : null}
        </div>
      )}

      <div className={`relative max-w-[70%] sm:max-w-[60%] ${isSent ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`
            px-3 py-2 rounded-2xl break-words
            ${isSent
              ? 'bg-whatsapp-bubble-sent text-whatsapp-text-primary rounded-br-sm'
              : 'bg-whatsapp-bubble-received text-whatsapp-text-primary rounded-bl-sm'
            }
          `}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
          <div className={`flex items-center gap-1 mt-0.5 ${isSent ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-whatsapp-text-muted">
              {formatMessageTime(message.createdAt)}
            </span>
            {isSent && (
              <span className={`text-[10px] ${message.read ? 'text-blue-400' : 'text-whatsapp-text-muted'}`}>
                {message.read ? (
                  // Double tick (read)
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 11">
                    <path d="M11.071.653a.75.75 0 0 1 .205 1.04l-6 9a.75.75 0 0 1-1.14.1l-3-3a.75.75 0 0 1 1.06-1.06l2.39 2.39 5.445-8.165a.75.75 0 0 1 1.04-.205zM5.53 7.47l.97.97L5.78 9.9l-.97-.97 .72-.96z" />
                  </svg>
                ) : (
                  // Single tick (sent)
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 11">
                    <path d="M10.97 1.22a.75.75 0 0 1 1.06 1.06l-7 7a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l2.47 2.47 6.47-6.47z" />
                  </svg>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
