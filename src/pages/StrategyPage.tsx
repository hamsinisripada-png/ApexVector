import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useTelemetryContext } from '../contexts/TelemetryContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, Cloud, AlertTriangle, CheckCircle, AlertCircle, Timer } from 'lucide-react';

type Compound = 'Soft' | 'Medium' | 'Hard' | 'Inter' | 'Wet';

const COMPOUND_COLORS: Record<Compound, string> = {
  Soft: '#ef4444',
  Medium: '#f59e0b',
  Hard: '#94a3b8',
  Inter: '#10b981',
  Wet: '#3b82f6',
};

const COMPOUND_DEGRADATION: Record<Compound, number> = {
  Soft: 2.8,
  Medium: 1.5,
  Hard: 0.8,
  Inter: 1.2,
  Wet: 1.0,
};

const COMPOUND_MAX_LAPS: Record<Compound, number> = {
  Soft: 20,
  Medium: 35,
  Hard: 52,
  Inter: 28,
  Wet: 30,
};

const OPTIMAL_PIT_LAP = 28;
const TOTAL_LAPS = 56;

const weatherData = [
  { time: 'Now', temp: 24, chance: 5 },
  { time: '+15L', temp: 23, chance: 15 },
  { time: '+30L', temp: 22, chance: 35 },
  { time: '+45L', temp: 20, chance: 55 },
  { time: 'Finish', temp: 18, chance: 45 },
];

