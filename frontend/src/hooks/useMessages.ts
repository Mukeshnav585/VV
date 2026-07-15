import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/types';
import { messageService } from '@/services/chatService';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

export const useMessages = (chatId: string | null, receiverId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();
  const joinedChatRef = useRef<string | null>(null);

  // Load message history when chat changes
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    messageService
      .getHistory(chatId)
      .then(({ messages: msgs, pagination }) => {
        setMessages(msgs);
        setHasMore(pagination.hasMore);
        // Mark as read
        messageService.markAsRead(chatId).catch(console.error);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [chatId]);

  // Join/leave socket room when chat changes
  useEffect(() => {
    if (!socket || !chatId) return;

    // Leave previous room
    if (joinedChatRef.current && joinedChatRef.current !== chatId) {
      socket.emit('leave_chat', joinedChatRef.current);
    }

    socket.emit('join_chat', chatId);
    joinedChatRef.current = chatId;

    return () => {
      if (chatId) socket.emit('leave_chat', chatId);
    };
  }, [socket, chatId]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message: Message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      // Auto mark as read if we're the receiver and chat is open
      if (
        message.chatId === chatId &&
        typeof message.senderId === 'object' &&
        message.senderId._id !== user?._id
      ) {
        messageService.markAsRead(message.chatId).catch(console.error);
      }
    };

    socket.on('receive_message', handleReceive);
    return () => { socket.off('receive_message', handleReceive); };
  }, [socket, chatId, user?._id]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!socket || !chatId || !receiverId || !text.trim()) return;
      socket.emit('send_message', { chatId, receiverId, text: text.trim() });
    },
    [socket, chatId, receiverId]
  );

  const loadMore = useCallback(async (page: number) => {
    if (!chatId || !hasMore) return;
    const { messages: older, pagination } = await messageService.getHistory(chatId, page);
    setMessages((prev) => [...older, ...prev]);
    setHasMore(pagination.hasMore);
  }, [chatId, hasMore]);

  return { messages, isLoading, hasMore, sendMessage, loadMore };
};
