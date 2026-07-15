'use client';
import { useEffect, useRef, useState } from 'react';
import { User } from '@/types';
import { useMessages } from '@/hooks/useMessages';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { useTyping } from '@/hooks/useTyping';
import { chatService } from '@/services/chatService';
import { generateChatId, formatLastSeen } from '@/utils';
import Avatar from '@/components/ui/Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatPanelProps {
  currentUser: User;
  selectedUser: User;
  onBack?: () => void;
}

export default function ChatPanel({ currentUser, selectedUser, onBack }: ChatPanelProps) {
  const chatId = generateChatId(currentUser._id, selectedUser._id);
  const { messages, isLoading, sendMessage } = useMessages(chatId, selectedUser._id);
  const { isOnline } = useOnlineUsers();
  const { typingUsers, emitTyping } = useTyping(chatId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [chatReady, setChatReady] = useState(false);

  // Ensure chat record exists in DB
  useEffect(() => {
    chatService.getOrCreate(selectedUser._id)
      .then(() => setChatReady(true))
      .catch(console.error);
  }, [selectedUser._id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers.size]);

  const online = isOnline(selectedUser._id);
  const isTyping = typingUsers.size > 0;

  return (
    <div className="flex flex-col h-full bg-whatsapp-panel">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-whatsapp-header border-b border-whatsapp-border flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 -ml-1 text-whatsapp-text-secondary hover:text-whatsapp-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <Avatar name={selectedUser.name} size="md" isOnline={online} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-whatsapp-text-primary">{selectedUser.name}</p>
          <p className="text-xs text-whatsapp-text-secondary">
            {isTyping
              ? <span className="text-whatsapp-green animate-pulse">typing…</span>
              : online
              ? <span className="text-whatsapp-green">Online</span>
              : `Last seen ${formatLastSeen(selectedUser.lastSeen)}`}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 chat-scroll space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-whatsapp-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Avatar name={selectedUser.name} size="lg" />
              <p className="text-whatsapp-text-secondary text-sm mt-3">
                Start your conversation with <span className="text-whatsapp-text-primary font-medium">{selectedUser.name}</span>
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isSent = (typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId) === currentUser._id;
              const prevMsg = messages[i - 1];
              const prevSenderId = prevMsg
                ? typeof prevMsg.senderId === 'object'
                  ? prevMsg.senderId._id
                  : prevMsg.senderId
                : null;
              const currSenderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
              const showAvatar = !isSent && prevSenderId !== currSenderId;

              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isSent={isSent}
                  showAvatar={showAvatar}
                  senderName={typeof msg.senderId === 'object' ? msg.senderId.name : ''}
                />
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 animate-fade-in">
                <Avatar name={selectedUser.name} size="sm" />
                <div className="bg-whatsapp-bubble-received rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-2 h-2 bg-whatsapp-text-muted rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-whatsapp-text-muted rounded-full animate-typing" style={{ animationDelay: '200ms' }} />
                    <span className="w-2 h-2 bg-whatsapp-text-muted rounded-full animate-typing" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        onTyping={emitTyping}
        disabled={!chatReady}
      />
    </div>
  );
}
