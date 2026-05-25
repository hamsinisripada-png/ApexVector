import Layout from '../components/Layout';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingDown, AlertTriangle, CheckCircle, Cpu } from 'lucide-react';

const tireWear = Array.from({ length: 56 }, (_, i) => ({
  lap: i + 1,
  fl: Math.min(100, 10 + i * 1.6 + Math.random() * 3),
  fr: Math.min(100, 10 + i * 1.7 + Math.random() * 3),
  rl: Math.min(100, 8 + i * 1.4 + Math.random() * 3),
  rr: Math.min(100, 8 + i * 1.5 + Math.random() * 3),
}));

const lapProjection = Array.from({ length: 20 }, (_, i) => ({
  lap: i + 1,
  predicted: +(82.3 + i * 0.08 + Math.random() * 0.1).toFixed(3),
  actual: i < 10 ? +(82.5 + Math.random() * 0.5).toFixed(3) : undefined,
}));

const anomalyData = Array.from({ length: 40 }, (_, i) => ({
  t: i,
  value: 50 + Math.sin(i / 4) * 25 + Math.random() * 8,
  threshold: 72,
}));

const risks = [
  { level: 'High', msg: 'FL/FR tire wear critical — pit in 18 laps', confidence: 92, color: 'red' },
  { level: 'Medium', msg: 'Brake pad wear accelerating above norm', confidence: 78, color: 'amber' },
  { level: 'Low', msg: 'Fuel consumption within expected range', confidence: 95, color: 'emerald' },
  { level: 'Medium', msg: 'Engine vibration slightly elevated', confidence: 68, color: 'amber' },
  { level: 'Low', msg: 'Hydraulic pressure nominal', confidence: 97, color: 'emerald' },
];

export default function PredictivePage() {
  return (
    <Layout>
      <div className="p-5 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Predictive Analytics</h1>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-blue-400 text-xs font-semibold flex items-center gap-1">
            <Cpu className="w-3 h-3" /> AI Model
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: TrendingDown, color: 'text-orange-400', iconBg: 'bg-orange-500/10', label: 'Tire Life Remaining', value: '18', unit: 'laps' },
            { icon: CheckCircle, color: 'text-emerald-400', iconBg: 'bg-emerald-500/10', label: 'Predicted Finish', value: '1:45:23', unit: '±2 min' },
            { icon: CheckCircle, color: 'text-blue-400', iconBg: 'bg-blue-500/10', label: 'Engine Health', value: '94%', unit: 'nominal' },
            { icon: AlertTriangle, color: 'text-amber-400', iconBg: 'bg-amber-500/10', label: 'Active Alerts', value: '2', unit: 'medium risk' },
          ].map(({ icon: Icon, color, iconBg, label, value, unit }) => (
            <div key={label} className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex items-start gap-4">
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-slate-600 text-xs">{unit}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tire wear */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-1">Tire Wear Forecast</h3>
            <p className="text-slate-500 text-xs mb-4">Projected degradation over race distance</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={tireWear}>
                <defs>
                  {['fl', 'fr', 'rl', 'rr'].map((w, i) => (
                    <linearGradient key={w} id={`g${w}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={['#ef4444', '#f97316', '#3b82f6', '#0ea5e9'][i]} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={['#ef4444', '#f97316', '#3b82f6', '#0ea5e9'][i]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="lap" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Area type="monotone" dataKey="fl" stroke="#ef4444" fill="url(#gfl)" strokeWidth={1.5} dot={false} name="FL" />
                <Area type="monotone" dataKey="fr" stroke="#f97316" fill="url(#gfr)" strokeWidth={1.5} dot={false} name="FR" />
                <Area type="monotone" dataKey="rl" stroke="#3b82f6" fill="url(#grl)" strokeWidth={1.5} dot={false} name="RL" />
                <Area type="monotone" dataKey="rr" stroke="#0ea5e9" fill="url(#grr)" strokeWidth={1.5} dot={false} name="RR" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Lap projection */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-1">Lap Time Projection</h3>
            <p className="text-slate-500 text-xs mb-4">Predicted vs actual lap times</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lapProjection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="lap" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[81, 85]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} dot={false} name="Predicted" strokeDasharray="5 3" />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={false} name="Actual" connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Anomaly */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-1">Anomaly Detection</h3>
            <p className="text-slate-500 text-xs mb-4">Engine sensor deviation monitoring</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={anomalyData}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="t" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#ag)" strokeWidth={2} dot={false} name="Sensor" />
                <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Threshold" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Risk list */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Risk Assessment
            </h3>
            <div className="space-y-3">
              {risks.map((r, i) => (
                <div key={i} className={`p-3.5 rounded-xl border ${
                  r.color === 'red' ? 'bg-red-500/8 border-red-500/20' :
                  r.color === 'amber' ? 'bg-amber-500/8 border-amber-500/20' :
                  'bg-emerald-500/8 border-emerald-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${r.color === 'red' ? 'text-red-400' : r.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>{r.level}</span>
                    <span className="text-xs text-slate-500">{r.confidence}% confidence</span>
                  </div>
                  <p className="text-sm text-slate-300">{r.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
