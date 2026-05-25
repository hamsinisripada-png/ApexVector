import { useState, useCallback } from 'react';
import Layout from '../components/Layout';
import TrackMap from '../components/TrackMap';
import { useTelemetryContext } from '../contexts/TelemetryContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Play, Square, RotateCcw, Gauge, Zap, Thermometer, Fuel, Timer } from 'lucide-react';

function fmtTime(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function fmtLapTime(ms: number | null) {
  if (!ms) return '--:--.--';
  return fmtTime(ms);
}

function getSector(prog: number): 1 | 2 | 3 {
  if (prog < 0.33) return 1;
  if (prog < 0.66) return 2;
  return 3;
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { buffer, current, session, ended, start, stop, reset } = useTelemetryContext();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleStart = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('telemetry_sessions')
      .insert({
        user_id: user.id,
        session_name: `Session ${new Date().toLocaleTimeString()}`,
        track_name: 'Silverstone Circuit',
        driver_name: profile?.favorite_driver || 'Driver',
        car_number: Number(profile?.car_number) || 0,
        status: 'active',
      })
      .select()
      .single();
    if (data) setSessionId(data.id);
    start();
  }, [user, profile, start]);

  const handleStop = useCallback(async () => {
    stop();
    setSaving(true);
    if (sessionId && buffer.length > 0) {
      const speeds = buffer.map(p => p.speed);
      const rpms = buffer.map(p => p.rpm);
      const maxTireWear = Math.max(
        ...buffer.map(p => Math.max(p.tireTempFL, p.tireTempFR, p.tireTempRL, p.tireTempRR))
      );
      const tireWearPct = Math.round(((maxTireWear - 70) / 40) * 100);

      await supabase.from('telemetry_sessions').update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        best_lap_time: session.lastLapMs ? session.lastLapMs / 1000 : null,
        avg_speed: Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length),
        max_rpm: Math.max(...rpms),
        total_laps: session.lap - 1,
        tyre_wear_pct: tireWearPct,
        duration_seconds: Math.round(session.elapsed / 1000),
      }).eq('id', sessionId);
    }
    setSaving(false);
    setSessionId(null);
  }, [stop, sessionId, buffer, session]);

  const handleReset = useCallback(() => {
    reset();
    setSessionId(null);
  }, [reset]);

  const chartData = buffer.map((p, i) => ({
    i,
    speed: p.speed,
    rpm: p.rpm,
    throttle: p.throttle,
    brake: p.brake,
    tireTempFL: p.tireTempFL,
    tireTempFR: p.tireTempFR,
    tireTempRL: p.tireTempRL,
    tireTempRR: p.tireTempRR,
  }));

  const lapProg = current?.lapProgress ?? 0;
  const sector = getSector(lapProg);

  const metrics = [
    { label: 'Speed', value: `${current?.speed ?? 0}`, unit: 'km/h', icon: Gauge, color: 'text-blue-400', bar: (current?.speed ?? 0) / 340 },
    { label: 'RPM', value: (current?.rpm ?? 0).toLocaleString(), unit: 'rev/min', icon: Zap, color: (current?.rpm ?? 0) > 11500 ? 'text-red-400' : 'text-red-400', bar: (current?.rpm ?? 0) / 12500 },
    { label: 'Throttle', value: `${current?.throttle ?? 0}`, unit: '%', icon: Fuel, color: 'text-emerald-400', bar: (current?.throttle ?? 0) / 100 },
    { label: 'Brake', value: `${current?.brake ?? 0}`, unit: '%', icon: Thermometer, color: 'text-orange-400', bar: (current?.brake ?? 0) / 100 },
  ];

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Live Telemetry</h1>
            {profile?.team_name && <p className="text-slate-500 text-sm mt-0.5">{profile.team_name}</p>}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Session timer display */}
            {(session.running || ended) && (
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  {session.running ? (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                  )}
                  <span className={session.running ? 'text-red-400 font-bold' : 'text-slate-400'}>
                    {session.running ? 'LIVE' : 'ENDED'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <Timer className="w-3.5 h-3.5 text-slate-500" />
                  <span className={session.running ? 'text-emerald-400' : 'text-slate-500'}>{fmtTime(session.elapsed)}</span>
                </div>
                <div className="text-slate-500">
                  Lap <span className="text-white font-bold">{session.lap}</span>
                </div>
                {session.lastLapMs && (
                  <div className="text-slate-500">
                    Last <span className="text-blue-400 font-bold">{fmtLapTime(session.lastLapMs)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2">
              {!session.running && !ended && (
                <button onClick={handleStart} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-red-500/20">
                  <Play className="w-4 h-4" /> Start Session
                </button>
              )}
              {session.running && (
                <button onClick={handleStop} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-red-600/15 border border-red-500/30 text-red-400 hover:bg-red-600/25 rounded-xl text-sm font-semibold transition">
                  <Square className="w-4 h-4" /> Stop
                </button>
              )}
              {(session.running || ended) && (
                <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition">
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Session ended banner */}
        {ended && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-white font-semibold">Session Ended</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-400 flex-wrap">
              <span>Duration: <strong className="text-white">{fmtTime(session.elapsed)}</strong></span>
              <span>Laps: <strong className="text-white">{session.lap - 1}</strong></span>
              {session.lastLapMs && <span>Best Lap: <strong className="text-blue-400">{fmtLapTime(session.lastLapMs)}</strong></span>}
              <span>Max Speed: <strong className="text-white">{buffer.length > 0 ? Math.max(...buffer.map(p => p.speed)) : 0} km/h</strong></span>
            </div>
            {saving && <span className="text-slate-500 text-xs ml-auto">Saving to database...</span>}
          </div>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map(({ label, value, unit, icon: Icon, color, bar }) => (
            <div key={label} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl md:text-3xl font-bold tabular-nums transition-all duration-300 ${color}`}>{value}</p>
              <p className="text-slate-600 text-xs mt-0.5">{unit}</p>
              <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(100, bar * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Gear + DRS + Fuel row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black border-2 transition-all duration-300 ${session.running ? 'border-white/20 text-white bg-slate-800' : 'border-slate-700 text-slate-600 bg-slate-900'}`}>
              {current?.gear ?? '-'}
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Gear</p>
              <p className="text-slate-400 text-xs">Current selection</p>
            </div>
          </div>

          <div className={`rounded-xl p-4 flex items-center justify-center border transition-all duration-300 ${current?.drs && session.running ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-slate-900/70 border-slate-800'}`}>
            <div className="text-center">
              <p className={`text-2xl font-black tracking-widest ${current?.drs && session.running ? 'text-emerald-400' : 'text-slate-600'}`}>DRS</p>
              <p className={`text-xs mt-0.5 ${current?.drs && session.running ? 'text-emerald-500' : 'text-slate-600'}`}>
                {current?.drs && session.running ? 'ACTIVE' : 'INACTIVE'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-500 text-xs mb-1">Fuel Load</p>
            <p className={`text-2xl font-bold tabular-nums ${(current?.fuel ?? 100) < 20 ? 'text-red-400' : (current?.fuel ?? 100) < 40 ? 'text-amber-400' : 'text-white'}`}>
              {current?.fuel?.toFixed(1) ?? '100.0'}%
            </p>
            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${(current?.fuel ?? 100) < 20 ? 'bg-red-500' : (current?.fuel ?? 100) < 40 ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${current?.fuel ?? 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Speed Trace</h3>
            {buffer.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="i" hide />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[0, 340]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} formatter={v => [`${v} km/h`, 'Speed']} />
                  <Area isAnimationActive={false} type="monotone" dataKey="speed" stroke="#3b82f6" fill="url(#sg)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm">Start a session to see live data</div>
            )}
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Throttle vs Brake</h3>
            {buffer.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="i" hide />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} formatter={v => [`${v}%`]} />
                  <Line isAnimationActive={false} type="monotone" dataKey="throttle" stroke="#10b981" strokeWidth={2} dot={false} name="Throttle" />
                  <Line isAnimationActive={false} type="monotone" dataKey="brake" stroke="#f97316" strokeWidth={2} dot={false} name="Brake" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm">Start a session to see live data</div>
            )}
          </div>
        </div>

        {/* Tyre temps chart + track map row */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Tyre Temperatures (Live)</h3>
            {buffer.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="i" hide />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[70, 115]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} formatter={v => [`${v}°C`]} />
                  <Line isAnimationActive={false} type="monotone" dataKey="tireTempFL" stroke="#ef4444" strokeWidth={1.5} dot={false} name="FL" />
                  <Line isAnimationActive={false} type="monotone" dataKey="tireTempFR" stroke="#f97316" strokeWidth={1.5} dot={false} name="FR" />
                  <Line isAnimationActive={false} type="monotone" dataKey="tireTempRL" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="RL" />
                  <Line isAnimationActive={false} type="monotone" dataKey="tireTempRR" stroke="#0ea5e9" strokeWidth={1.5} dot={false} name="RR" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm">Start a session to see live data</div>
            )}
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Circuit Map</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500" /> S1</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" /> S2</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> S3</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-xs">
                <TrackMap lapProgress={lapProg} sector={sector} />
              </div>
            </div>
            {session.running && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                {([1, 2, 3] as const).map(s => (
                  <div key={s} className={`py-1.5 rounded-lg transition-all ${sector === s ? (s === 1 ? 'bg-red-500/20 text-red-400 font-bold' : s === 2 ? 'bg-blue-500/20 text-blue-400 font-bold' : 'bg-emerald-500/20 text-emerald-400 font-bold') : 'text-slate-600'}`}>
                    Sector {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Brake temps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { pos: 'FL', temp: current?.brakeTempFL ?? 200 },
            { pos: 'FR', temp: current?.brakeTempFR ?? 200 },
            { pos: 'RL', temp: current?.brakeTempRL ?? 200 },
            { pos: 'RR', temp: current?.brakeTempRR ?? 200 },
          ].map(({ pos, temp }) => {
            const critical = temp > 700;
            const hot = temp > 500;
            return (
              <div key={pos} className={`rounded-xl p-4 border transition-all duration-300 ${critical ? 'bg-red-500/10 border-red-500/30' : hot ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-900/70 border-slate-800'}`}>
                <p className="text-slate-500 text-xs mb-1">Brake {pos}</p>
                <p className={`text-xl font-bold tabular-nums transition-all duration-300 ${critical ? 'text-red-400' : hot ? 'text-amber-400' : 'text-white'}`}>{temp}°C</p>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
