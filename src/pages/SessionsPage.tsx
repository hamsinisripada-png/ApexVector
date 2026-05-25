import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Clock, TrendingUp, Gauge, Zap, RotateCcw } from 'lucide-react';

type Session = {
  id: string;
  session_name: string;
  track_name: string;
  driver_name: string;
  car_number: number;
  status: string;
  started_at: string;
  ended_at: string | null;
  best_lap_time: number | null;
  avg_speed: number;
  max_rpm: number;
  total_laps: number;
  tyre_wear_pct: number;
  duration_seconds: number;
};

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function fmtLapTime(s: number | null) {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(3);
  return `${m}:${sec.padStart(6, '0')}`;
}

export default function SessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  const loadSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('telemetry_sessions')
      .select('*')
      .eq('user_id', user!.id)
      .order('started_at', { ascending: false })
      .limit(50);
    setSessions((data as Session[]) ?? []);
    setLoading(false);
  };

  const stats = sessions.length > 0 ? {
    totalSessions: sessions.length,
    totalLaps: sessions.reduce((a, s) => a + (s.total_laps ?? 0), 0),
    bestLap: sessions.reduce((best, s) => {
      if (!s.best_lap_time) return best;
      return best === null || s.best_lap_time < best ? s.best_lap_time : best;
    }, null as number | null),
    avgSpeed: Math.round(sessions.filter(s => s.avg_speed > 0).reduce((a, s) => a + s.avg_speed, 0) / (sessions.filter(s => s.avg_speed > 0).length || 1)),
  } : null;

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Session History</h1>
          <button
            onClick={loadSessions}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Stats summary */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Clock, label: 'Total Sessions', value: stats.totalSessions.toString(), color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: TrendingUp, label: 'Total Laps', value: stats.totalLaps.toString(), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: Gauge, label: 'Best Lap', value: fmtLapTime(stats.bestLap), color: 'text-red-400', bg: 'bg-red-500/10' },
              { icon: Zap, label: 'Avg Speed', value: stats.avgSpeed > 0 ? `${stats.avgSpeed} km/h` : '—', color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">{label}</p>
                  <p className={`font-bold text-lg tabular-nums ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No sessions yet.</p>
              <p className="text-slate-600 text-sm mt-1">Start a live session on the Dashboard to begin logging.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-medium">Session</th>
                    <th className="text-left px-3 py-3 font-medium">Track</th>
                    <th className="text-right px-3 py-3 font-medium">Laps</th>
                    <th className="text-right px-3 py-3 font-medium">Best Lap</th>
                    <th className="text-right px-3 py-3 font-medium">Avg Spd</th>
                    <th className="text-right px-3 py-3 font-medium">Max RPM</th>
                    <th className="text-right px-3 py-3 font-medium">Duration</th>
                    <th className="text-right px-3 py-3 font-medium">Tyre</th>
                    <th className="text-center px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sessions.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-white font-medium truncate max-w-[150px]">{s.session_name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{new Date(s.started_at).toLocaleDateString()} {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-3 py-3.5 text-slate-400">{s.track_name || '—'}</td>
                      <td className="px-3 py-3.5 text-right text-white tabular-nums">{s.total_laps || '—'}</td>
                      <td className="px-3 py-3.5 text-right text-blue-400 font-mono tabular-nums">{fmtLapTime(s.best_lap_time)}</td>
                      <td className="px-3 py-3.5 text-right text-slate-300 tabular-nums">{s.avg_speed > 0 ? `${s.avg_speed} km/h` : '—'}</td>
                      <td className="px-3 py-3.5 text-right text-slate-300 tabular-nums">{s.max_rpm > 0 ? s.max_rpm.toLocaleString() : '—'}</td>
                      <td className="px-3 py-3.5 text-right text-slate-400">{s.duration_seconds > 0 ? fmtDuration(s.duration_seconds) : '—'}</td>
                      <td className="px-3 py-3.5 text-right">
                        {s.tyre_wear_pct > 0 ? (
                          <span className={`tabular-nums font-medium ${s.tyre_wear_pct > 80 ? 'text-red-400' : s.tyre_wear_pct > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {s.tyre_wear_pct}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          s.status === 'active' ? 'bg-red-500/15 text-red-400' :
                          s.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