export default function StrategyPage() {
  const { session, current } = useTelemetryContext();
  const [compound, setCompound] = useState<Compound>('Medium');
  const [pitCountdown, setPitCountdown] = useState(OPTIMAL_PIT_LAP - 1);
  const prevLapRef = useRef(session.lap);

  useEffect(() => {
    if (session.lap !== prevLapRef.current) {
      prevLapRef.current = session.lap;
      setPitCountdown(prev => Math.max(0, prev - 1));
    }
  }, [session.lap]);

  // Rebuild tyre wear curve based on selected compound
  const tireWearData = Array.from({ length: TOTAL_LAPS }, (_, i) => ({
    lap: i + 1,
    wear: Math.min(100, 5 + i * COMPOUND_DEGRADATION[compound] + Math.random() * 2),
  }));

  const pitWindowData = Array.from({ length: TOTAL_LAPS }, (_, i) => ({
    lap: i + 1,
    gain: i >= 25 && i <= 32 ? 0.25 + Math.random() * 0.45 : Math.random() * 0.08,
  }));

  const alerts = [
    { level: 'CRITICAL', icon: AlertCircle, color: 'red', msg: `${compound} tires: optimal window Lap 28–31` },
    { level: 'WARNING', icon: AlertTriangle, color: 'amber', msg: 'Fuel consumption 3% above average pace' },
    { level: 'INFO', icon: CheckCircle, color: 'blue', msg: 'DRS available — activate on main straight' },
  ];

  const compounds: Compound[] = ['Soft', 'Medium', 'Hard', 'Inter', 'Wet'];

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-5">
        <h1 className="text-2xl font-bold text-white">AI Race Strategy</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Pit countdown */}
          <div className={`rounded-xl p-5 border-l-4 border-y border-r transition-all ${
            pitCountdown <= 3 ? 'bg-red-500/10 border-l-red-500 border-y-red-500/20 border-r-red-500/20' :
            pitCountdown <= 8 ? 'bg-amber-500/10 border-l-amber-500 border-y-amber-500/20 border-r-amber-500/20' :
            'bg-slate-900/70 border-l-emerald-500 border-y-slate-800 border-r-slate-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Timer className={`w-4 h-4 ${pitCountdown <= 3 ? 'text-red-400' : pitCountdown <= 8 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <p className="text-slate-400 text-xs">Pit Window</p>
            </div>
            <p className={`text-3xl font-bold tabular-nums ${pitCountdown <= 3 ? 'text-red-400' : pitCountdown <= 8 ? 'text-amber-400' : 'text-white'}`}>
              {session.running && pitCountdown > 0 ? `${pitCountdown}L` : session.running ? 'BOX NOW' : 'Lap 28'}
            </p>
            <p className={`text-xs mt-1 ${pitCountdown <= 3 ? 'text-red-500' : 'text-slate-500'}`}>
              {session.running ? (pitCountdown > 0 ? `Pit in ${pitCountdown} laps` : 'Pit stop optimal now!') : 'Start session to activate'}
            </p>
          </div>

          <div className="bg-slate-900/70 border-l-4 border-l-blue-500 border-y border-r border-slate-800 rounded-r-xl p-5">
            <p className="text-slate-400 text-xs mb-2">Strategy</p>
            <p className="text-2xl font-bold text-white">{compound} → Hard</p>
            <p className="text-blue-400 text-xs mt-1">1-stop · 94% confidence</p>
          </div>

          <div className="bg-slate-900/70 border-l-4 border-l-amber-500 border-y border-r border-slate-800 rounded-r-xl p-5">
            <p className="text-slate-400 text-xs mb-2">Fuel remaining</p>
            <p className="text-2xl font-bold text-white">{current?.fuel?.toFixed(1) ?? '100.0'}%</p>
            <p className={`text-xs mt-1 ${(current?.fuel ?? 100) < 20 ? 'text-red-400' : 'text-amber-400'}`}>
              {(current?.fuel ?? 100) < 20 ? 'Low fuel — consider pit' : 'Nominal'}
            </p>
          </div>
        </div>

        {/* Compound selector */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3 text-sm">Tyre Compound Selector</h3>
          <div className="flex gap-2 flex-wrap">
            {compounds.map(c => (
              <button
                key={c}
                onClick={() => setCompound(c)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  compound === c
                    ? 'text-white border-current'
                    : 'text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                }`}
                style={compound === c ? { backgroundColor: `${COMPOUND_COLORS[c]}20`, borderColor: COMPOUND_COLORS[c], color: COMPOUND_COLORS[c] } : {}}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COMPOUND_COLORS[c] }} />
                {c}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-center">
            <div className="bg-slate-800 rounded-lg p-2">
              <p className="text-slate-500">Max Laps</p>
              <p className="text-white font-bold mt-0.5">{COMPOUND_MAX_LAPS[compound]}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-2">
              <p className="text-slate-500">Deg Rate</p>
              <p className="text-white font-bold mt-0.5">{COMPOUND_DEGRADATION[compound]}%/lap</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-2">
              <p className="text-slate-500">Current</p>
              <p className="font-bold mt-0.5" style={{ color: COMPOUND_COLORS[compound] }}>{compound}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Tyre wear curve */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-1 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Degradation Curve — {compound}
            </h3>
            <p className="text-slate-500 text-xs mb-4">Projected wear over {TOTAL_LAPS} laps</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={tireWearData}>
                <defs>
                  <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COMPOUND_COLORS[compound]} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COMPOUND_COLORS[compound]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="lap" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} formatter={v => [`${(v as number).toFixed(1)}%`, 'Wear']} />
                <Area isAnimationActive={true} type="monotone" dataKey="wear" stroke={COMPOUND_COLORS[compound]} fill="url(#tg)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pit gain chart */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-1 text-sm">Pit Stop Gain by Lap</h3>
            <p className="text-slate-500 text-xs mb-4">Time gained (seconds) from pitting each lap</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={pitWindowData}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="lap" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} formatter={v => [`${(v as number).toFixed(2)}s`, 'Gain']} />
                <Area isAnimationActive={false} type="monotone" dataKey="gain" stroke="#10b981" fill="url(#pg)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weather */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" /> Weather Forecast
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="chance" fill="#0ea5e9" name="Rain %" radius={[3, 3, 0, 0]} />
                <Bar dataKey="temp" fill="#f59e0b" name="Temp °C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Strategic Alerts</h3>
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className={`p-3.5 rounded-xl border ${
                  a.color === 'red' ? 'bg-red-500/8 border-red-500/20' :
                  a.color === 'amber' ? 'bg-amber-500/8 border-amber-500/20' :
                  'bg-blue-500/8 border-blue-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <a.icon className={`w-4 h-4 ${a.color === 'red' ? 'text-red-400' : a.color === 'amber' ? 'text-amber-400' : 'text-blue-400'}`} />
                    <span className={`text-xs font-bold ${a.color === 'red' ? 'text-red-400' : a.color === 'amber' ? 'text-amber-400' : 'text-blue-400'}`}>{a.level}</span>
                  </div>
                  <p className="text-sm text-slate-300">{a.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
