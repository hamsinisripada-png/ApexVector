import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AuthLayout from '../../components/AuthLayout';
import { Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll send a reset link to your email">
      {sent ? (
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
          </div>
          <p className="text-white font-semibold mb-2">Check your inbox</p>
          <p className="text-slate-400 text-sm mb-6">We sent a reset link to <strong className="text-white">{email}</strong></p>
          <Link to="/login" className="text-red-400 hover:text-red-300 text-sm font-medium transition">Back to login</Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
          )}
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@team.com"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-6">
            <Link to="/login" className="text-red-400 hover:text-red-300 font-medium transition">Back to login</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
