'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { token, user } = await authService.login(email, password);
      login(token, user);
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-whatsapp-header rounded-2xl p-8 shadow-xl">
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-whatsapp-text-secondary mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full bg-whatsapp-input border border-whatsapp-border rounded-xl px-4 py-3 text-whatsapp-text-primary placeholder-whatsapp-text-muted focus:outline-none focus:border-whatsapp-teal transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-whatsapp-text-secondary mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-whatsapp-input border border-whatsapp-border rounded-xl px-4 py-3 text-whatsapp-text-primary placeholder-whatsapp-text-muted focus:outline-none focus:border-whatsapp-teal transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-whatsapp-teal hover:bg-whatsapp-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors mt-2"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in…
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
      <p className="text-center text-whatsapp-text-secondary text-sm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-whatsapp-green hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
