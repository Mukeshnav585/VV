import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';

export const useOnlineUsers = () => {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (userIds: string[]) => {
      setOnlineUserIds(new Set(Array.from(userIds)));
    };

    socket.on('update_online_users', handleUpdate);
    return () => { socket.off('update_online_users', handleUpdate); };
  }, [socket]);

  const isOnline = (userId: string) => onlineUserIds.has(userId);

  return { onlineUserIds, isOnline };
};