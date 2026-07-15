import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';

export const useTyping = (chatId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { socket } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    const handleStart = ({ userId, chatId: cId }: { userId: string; chatId: string }) => {
      if (cId === chatId) {
        setTypingUsers((prev) => new Set(Array.from(prev).concat(userId)));
      }
    };

    const handleStop = ({ userId, chatId: cId }: { userId: string; chatId: string }) => {
      if (cId === chatId) {
        setTypingUsers((prev) => {
          const next = new Set(Array.from(prev));
          next.delete(userId);
          return next;
        });
      }
    };

    socket.on('user_typing', handleStart);
    socket.on('user_stopped_typing', handleStop);

    return () => {
      socket.off('user_typing', handleStart);
      socket.off('user_stopped_typing', handleStop);
    };
  }, [socket, chatId]);

  const emitTyping = useCallback(() => {
    if (!socket || !chatId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing_start', { chatId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('typing_stop', { chatId });
    }, 1500);
  }, [socket, chatId]);

  return { typingUsers, emitTyping };
};