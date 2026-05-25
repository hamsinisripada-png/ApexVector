import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ApexVector</span>
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-slate-400 mt-2">{subtitle}</p>
        </div>
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
