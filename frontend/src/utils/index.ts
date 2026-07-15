import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

export const generateChatId = (userId1: string, userId2: string): string =>
  [userId1, userId2].sort().join('_');

export const formatMessageTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return format(date, 'HH:mm');
};

export const formatLastSeen = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isToday(date)) return `today at ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `yesterday at ${format(date, 'HH:mm')}`;
  return format(date, 'dd/MM/yyyy HH:mm');
};

export const formatSidebarTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd/MM/yy');
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncate = (str: string, maxLen = 40): string =>
  str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
