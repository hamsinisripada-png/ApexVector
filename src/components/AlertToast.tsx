import { X, AlertTriangle, Flame } from 'lucide-react';
import type { Alert } from '../hooks/useTelemetry';

export default function AlertToast({ alerts, dismiss }: { alerts: Alert[]; dismiss: (id: string) => void }) {
  if (alerts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {alerts.map(a => (
        <div
          key={a.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm animate-slide-in ${
            a.severity === 'critical'
              ? 'bg-red-950/90 border-red-500/50 text-red-100'
              : 'bg-amber-950/90 border-amber-500/50 text-amber-100'
          }`}
        >
          {a.severity === 'critical'
            ? <Flame className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
          <p className="text-sm font-medium flex-1">{a.message}</p>
          <button onClick={() => dismiss(a.id)} className="opacity-60 hover:opacity-100 transition shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
