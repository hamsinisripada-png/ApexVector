import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTelemetryContext } from '../contexts/TelemetryContext';
import { Radio, Send, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type Msg = { id: string; role: 'user' | 'assistant'; content: string; created_at: string };

const liveAlerts = [
  { level: 'CRITICAL', msg: 'Safety car deployed — prepare for VSC procedure', color: 'red' },
  { level: 'WARNING', msg: 'Car 1 tires approaching wear threshold', color: 'amber' },
  { level: 'INFO', msg: 'Car 2 clean pit stop — net gain +2.1s', color: 'blue' },
  { level: 'INFO', msg: 'P2 gap closing at 0.2s per lap', color: 'blue' },
];

function buildAIResponse(input: string, current: ReturnType<typeof useTelemetryContext>['current'], session: ReturnType<typeof useTelemetryContext>['session']): string {
  const q = input.toLowerCase();
  const spd = current?.speed ?? 0;
  const rpm = current?.rpm ?? 0;
  const throttle = current?.throttle ?? 0;
  const brake = current?.brake ?? 0;
  const fuel = current?.fuel ?? 100;
  const tireTempMax = current ? Math.max(current.tireTempFL, current.tireTempFR, current.tireTempRL, current.tireTempRR) : 90;
  const brakeTempMax = current ? Math.max(current.brakeTempFL, current.brakeTempFR, current.brakeTempRL, current.brakeTempRR) : 250;
  const lap = session.lap;
  const running = session.running;

  if (!running) {
    return 'No active session. Start a live session on the Dashboard to get real-time telemetry analysis.';
  }

  if (q.includes('pit') || q.includes('stop') || q.includes('box')) {
    if (fuel < 30) return `Fuel at ${fuel.toFixed(1)}% — I strongly recommend boxing this lap. Tire temps also at ${tireTempMax}°C. Window is optimal.`;
    if (tireTempMax > 102) return `Tire temperatures critical at ${tireTempMax}°C. Recommend pit in next 2–3 laps. Current lap ${lap}.`;
    return `Current lap ${lap}. Fuel at ${fuel.toFixed(1)}%, tires at ${tireTempMax}°C — optimal pit window is Lap 28–31. Hold for now unless tire temps exceed 105°C.`;
  }

  if (q.includes('tyre') || q.includes('tire') || q.includes('rubber')) {
    const status = tireTempMax > 105 ? 'CRITICAL' : tireTempMax > 95 ? 'elevated' : 'nominal';
    return `Tyre status: FL ${current?.tireTempFL}°C | FR ${current?.tireTempFR}°C | RL ${current?.tireTempRL}°C | RR ${current?.tireTempRR}°C. Overall: ${status}. ${tireTempMax > 100 ? 'Recommend reducing cornering load through high-speed sections.' : 'Temperatures within operating window.'}`;
  }

  if (q.includes('engine') || q.includes('rpm') || q.includes('motor')) {
    const health = rpm > 12000 ? 'STRESSED — lift and coast recommended' : rpm > 11000 ? 'high — monitor closely' : 'nominal';
    return `Engine RPM: ${rpm.toLocaleString()} rev/min. Health: ${health}. Brake temps at ${brakeTempMax}°C. ${rpm > 11500 ? 'Suggest backing off 200–300 RPM through straights to protect the power unit.' : 'All systems nominal.'}`;
  }

  if (q.includes('fuel') || q.includes('petrol') || q.includes('gas')) {
    const lapsLeft = Math.round((fuel / 100) * 56);
    return `Fuel load: ${fuel.toFixed(1)}%. At current consumption rate, estimated ${lapsLeft} laps remaining. ${fuel < 25 ? 'LOW FUEL — pit immediately or reduce pace.' : fuel < 40 ? 'Monitor closely. Fuel save mode recommended in low-speed sectors.' : 'Sufficient for planned strategy.'}`;
  }

  if (q.includes('sector') || q.includes('lap time') || q.includes('fastest') || q.includes('pace')) {
    return `Current pace data: Speed ${spd} km/h | Throttle ${throttle}% | Brake ${brake}%. ${throttle > 80 ? 'Strong throttle application noted.' : 'Throttle below average — check traction zones.'} Last sector performance suggests ${throttle > 75 ? 'competitive pace' : 'potential for improvement through mid-corner speed'}.`;
  }

  if (q.includes('brake') || q.includes('braking')) {
    const bStatus = brakeTempMax > 700 ? 'CRITICAL — adjust bias forward' : brakeTempMax > 500 ? 'high — watch cooling' : 'nominal';
    return `Brake temps: FL ${current?.brakeTempFL}°C | FR ${current?.brakeTempFR}°C | RL ${current?.brakeTempRL}°C | RR ${current?.brakeTempRR}°C. Status: ${bStatus}.`;
  }

  if (q.includes('drs')) {
    return current?.drs ? 'DRS currently ACTIVE. Speed above 200 km/h with clear air ahead. Maximum straight-line advantage being used.' : 'DRS currently inactive. Activate when within 1 second of car ahead on detection point.';
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return `Race engineer online. Lap ${lap}, speed ${spd} km/h, all systems ${brakeTempMax < 600 && tireTempMax < 100 && rpm < 11500 ? 'nominal' : 'require attention'}. How can I assist?`;
  }

  return `Current telemetry — Lap ${lap} | Speed: ${spd} km/h | RPM: ${rpm.toLocaleString()} | Fuel: ${fuel.toFixed(1)}% | Max tyre temp: ${tireTempMax}°C. Ask me about tires, fuel, engine, brakes, sectors, or pit strategy.`;
}

export default function CommandCenterPage() {
  const { user, profile } = useAuth();
  const { current, session } = useTelemetryContext();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lapCount, setLapCount] = useState(32);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) loadMessages();
    const interval = setInterval(() => setLapCount(l => Math.min(l + 1, 56)), 90000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true })
      .limit(50);
    setMessages((data as Msg[]) ?? []);
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    const { data: userMsg } = await supabase
      .from('ai_chat_messages')
      .insert({ user_id: user.id, role: 'user', content })
      .select()
      .single();
    if (userMsg) setMessages(m => [...m, userMsg as Msg]);

    await new Promise(r => setTimeout(r, 600 + Math.random() * 500));
    const reply = buildAIResponse(content, current, session);
    const { data: aiMsg } = await supabase
      .from('ai_chat_messages')
      .insert({ user_id: user.id, role: 'assistant', content: reply })
      .select()
      .single();
    if (aiMsg) setMessages(m => [...m, aiMsg as Msg]);
    setSending(false);
  };

  const cars = [
    { num: profile?.car_number || '1', label: 'Car 1', pos: '1st', gap: '+3.452s', color: 'red' },
    { num: '2', label: 'Car 2', pos: '3rd', gap: '+8.234s', color: 'blue' },
  ];

  const quickPrompts = ['Should I pit?', 'Tyre status?', 'Engine health?', 'Fuel estimate?', 'Brake temps?'];

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Team Command Center</h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/25 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold">RACE LIVE</span>
          </div>
        </div>

        {/* Car status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cars.map(c => (
            <div key={c.num} className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold text-lg shrink-0 ${c.color === 'red' ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-blue-500 text-blue-400 bg-blue-500/10'}`}>
                #{c.num}
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">{c.label}</p>
                <p className="text-white text-xl font-bold">{c.pos}</p>
                <p className="text-slate-500 text-xs">{c.gap}</p>
              </div>
            </div>
          ))}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Race Progress</p>
              <p className="text-white text-xl font-bold">Lap {session.running ? session.lap : lapCount}</p>
              <p className="text-slate-500 text-xs">of 56</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Live alerts */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" /> Live Alerts
            </h3>
            <div className="space-y-3">
              {liveAlerts.map((a, i) => {
                const Icon = a.color === 'red' ? AlertCircle : a.color === 'amber' ? AlertTriangle : Info;
                return (
                  <div key={i} className={`p-3.5 rounded-xl border ${
                    a.color === 'red' ? 'bg-red-500/8 border-red-500/20' :
                    a.color === 'amber' ? 'bg-amber-500/8 border-amber-500/20' :
                    'bg-blue-500/8 border-blue-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${a.color === 'red' ? 'text-red-400' : a.color === 'amber' ? 'text-amber-400' : 'text-blue-400'}`} />
                      <span className={`text-xs font-bold ${a.color === 'red' ? 'text-red-400' : a.color === 'amber' ? 'text-amber-400' : 'text-blue-400'}`}>{a.level}</span>
                    </div>
                    <p className="text-sm text-slate-300">{a.msg}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Radio */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col">
            <h3 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" /> AI Race Engineer
              {session.running && <span className="ml-auto text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full font-semibold">LIVE DATA</span>}
            </h3>

            {/* Quick prompts */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {quickPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => setInput(p)}
                  className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-[200px] max-h-64 overflow-y-auto space-y-3 mb-4 pr-1">
              {messages.length === 0 ? (
                <p className="text-slate-600 text-sm text-center py-8">
                  {session.running ? 'Ask about current telemetry, pit strategy, tires...' : 'Start a session for real-time AI analysis'}
                </p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-red-600/70 text-white'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl">
                    <div className="flex gap-1 items-center">
                      {[0, 150, 300].map(delay => (
                        <span key={delay} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={session.running ? 'Ask about tires, fuel, engine...' : 'Message AI engineer...'}
                disabled={sending}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 transition disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Strategy board */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">Pit Wall Strategy Board</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { car: `Car #${profile?.car_number || '1'}`, strategy: 'One-stop: Medium → Hard', pit: 'Lap 28', fuel: '1.8 L/lap', stint: '18 laps remaining' },
              { car: 'Car #2', strategy: 'Two-stop: Soft → Medium → Hard', pit: 'Lap 25', fuel: '1.9 L/lap', stint: '8 laps to pit' },
            ].map(c => (
              <div key={c.car} className="border-l-4 border-l-blue-500 pl-4">
                <h4 className="font-semibold text-white mb-2 text-sm">{c.car}</h4>
                <div className="space-y-1.5 text-xs">
                  {[
                    ['Strategy', c.strategy, 'text-slate-300'],
                    ['Next Pit', c.pit, 'text-slate-300'],
                    ['Consumption', c.fuel, 'text-slate-300'],
                    ['Status', c.stint, 'text-amber-400'],
                  ].map(([k, v, cls]) => (
                    <div key={k as string} className="flex justify-between">
                      <span className="text-slate-500">{k}</span>
                      <span className={cls as string}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
