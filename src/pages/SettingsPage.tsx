import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [favoriteDriver, setFavoriteDriver] = useState('');
  const [refreshRate, setRefreshRate] = useState(1000);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setTeamName(profile.team_name ?? '');
      setCarNumber(profile.car_number ?? '');
      setFavoriteDriver(profile.favorite_driver ?? '');
      setRefreshRate(profile.telemetry_refresh_rate ?? 1000);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      team_name: teamName,
      car_number: carNumber,
      favorite_driver: favoriteDriver,
      telemetry_refresh_rate: refreshRate,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <Layout>
      <div className="p-5 md:p-8 max-w-2xl space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>

        {/* Account */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">Account</h2>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Email</label>
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 text-sm">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Profile */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">Team Profile</h2>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Car Number</label>
            <input
              type="text"
              value={carNumber}
              onChange={e => setCarNumber(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Favorite Driver</label>
            <input
              type="text"
              value={favoriteDriver}
              onChange={e => setFavoriteDriver(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition text-sm"
            />
          </div>
        </div>

        {/* Telemetry */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">Telemetry</h2>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Data Refresh Rate</label>
            <select
              value={refreshRate}
              onChange={e => setRefreshRate(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition text-sm"
            >
              <option value={500}>500ms — High frequency</option>
              <option value={1000}>1000ms — Standard</option>
              <option value={2000}>2000ms — Battery saver</option>
            </select>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded-xl transition shadow-lg shadow-red-500/20"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>

        {/* About */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
          <h2 className="text-white font-semibold text-lg mb-3">About ApexVector</h2>
          <div className="space-y-1 text-sm text-slate-400">
            <p>Version 2.0.0</p>
            <p>AI-Powered Motorsport Engineering Platform</p>
            <p className="text-xs text-slate-600 mt-3">© {new Date().getFullYear()} ApexVector. All rights reserved.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
