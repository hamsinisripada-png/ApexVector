import { useRef, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
// supabase imported lazily via dynamic import in PDF handler
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { Download, Share2, CheckCircle } from 'lucide-react';

const sectorData = [
  { sector: 'S1', you: 25.4, rival: 25.1 },
  { sector: 'S2', you: 28.2, rival: 28.9 },
  { sector: 'S3', you: 27.1, rival: 26.8 },
];

const radarData = [
  { subject: 'Acceleration', A: 88, B: 72 },
  { subject: 'Cornering', A: 79, B: 85 },
  { subject: 'Braking', A: 91, B: 78 },
  { subject: 'Consistency', A: 83, B: 90 },
  { subject: 'Tire Mgmt', A: 76, B: 82 },
  { subject: 'Racing Line', A: 85, B: 79 },
];

const lapDeltaData = Array.from({ length: 20 }, (_, i) => ({
  lap: i + 1,
  delta: +(Math.random() * 0.6 - 0.3).toFixed(3),
}));

const cornerData = [
  { corner: 'Turn 1', apex: '145 km/h', rating: 8.5 },
  { corner: 'Turn 3', apex: '132 km/h', rating: 7.8 },
  { corner: 'Turn 5', apex: '156 km/h', rating: 9.2 },
  { corner: 'Turn 7', apex: '178 km/h', rating: 8.9 },
  { corner: 'Turn 10', apex: '98 km/h', rating: 7.1 },
];

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  const [copying, setCopying] = useState(false);

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0f172a', scale: 1.5 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 1.5, canvas.height / 1.5] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 1.5, canvas.height / 1.5);
    pdf.save(`apexvector-analytics-${Date.now()}.pdf`);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/analytics?driver=${encodeURIComponent(profile?.favorite_driver ?? 'Driver')}&team=${encodeURIComponent(profile?.team_name ?? 'Team')}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch {
      window.prompt('Copy this link:', shareUrl);
    }
  };

  return (
    <Layout>
      <div className="p-5 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Driver Analytics</h1>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition"
            >
              {copying ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              {copying ? 'Copied!' : 'Share Report'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div ref={reportRef} className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Best Lap', value: '1:23.456', color: 'text-white' },
              { label: 'Avg Gap vs Rival', value: '+0.234s', color: 'text-red-400' },
              { label: 'Consistency', value: '8.2/10', color: 'text-emerald-400' },
              { label: 'Laps Analyzed', value: '42', color: 'text-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">{label}</p>
                <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sector comparison */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Sector Performance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sectorData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="sector" stroke="#475569" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[24, 30]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="you" fill="#3b82f6" name="You" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="rival" fill="#ef4444" name="Rival" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lap delta */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Lap Delta vs Best</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lapDeltaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="lap" stroke="#475569" tick={{ fontSize: 11 }} label={{ value: 'Lap', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} formatter={v => [`${(v as number) > 0 ? '+' : ''}${v}s`]} />
                  <Line type="monotone" dataKey="delta" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Delta (s)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Radar */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Performance Radar</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#475569" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis stroke="#334155" tick={{ fontSize: 9 }} />
                  <Radar name="You" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  <Radar name="Rival" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Cornering */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Cornering Analysis</h3>
              <div className="space-y-3">
                {cornerData.map(c => (
                  <div key={c.corner} className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm w-16 shrink-0">{c.corner}</span>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 bg-slate-800 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${c.rating * 10}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-semibold w-10 text-right">{c.rating}</span>
                    </div>
                    <span className="text-slate-500 text-xs w-20 text-right">{c.apex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
