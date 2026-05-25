import { Link } from 'react-router-dom';
import { Zap, TrendingUp, BarChart3, Eye, ArrowRight, CheckCircle, Radio } from 'lucide-react';

const features = [
  {
    icon: Zap,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    title: 'Live Telemetry',
    desc: 'Real-time speed, RPM, temperatures and vehicle dynamics at 1Hz precision.',
  },
  {
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'AI Race Strategy',
    desc: 'Intelligent pit stop windows, compound selection, and fuel targets.',
  },
  {
    icon: BarChart3,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Driver Analytics',
    desc: 'Sector comparisons, lap deltas, cornering efficiency, and radar scoring.',
  },
  {
    icon: Eye,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Predictive Models',
    desc: 'Tire wear forecasting, anomaly detection, and lap time projections.',
  },
  {
    icon: Radio,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Command Center',
    desc: 'Multi-car pit wall with live alerts and team radio communications.',
  },
  {
    icon: CheckCircle,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'PDF & Share Export',
    desc: 'Export driver reports as styled PDFs or share with a unique link.',
  },
];

const stats = [
  { value: '< 50ms', label: 'Telemetry latency' },
  { value: '99.9%', label: 'Platform uptime' },
  { value: '10+', label: 'Analytics modules' },
  { value: 'AI', label: 'Powered strategy' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ApexVector</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition">Sign In</Link>
            <Link
              to="/signup"
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/8 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/25 text-red-400 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            AI-Powered Motorsport Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Engineer your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">
              fastest lap
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-time telemetry, AI race strategy, predictive analytics, and pit wall command center — everything a modern racing team needs.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-7 py-3.5 rounded-xl transition shadow-lg shadow-red-500/20"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-xl transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-800/60">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
              <p className="text-slate-500 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything your team needs</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Purpose-built tools for race engineers, data analysts, and drivers who demand precision.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-all hover:-translate-y-0.5">
                <div className={`w-11 h-11 rounded-xl border ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl px-8 py-14">
          <Zap className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to reach the apex?</h2>
          <p className="text-slate-400 mb-8">Join now and set up your team profile in under 2 minutes.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-4 rounded-xl transition shadow-lg shadow-red-500/20"
          >
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-slate-600 text-sm border-t border-slate-800/60">
        © {new Date().getFullYear()} ApexVector. All rights reserved.
      </footer>
    </div>
  );
}
