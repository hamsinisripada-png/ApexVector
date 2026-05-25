import { useState, useRef, useCallback, useEffect } from 'react';

export type TelemetryPoint = {
  ts: number;
  speed: number;
  rpm: number;
  throttle: number;
  brake: number;
  gear: number;
  drs: boolean;
  tireTempFL: number;
  tireTempFR: number;
  tireTempRL: number;
  tireTempRR: number;
  brakeTempFL: number;
  brakeTempFR: number;
  brakeTempRL: number;
  brakeTempRR: number;
  fuel: number;
  lapProgress: number; // 0–1
};

export type SessionState = {
  running: boolean;
  elapsed: number; // ms
  lap: number;
  lastLapMs: number | null;
  lapStartMs: number;
};

export type Alert = {
  id: string;
  severity: 'warning' | 'critical';
  message: string;
  ts: number;
};

const BUFFER = 50;
const INTERVAL_MS = 500;
const LAP_DURATION_MS = 90_000; // 90 s per simulated lap

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

let _phase = 0; // global sim phase so multiple instances stay in sync

function generatePoint(prevPoint: TelemetryPoint | null, lapProg: number, lap: number): TelemetryPoint {
  _phase += 0.05;
  const throttleCurve = clamp(Math.sin(_phase) * 60 + 60 + (Math.random() - 0.5) * 20, 0, 100);
  const brakeCurve = clamp((1 - throttleCurve / 100) * 80 * Math.abs(Math.sin(_phase * 1.3)) + Math.random() * 10, 0, 100);
  const gear = Math.min(8, Math.max(1, Math.round(throttleCurve / 14) + 1));
  const speed = clamp(gear * 45 + throttleCurve * 0.9 + Math.random() * 15 - 7, 0, 340);
  const rpm = clamp(speed * 35 + 2000 + (Math.random() - 0.5) * 800, 4000, 12500);
  const fuelBase = prevPoint ? prevPoint.fuel - 0.012 : 100;
  const fuel = clamp(fuelBase - Math.random() * 0.005, 0, 100);

  const tireDeg = clamp(50 + lap * 3 + lapProg * 20 + Math.random() * 8, 70, 110);
  const brakeHeat = clamp(brakeCurve * 7 + 150 + Math.random() * 40, 200, 800);

  return {
    ts: Date.now(),
    speed: Math.round(speed),
    rpm: Math.round(rpm),
    throttle: Math.round(throttleCurve),
    brake: Math.round(brakeCurve),
    gear,
    drs: speed > 200 && brakeCurve < 5,
    tireTempFL: Math.round(tireDeg + Math.random() * 6),
    tireTempFR: Math.round(tireDeg + Math.random() * 6),
    tireTempRL: Math.round(tireDeg + 4 + Math.random() * 6),
    tireTempRR: Math.round(tireDeg + 4 + Math.random() * 6),
    brakeTempFL: Math.round(brakeHeat + Math.random() * 60),
    brakeTempFR: Math.round(brakeHeat + Math.random() * 60),
    brakeTempRL: Math.round(brakeHeat * 0.85 + Math.random() * 40),
    brakeTempRR: Math.round(brakeHeat * 0.85 + Math.random() * 40),
    fuel: +fuel.toFixed(2),
    lapProgress: lapProg,
  };
}

export function useTelemetry() {
  const [buffer, setBuffer] = useState<TelemetryPoint[]>([]);
  const [session, setSession] = useState<SessionState>({
    running: false,
    elapsed: 0,
    lap: 1,
    lastLapMs: null,
    lapStartMs: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [ended, setEnded] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef(session);
  const bufferRef = useRef<TelemetryPoint[]>([]);
  const startTimeRef = useRef<number>(0);
  const rpmOverRef = useRef<number>(0); // ms above 12000

  sessionRef.current = session;

  const addAlert = useCallback((severity: Alert['severity'], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setAlerts(prev => [...prev.slice(-4), { id, severity, message, ts: Date.now() }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 4000);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const start = useCallback(() => {
    _phase = 0;
    startTimeRef.current = Date.now();
    rpmOverRef.current = 0;
    bufferRef.current = [];
    setBuffer([]);
    setEnded(false);
    setSession({ running: true, elapsed: 0, lap: 1, lastLapMs: null, lapStartMs: Date.now() });

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - startTimeRef.current;
      const lapElapsed = now - sessionRef.current.lapStartMs;
      const lapProg = (lapElapsed % LAP_DURATION_MS) / LAP_DURATION_MS;
      const newLap = Math.floor(elapsedMs / LAP_DURATION_MS) + 1;

      const prev = bufferRef.current[bufferRef.current.length - 1] ?? null;
      const pt = generatePoint(prev, lapProg, newLap);

      // Lap change
      if (newLap !== sessionRef.current.lap) {
        const lastLapMs = lapElapsed;
        setSession(s => ({ ...s, lap: newLap, lastLapMs, lapStartMs: now }));
      } else {
        setSession(s => ({ ...s, elapsed: elapsedMs }));
      }

      // Alerts
      if (pt.tireTempFL > 100 || pt.tireTempFR > 100 || pt.tireTempRL > 100 || pt.tireTempRR > 100) {
        addAlert('warning', 'Tyre Overheating — Reduce cornering load');
      }
      if (pt.brakeTempFL > 700 || pt.brakeTempFR > 700) {
        addAlert('critical', 'Brake Temperature Critical — Brake bias adjustment needed');
      }
      if (pt.fuel < 20) {
        addAlert('warning', 'Low Fuel Warning — Consider pitting');
      }
      if (pt.rpm > 12000) {
        rpmOverRef.current += INTERVAL_MS;
        if (rpmOverRef.current >= 3000) {
          addAlert('critical', 'Engine Stress Detected — Lift and coast');
          rpmOverRef.current = 0;
        }
      } else {
        rpmOverRef.current = 0;
      }

      bufferRef.current = [...bufferRef.current.slice(-(BUFFER - 1)), pt];
      setBuffer([...bufferRef.current]);
    }, INTERVAL_MS);
  }, [addAlert]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSession(s => ({ ...s, running: false }));
    setEnded(true);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    _phase = 0;
    bufferRef.current = [];
    rpmOverRef.current = 0;
    setBuffer([]);
    setAlerts([]);
    setEnded(false);
    setSession({ running: false, elapsed: 0, lap: 1, lastLapMs: null, lapStartMs: 0 });
  }, []);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const current = buffer[buffer.length - 1] ?? null;

  return { buffer, current, session, alerts, ended, dismissAlert, start, stop, reset };
}
