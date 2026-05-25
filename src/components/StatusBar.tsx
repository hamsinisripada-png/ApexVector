import { useTelemetryContext } from '../contexts/TelemetryContext';

function fmtTime(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

export default function StatusBar() {
  const { current, session } = useTelemetryContext();

  return (
    <div className="h-9 bg-slate-950 border-b border-slate-800/80 flex items-center px-4 gap-6 text-xs font-mono shrink-0 overflow-x-auto">
      {/* Live badge */}
      <div className="flex items-center gap-1.5 shrink-0">
        {session.running ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-semibold">LIVE</span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-slate-500">IDLE</span>
          </>
        )}
      </div>

      <div className="w-px h-4 bg-slate-800 shrink-0" />

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-slate-500">SPD</span>
        <span className={`font-bold ${session.running ? 'text-blue-400' : 'text-slate-600'}`}>
          {current?.speed ?? 0}
        </span>
        <span className="text-slate-600">km/h</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-slate-500">GEAR</span>
        <span className={`font-bold ${session.running ? 'text-white' : 'text-slate-600'}`}>
          {current?.gear ?? '-'}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-slate-500">RPM</span>
        <span className={`font-bold ${(current?.rpm ?? 0) > 11500 ? 'text-red-400' : session.running ? 'text-amber-400' : 'text-slate-600'}`}>
          {current?.rpm?.toLocaleString() ?? '–'}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-slate-500">LAP</span>
        <span className={`font-bold ${session.running ? 'text-white' : 'text-slate-600'}`}>
          {session.running ? session.lap : '–'}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-slate-500">TIME</span>
        <span className={`font-bold ${session.running ? 'text-emerald-400' : 'text-slate-600'}`}>
          {session.running ? fmtTime(session.elapsed) : '--:--.-–'}
        </span>
      </div>

      {current?.drs && session.running && (
        <div className="shrink-0 px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400 text-[10px] font-bold">
          DRS
        </div>
      )}

      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <span className="text-slate-500">FUEL</span>
        <span className={`font-bold ${(current?.fuel ?? 100) < 20 ? 'text-red-400' : (current?.fuel ?? 100) < 40 ? 'text-amber-400' : 'text-slate-400'}`}>
          {current?.fuel?.toFixed(1) ?? '100.0'}%
        </span>
      </div>
    </div>
  );
}
