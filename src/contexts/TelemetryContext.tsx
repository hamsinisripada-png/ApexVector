import { createContext, useContext } from 'react';
import { useTelemetry, type TelemetryPoint, type SessionState, type Alert } from '../hooks/useTelemetry';

type TelemetryContextType = {
  buffer: TelemetryPoint[];
  current: TelemetryPoint | null;
  session: SessionState;
  alerts: Alert[];
  ended: boolean;
  dismissAlert: (id: string) => void;
  start: () => void;
  stop: () => void;
  reset: () => void;
};

const TelemetryContext = createContext<TelemetryContextType>({
  buffer: [],
  current: null,
  session: { running: false, elapsed: 0, lap: 1, lastLapMs: null, lapStartMs: 0 },
  alerts: [],
  ended: false,
  dismissAlert: () => {},
  start: () => {},
  stop: () => {},
  reset: () => {},
});

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const telemetry = useTelemetry();
  return (
    <TelemetryContext.Provider value={telemetry}>
      {children}
    </TelemetryContext.Provider>
  );
}

export const useTelemetryContext = () => useContext(TelemetryContext);
