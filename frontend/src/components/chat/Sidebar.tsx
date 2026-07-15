'use client';
import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import { formatLastSeen, truncate } from '@/utils';

interface SidebarProps {
  currentUser: User;
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
}

export default function Sidebar({ currentUser, selectedUserId, onSelectUser }: SidebarProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();
  const { isOnline } = useOnlineUsers();
  const router = useRouter();

  const loadUsers = useCallback(async () => {
    try {
      const { users: all } = await userService.getAll();
      setUsers(all);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Debounced search
  useEffect(() => {
    if (!search.trim()) {
      loadUsers();
      return;
    }
    const t = setTimeout(async () => {
      try {
        const { users: results } = await userService.search(search);
        setUsers(results);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [search, loadUsers]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filtered = users.filter((u) => u._id !== currentUser._id);

  return (
    <div className="flex flex-col h-full bg-whatsapp-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-whatsapp-header">
        <div className="flex items-center gap-3">
          <Avatar name={currentUser.name} size="md" />
          <div>
            <p className="text-sm font-medium text-whatsapp-text-primary">{currentUser.name}</p>
            <p className="text-xs text-whatsapp-text-secondary">{currentUser.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUser.role === 'admin' && (
            <button
              onClick={() => router.push('/admin')}
              title="Admin panel"
              className="p-2 rounded-full hover:bg-whatsapp-input text-whatsapp-text-secondary hover:text-whatsapp-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-full hover:bg-whatsapp-input text-whatsapp-text-secondary hover:text-red-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-whatsapp-sidebar">
        <div className="flex items-center gap-2 bg-whatsapp-input rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-whatsapp-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="flex-1 bg-transparent text-sm text-whatsapp-text-primary placeholder-whatsapp-text-muted focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-whatsapp-text-muted hover:text-whatsapp-text-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-whatsapp-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-whatsapp-text-muted text-sm px-4">
            {search ? 'No users found for that search' : 'No other users yet'}
          </div>
        ) : (
          <ul>
            {filtered.map((u) => {
              const online = isOnline(u._id);
              const isSelected = selectedUserId === u._id;
              return (
                <li key={u._id}>
                  <button
                    onClick={() => onSelectUser(u)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-whatsapp-header transition-colors text-left ${
                      isSelected ? 'bg-whatsapp-header' : ''
                    }`}
                  >
                    <Avatar name={u.name} size="md" isOnline={online} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-whatsapp-text-primary truncate">
                          {u.name}
                        </span>
                        <span className="text-xs text-whatsapp-text-muted flex-shrink-0 ml-2">
                          {online ? (
                            <span className="text-whatsapp-green">Online</span>
                          ) : (
                            formatLastSeen(u.lastSeen)
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-whatsapp-text-secondary truncate mt-0.5">
                        {truncate(u.email, 32)}
                      </p>
                    </div>
                  </button>
                  <div className="ml-16 border-b border-whatsapp-border/40" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
