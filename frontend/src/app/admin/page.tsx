'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import { AdminStats, User, Chat } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { formatLastSeen } from '@/utils';

type Tab = 'overview' | 'users' | 'chats';

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/chat');
    }
  }, [user, isLoading, router]);

  const loadData = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    try {
      const [s, u, c] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getChats(),
      ]);
      setStats(s);
      setUsers(u.users);
      setChats(c.chats);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}" and all their data? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      loadData(); // refresh stats
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="h-screen flex items-center justify-center bg-whatsapp-panel">
        <div className="w-8 h-8 border-2 border-whatsapp-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'overview',
      label: 'Overview',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
    {
      key: 'users',
      label: 'Users',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    },
    {
      key: 'chats',
      label: 'Chats',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen bg-whatsapp-panel">
      {/* Top bar */}
      <div className="bg-whatsapp-header border-b border-whatsapp-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/chat')}
            className="p-2 rounded-full hover:bg-whatsapp-input text-whatsapp-text-secondary hover:text-whatsapp-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-whatsapp-text-primary">Admin Dashboard</h1>
        </div>
        <span className="text-xs bg-whatsapp-teal/20 text-whatsapp-teal px-2.5 py-1 rounded-full font-medium">
          {user.name}
        </span>
      </div>

      {/* Tab bar */}
      <div className="bg-whatsapp-header border-b border-whatsapp-border px-6">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-whatsapp-teal text-whatsapp-teal'
                  : 'border-transparent text-whatsapp-text-secondary hover:text-whatsapp-text-primary'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-whatsapp-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Total Users" value={stats.totalUsers} color="teal" />
                  <StatCard label="Online Now" value={stats.onlineUsers} color="green" />
                  <StatCard label="Total Messages" value={stats.totalMessages} color="blue" />
                  <StatCard label="Total Chats" value={stats.totalChats} color="purple" />
                </div>

                <div className="bg-whatsapp-header rounded-xl p-5 border border-whatsapp-border">
                  <h2 className="text-sm font-semibold text-whatsapp-text-primary mb-4">Top Active Users</h2>
                  {stats.topUsers.length === 0 ? (
                    <p className="text-whatsapp-text-muted text-sm">No messages yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.topUsers.map((u, i) => (
                        <div key={u._id} className="flex items-center gap-3">
                          <span className="w-6 text-center text-xs font-semibold text-whatsapp-text-muted">#{i + 1}</span>
                          <Avatar name={u.user.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-whatsapp-text-primary truncate">{u.user.name}</p>
                            <p className="text-xs text-whatsapp-text-secondary truncate">{u.user.email}</p>
                          </div>
                          <span className="text-sm font-semibold text-whatsapp-teal">{u.messageCount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {tab === 'users' && (
              <div className="bg-whatsapp-header rounded-xl border border-whatsapp-border overflow-hidden">
                <div className="px-5 py-4 border-b border-whatsapp-border">
                  <h2 className="text-sm font-semibold text-whatsapp-text-primary">All Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-whatsapp-border">
                        <th className="text-left px-5 py-3 text-xs font-medium text-whatsapp-text-muted">User</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-whatsapp-text-muted">Role</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-whatsapp-text-muted">Status</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-whatsapp-text-muted">Joined</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-whatsapp-border/50 hover:bg-whatsapp-input/30">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.name} size="sm" isOnline={u.isOnline} />
                              <div>
                                <p className="font-medium text-whatsapp-text-primary">{u.name}</p>
                                <p className="text-xs text-whatsapp-text-secondary">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              u.role === 'admin'
                                ? 'bg-whatsapp-teal/20 text-whatsapp-teal'
                                : 'bg-whatsapp-input text-whatsapp-text-secondary'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs ${u.isOnline ? 'text-whatsapp-green' : 'text-whatsapp-text-muted'}`}>
                              {u.isOnline ? 'Online' : `Last seen ${formatLastSeen(u.lastSeen)}`}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-whatsapp-text-muted">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CHATS TAB */}
            {tab === 'chats' && (
              <div className="bg-whatsapp-header rounded-xl border border-whatsapp-border overflow-hidden">
                <div className="px-5 py-4 border-b border-whatsapp-border">
                  <h2 className="text-sm font-semibold text-whatsapp-text-primary">All Chats ({chats.length})</h2>
                </div>
                <div className="divide-y divide-whatsapp-border/50">
                  {chats.length === 0 ? (
                    <p className="text-whatsapp-text-muted text-sm px-5 py-6">No chats yet.</p>
                  ) : (
                    chats.map((chat) => (
                      <div key={chat._id} className="px-5 py-4 hover:bg-whatsapp-input/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {chat.members.map((m) => (
                                <Avatar key={m._id} name={m.name} size="sm" />
                              ))}
                            </div>
                            <div>
                              <p className="text-sm text-whatsapp-text-primary">
                                {chat.members.map((m) => m.name).join(' ↔ ')}
                              </p>
                              {chat.lastMessage && (
                                <p className="text-xs text-whatsapp-text-secondary mt-0.5 truncate max-w-xs">
                                  {chat.lastMessage}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-whatsapp-text-muted">
                            {new Date(chat.lastMessageAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    teal: 'text-whatsapp-teal bg-whatsapp-teal/10',
    green: 'text-whatsapp-green bg-whatsapp-green/10',
    blue: 'text-blue-400 bg-blue-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
  };
  return (
    <div className="bg-whatsapp-header rounded-xl p-5 border border-whatsapp-border">
      <p className="text-xs text-whatsapp-text-muted font-medium uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color].split(' ')[0]}`}>{value.toLocaleString()}</p>
    </div>
  );
}
